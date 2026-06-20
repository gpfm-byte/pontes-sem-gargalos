"""Pontes Sem Gargalos / Veneza — API REST.

Serve o contrato consumido pelo dashboard (IPontesService) a partir do
PostgreSQL + TimescaleDB alimentado com o dado aberto da CTTU.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import create_pool
from .routers import alertas, fluxo, health, pontes, status


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = await create_pool()
    try:
        yield
    finally:
        await app.state.pool.close()


app = FastAPI(title="Pontes Sem Gargalos — API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_methods=["GET"],
    allow_headers=["*"],
)

for r in (pontes, status, fluxo, alertas, health):
    app.include_router(r.router, prefix="/api")


@app.get("/")
async def root():
    return {"service": "pontes-sem-gargalos-api", "docs": "/docs"}
