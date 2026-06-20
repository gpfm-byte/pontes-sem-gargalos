"""Ingestão do dado aberto da CTTU → leituras_sensor.

Busca a velocidade das vias 2018 dos 2 sensores do Bairro do Recife (FS002REC,
FS003REC) no portal de dados abertos, agrega por hora, calibra por ponte e grava
as leituras. Idempotente: limpa as leituras anteriores antes de inserir.

Rodar de dentro de backend/:  python -m seed.ingest_cttu
"""
import asyncio
import sys
from datetime import date
from pathlib import Path

import asyncpg
import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.config import settings  # noqa: E402
from app.services import cttu  # noqa: E402
from app.services.ingest_math import build_leituras  # noqa: E402

# Pontes e seus sensores (FS002REC atende 2 pontes).
PONTES = list(cttu.SENSOR_MAP.keys())


async def fetch_sensor(client: httpx.AsyncClient, equipamento: str) -> list[dict]:
    """Busca os registros de um sensor para a data configurada."""
    params = {
        "resource_id": settings.cttu_resource,
        "filters": f'{{"equipamento":"{equipamento}","data":"{settings.cttu_data}"}}',
        "limit": "500",
    }
    url = f"{settings.cttu_base}/api/3/action/datastore_search"
    resp = await client.get(url, params=params, timeout=30.0)
    resp.raise_for_status()
    return resp.json().get("result", {}).get("records", [])


async def main() -> None:
    dia = date.today()
    all_rows = []

    async with httpx.AsyncClient() as client:
        # Cada sensor é buscado uma vez; FS002REC alimenta 2 pontes.
        cache: dict[str, dict[int, dict[str, float]]] = {}
        for ponte_id in PONTES:
            eq = str(cttu.SENSOR_MAP[ponte_id]["eq"])
            if eq not in cache:
                records = await fetch_sensor(client, eq)
                cache[eq] = cttu.aggregate(records)
                print(f"sensor {eq}: {len(records)} registros, "
                      f"{len(cache[eq])} horas")
            rows = build_leituras(ponte_id, cache[eq], dia)
            all_rows.extend(rows)

    if not all_rows:
        print("ERRO: nenhum registro retornado pela CTTU. Abortando.")
        sys.exit(1)

    conn = await asyncpg.connect(dsn=settings.database_url)
    try:
        await conn.execute("DELETE FROM leituras_sensor")
        await conn.executemany(
            "INSERT INTO leituras_sensor "
            "(ponte_id, timestamp, veiculos_por_hora, ocupacao_pct, "
            " velocidade_media, tempo_travessia, fonte) "
            "VALUES ($1, $2, $3, $4, $5, $6, $7)",
            all_rows,
        )
        n = await conn.fetchval("SELECT count(*) FROM leituras_sensor")
        print(f"leituras_sensor: {n} linhas gravadas (dia {dia})")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
