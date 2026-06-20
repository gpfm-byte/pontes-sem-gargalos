"""Pool de conexões asyncpg, criado no lifespan da aplicação."""
import asyncpg

from .config import settings


async def create_pool() -> asyncpg.Pool:
    # timezone=UTC garante round-trip consistente da hora das leituras.
    return await asyncpg.create_pool(
        dsn=settings.database_url,
        min_size=1,
        max_size=5,
        server_settings={"timezone": "UTC"},
    )
