from typing import Optional

from fastapi import APIRouter, Depends

from ..deps import get_repo
from ..repository import Repository
from ..schemas import PontoFluxo

router = APIRouter()

# Ponte padrão quando nenhuma é informada (igual ao front: Maurício de Nassau).
DEFAULT_PONTE = "mauricio-nassau"


@router.get("/fluxo", response_model=list[PontoFluxo])
async def get_fluxo(
    ponteId: Optional[str] = None,
    repo: Repository = Depends(get_repo),
) -> list[PontoFluxo]:
    dia = await repo.latest_day()
    if dia is None:
        return []

    leituras = await repo.get_leituras(ponteId or DEFAULT_PONTE, dia)
    return [
        PontoFluxo(
            hora=f"{lt.timestamp.hour:02d}:00",
            veiculos=lt.veiculos_por_hora,
        )
        for lt in leituras
        if 6 <= lt.timestamp.hour <= 21
    ]
