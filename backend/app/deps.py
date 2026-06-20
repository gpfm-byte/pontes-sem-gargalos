"""Dependências do FastAPI. get_repo é sobrescrito nos testes."""
from fastapi import Request

from .repository import PgRepository, Repository


def get_repo(request: Request) -> Repository:
    return PgRepository(request.app.state.pool)
