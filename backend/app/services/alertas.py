"""Geração de alertas pelo sistema (por threshold, sem IA).

Regra: um alerta ATIVO por ponte. Abre quando a ponte entra em
congestionado/bloqueado e ainda não há alerta ativo; resolve (marca
resolvido_em) quando a ponte volta a normal/atenção. Persistido na tabela
`alertas` — vira um log que cresce e se resolve ao longo do tempo.
"""
from __future__ import annotations

from datetime import datetime
from typing import NamedTuple

from .compute import SENSOR_LABEL, derive_status

EM_ALERTA = {"congestionado", "bloqueado"}


class StatusAtual(NamedTuple):
    ponte_id: str
    nome: str
    status: str
    ocupacao: int


def nivel_para(status: str) -> str:
    return "critico" if status == "bloqueado" else "alto"


def decidir(statuses: list[StatusAtual], ativos: set[str]) -> tuple[list[StatusAtual], list[str]]:
    """Decide o que abrir e o que resolver. Função pura — testável.

    Retorna (a_criar, a_resolver_ponte_ids).
    """
    criar: list[StatusAtual] = []
    resolver: list[str] = []
    for s in statuses:
        em_alerta = s.status in EM_ALERTA
        tem_ativo = s.ponte_id in ativos
        if em_alerta and not tem_ativo:
            criar.append(s)
        elif not em_alerta and tem_ativo:
            resolver.append(s.ponte_id)
    return criar, resolver


async def _status_atual(conn) -> list[StatusAtual]:
    """Status corrente por ponte = leitura da hora mais próxima de agora."""
    dia = await conn.fetchval("SELECT max(timestamp)::date FROM leituras_sensor")
    if dia is None:
        return []
    hora = datetime.now().hour
    pontes = await conn.fetch("SELECT id, nome FROM pontes WHERE ativa")
    out: list[StatusAtual] = []
    for p in pontes:
        rows = await conn.fetch(
            "SELECT extract(hour FROM timestamp)::int AS h, ocupacao_pct "
            "FROM leituras_sensor WHERE ponte_id = $1 AND timestamp::date = $2",
            p["id"], dia,
        )
        if not rows:
            continue
        best = min(rows, key=lambda r: abs(r["h"] - hora))
        out.append(StatusAtual(p["id"], p["nome"], derive_status(best["ocupacao_pct"]),
                               best["ocupacao_pct"]))
    return out


async def sincronizar_alertas(conn) -> tuple[list[StatusAtual], list[str]]:
    """Abre/resolve alertas conforme o status atual. Retorna (criados, resolvidos)."""
    statuses = await _status_atual(conn)
    ativos = {
        r["ponte_id"]
        for r in await conn.fetch(
            "SELECT DISTINCT ponte_id FROM alertas WHERE resolvido_em IS NULL"
        )
    }
    criar, resolver = decidir(statuses, ativos)

    for s in criar:
        sensor = SENSOR_LABEL.get(s.ponte_id, "CTTU")
        await conn.execute(
            "INSERT INTO alertas (ponte_id, tipo, nivel, mensagem, gerado_por_ia) "
            "VALUES ($1, 'congestionamento', $2, $3, FALSE)",
            s.ponte_id, nivel_para(s.status),
            f"{s.nome}: ocupação em {s.ocupacao}% — sensor {sensor} (threshold)",
        )
    for pid in resolver:
        await conn.execute(
            "UPDATE alertas SET resolvido_em = now() "
            "WHERE ponte_id = $1 AND resolvido_em IS NULL",
            pid,
        )
    return criar, resolver
