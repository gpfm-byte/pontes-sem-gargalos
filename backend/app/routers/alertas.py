from fastapi import APIRouter, Depends

from ..deps import get_repo
from ..repository import Repository
from ..schemas import Alerta

router = APIRouter()


@router.get("/alertas", response_model=list[Alerta])
async def get_alertas(repo: Repository = Depends(get_repo)) -> list[Alerta]:
    # Alertas ativos persistidos (gerados pelo sistema por threshold).
    return await repo.get_alertas_ativos()
