"""Insere as 3 pontes do Bairro do Recife (idempotente).

Rodar de dentro de backend/:  python -m seed.seed_pontes
"""
import asyncio
import sys
from pathlib import Path

import asyncpg

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.config import settings  # noqa: E402

# Mesmos dados de src/data/mockData.ts
PONTES = [
    ("buarque-de-macedo", "Buarque de Macedo", "Ponte Buarque de Macedo", 800, -8.0598, -34.8741),
    ("mauricio-nassau", "Maurício de Nassau", "Ponte Maurício de Nassau", 1000, -8.0635, -34.8719),
    ("giratoria", "Giratória", "Ponte Giratória (Ponte Velha)", 600, -8.0660, -34.8735),
]


async def main() -> None:
    conn = await asyncpg.connect(dsn=settings.database_url)
    try:
        await conn.executemany(
            """
            INSERT INTO pontes (id, nome, nome_completo, capacidade_veiculos, lat, lng)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
              nome = EXCLUDED.nome,
              nome_completo = EXCLUDED.nome_completo,
              capacidade_veiculos = EXCLUDED.capacidade_veiculos,
              lat = EXCLUDED.lat,
              lng = EXCLUDED.lng
            """,
            PONTES,
        )
        n = await conn.fetchval("SELECT count(*) FROM pontes")
        print(f"pontes: {n} registros")
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(main())
