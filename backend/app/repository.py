"""Acesso ao banco. Encapsula todo o SQL; os routers só falam com o repositório.

Trabalha sempre sobre o dia mais recente disponível em leituras_sensor, para que
o dashboard mostre dados independentemente de quando o ingest rodou.
"""
from __future__ import annotations

from datetime import date
from typing import Optional, Protocol

from .schemas import Coordenadas, LeituraSensor, Ponte


def _ponte_from_row(row) -> Ponte:
    return Ponte(
        id=row["id"],
        nome=row["nome"],
        nome_completo=row["nome_completo"],
        capacidade_veiculos=row["capacidade_veiculos"],
        coordenadas=Coordenadas(lat=row["lat"], lng=row["lng"]),
    )


def _leitura_from_row(row) -> LeituraSensor:
    return LeituraSensor(
        ponte_id=row["ponte_id"],
        timestamp=row["timestamp"],
        veiculos_por_hora=row["veiculos_por_hora"],
        ocupacao_pct=row["ocupacao_pct"],
        velocidade_media=row["velocidade_media"],
        tempo_de_travessia=row["tempo_travessia"],
    )


class Repository(Protocol):
    async def get_pontes(self) -> list[Ponte]: ...
    async def latest_day(self) -> Optional[date]: ...
    async def get_leituras(self, ponte_id: str, dia: date) -> list[LeituraSensor]: ...
    async def ping(self) -> bool: ...


class PgRepository:
    """Implementação sobre PostgreSQL/TimescaleDB via pool asyncpg."""

    def __init__(self, pool):
        self.pool = pool

    async def get_pontes(self) -> list[Ponte]:
        rows = await self.pool.fetch(
            "SELECT id, nome, nome_completo, capacidade_veiculos, lat, lng "
            "FROM pontes WHERE ativa ORDER BY nome"
        )
        return [_ponte_from_row(r) for r in rows]

    async def latest_day(self) -> Optional[date]:
        val = await self.pool.fetchval(
            "SELECT max(timestamp)::date FROM leituras_sensor"
        )
        return val

    async def get_leituras(self, ponte_id: str, dia: date) -> list[LeituraSensor]:
        rows = await self.pool.fetch(
            "SELECT ponte_id, timestamp, veiculos_por_hora, ocupacao_pct, "
            "       velocidade_media, tempo_travessia "
            "FROM leituras_sensor "
            "WHERE ponte_id = $1 AND timestamp::date = $2 "
            "ORDER BY timestamp",
            ponte_id,
            dia,
        )
        return [_leitura_from_row(r) for r in rows]

    async def ping(self) -> bool:
        return await self.pool.fetchval("SELECT 1") == 1
