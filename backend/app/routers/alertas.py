from datetime import datetime

from fastapi import APIRouter, Depends

from ..deps import get_repo
from ..repository import Repository
from ..schemas import Alerta, StatusPonteUI
from ..services import compute

router = APIRouter()


@router.get("/alertas", response_model=list[Alerta])
async def get_alertas(repo: Repository = Depends(get_repo)) -> list[Alerta]:
    dia = await repo.latest_day()
    if dia is None:
        return []

    agora = datetime.now()
    hora_atual = agora.hour
    alertas: list[Alerta] = []
    for ponte in await repo.get_pontes():
        leituras = await repo.get_leituras(ponte.id, dia)
        if not leituras:
            continue
        leitura = compute.pick_closest_hour(leituras, hora_atual)
        status = compute.derive_status(leitura.ocupacao_pct)
        ui = StatusPonteUI(
            ponte=ponte, leitura_atual=leitura, status=status,
            cor=compute.status_cor(status),
        )
        alerta = compute.alerta_de_status(ui, agora)
        if alerta:
            alertas.append(alerta)
    return alertas
