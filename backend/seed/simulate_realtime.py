"""Simulador de conexão em tempo real com o sensor da CTTU.

Simula o que aconteceria se estivéssemos plugados ao feed ao vivo da CTTU: a cada
ciclo, "detecta" carros passando pelos sensores FS002REC/FS003REC ao redor do
baseline histórico da hora atual, recalcula ocupação/velocidade/status e grava a
leitura da hora corrente no banco (substituindo a anterior). O dashboard, fazendo
polling, reflete a variação ao vivo.

Uso (de dentro de backend/):
  .venv/bin/python -m seed.simulate_realtime                # infinito, ciclo 3s
  .venv/bin/python -m seed.simulate_realtime --interval 2 --ticks 10
"""
import argparse
import asyncio
import math
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

import asyncpg

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.config import settings  # noqa: E402
from app.services.cttu import CAPACIDADES, SENSOR_MAP  # noqa: E402
from app.services.compute import derive_status  # noqa: E402
from app.services.alertas import nivel_por_status, sincronizar_alertas  # noqa: E402

PONTES = list(CAPACIDADES.keys())

STATUS_ICON = {"normal": "🟢", "atencao": "🟡", "congestionado": "🟠", "bloqueado": "🔴"}


def poisson(lam: float) -> int:
    """Amostra Poisson (algoritmo de Knuth) — nº de carros detectados na janela."""
    if lam <= 0:
        return 0
    L = math.exp(-lam)
    k, p = 0, 1.0
    while True:
        k += 1
        p *= random.random()
        if p <= L:
            return k - 1


async def carregar_baseline(conn) -> dict[str, dict[int, tuple[int, float]]]:
    """Captura o baseline histórico (vph e velocidade) por ponte e hora.

    Lido UMA vez no início, antes de qualquer escrita, para o simulado oscilar
    em torno do dado real da CTTU e não derivar sobre si mesmo.
    """
    rows = await conn.fetch(
        "SELECT ponte_id, extract(hour FROM timestamp)::int AS h, "
        "       veiculos_por_hora, velocidade_media "
        "FROM leituras_sensor"
    )
    base: dict[str, dict[int, tuple[int, float]]] = {p: {} for p in PONTES}
    for r in rows:
        base.setdefault(r["ponte_id"], {})[r["h"]] = (
            r["veiculos_por_hora"],
            r["velocidade_media"] or 30.0,
        )
    return base


def baseline_para(base: dict, ponte: str, hora: int) -> tuple[int, float]:
    """vph/velocidade de referência para a hora; cai na hora mais próxima se faltar."""
    horas = base.get(ponte) or {}
    if not horas:
        return CAPACIDADES[ponte] // 2, 30.0
    if hora in horas:
        return horas[hora]
    h = min(horas, key=lambda x: abs(x - hora))
    return horas[h]


def simular_leitura(ponte: str, base: dict, hora: int):
    """Leitura ao vivo (vph/ocupação/velocidade/travessia/status) para a hora."""
    cap = CAPACIDADES[ponte]
    base_vph, base_vel = baseline_para(base, ponte, hora)

    # Oscilação realista em torno do baseline (ruído de detecção).
    live_vph = max(0, round(base_vph * (1 + random.uniform(-0.12, 0.12))))
    occ = min(100, round(live_vph / cap * 100)) if cap else 0
    vel = max(5, round(base_vel * (1.0 if occ < 70 else 0.65)))
    trav = round((0.8 / max(vel, 5)) * 60, 1)
    return live_vph, occ, float(vel), float(trav), derive_status(occ)


async def gravar(conn, ponte: str, ts: datetime, vph: int, occ: int, vel: float, trav: float):
    """Substitui a leitura da hora corrente (upsert por hora)."""
    async with conn.transaction():
        await conn.execute(
            "DELETE FROM leituras_sensor "
            "WHERE ponte_id = $1 AND timestamp::date = $2 "
            "AND extract(hour FROM timestamp)::int = $3",
            ponte, ts.date(), ts.hour,
        )
        await conn.execute(
            "INSERT INTO leituras_sensor "
            "(ponte_id, timestamp, veiculos_por_hora, ocupacao_pct, "
            " velocidade_media, tempo_travessia, fonte) "
            "VALUES ($1, $2, $3, $4, $5, $6, 'cttu-live')",
            ponte, ts, vph, occ, vel, trav,
        )


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--interval", type=float, default=3.0, help="segundos entre ciclos")
    ap.add_argument("--ticks", type=int, default=0, help="nº de ciclos (0 = infinito)")
    args = ap.parse_args()

    conn = await asyncpg.connect(dsn=settings.database_url)
    await conn.execute("SET timezone = 'UTC'")
    try:
        base = await carregar_baseline(conn)
        sensores = ", ".join(sorted({str(s["eq"]) for s in SENSOR_MAP.values()}))
        print(f"📡 Conectado ao feed (simulado) da CTTU — sensores {sensores}")
        print(f"   baseline histórico carregado · ciclo {args.interval}s\n")

        total: dict[str, int] = {p: 0 for p in PONTES}
        tick = 0
        while args.ticks == 0 or tick < args.ticks:
            tick += 1
            # Convenção de hora igual à ingestão: hora local rotulada como UTC.
            local = datetime.now()
            ts = datetime(local.year, local.month, local.day,
                          local.hour, local.minute, local.second, tzinfo=timezone.utc)

            print(f"⏱  ciclo {tick}  ({local:%H:%M:%S})")
            for ponte in PONTES:
                vph, occ, vel, trav, status = simular_leitura(ponte, base, ts.hour)
                # Carros detectados nesta janela ~ Poisson(taxa * intervalo).
                carros = poisson(vph * args.interval / 3600)
                total[ponte] += carros
                await gravar(conn, ponte, ts, vph, occ, vel, trav)
                eq = SENSOR_MAP[ponte]["eq"]
                print(f"   {STATUS_ICON[status]} {eq} → {ponte:<18} "
                      f"🚗 +{carros} (Σ {total[ponte]:>3}) | {vph:>4} v/h | "
                      f"{occ:>3}% ocup | {vel:>2.0f} km/h | {status}")

            # O sistema abre/escala/resolve alertas conforme o status muda.
            criados, atualizados, resolvidos = await sincronizar_alertas(conn)
            for s in criados:
                print(f"   🚨 ALERTA aberto: {s.nome} ({nivel_por_status(s.status)}) "
                      f"— {s.ocupacao}% ocupação")
            for s in atualizados:
                print(f"   🔀 alerta atualizado: {s.nome} → {nivel_por_status(s.status)} "
                      f"({s.ocupacao}%)")
            for pid in resolvidos:
                print(f"   ✅ alerta resolvido: {pid} (normalizou)")
            print()
            if args.ticks == 0 or tick < args.ticks:
                await asyncio.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n⏹  simulação interrompida")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
