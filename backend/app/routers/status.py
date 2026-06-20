from datetime import datetime

from fastapi import APIRouter, Depends

from ..deps import get_repo
from ..repository import Repository
from ..schemas import StatusPonteUI
from ..services import compute

router = APIRouter()


@router.get("/status", response_model=list[StatusPonteUI])
async def get_status(repo: Repository = Depends(get_repo)) -> list[StatusPonteUI]:
    dia = await repo.latest_day()
    if dia is None:
        return []

    hora_atual = datetime.now().hour
    out: list[StatusPonteUI] = []
    for ponte in await repo.get_pontes():
        leituras = await repo.get_leituras(ponte.id, dia)
        if not leituras:
            continue
        leitura = compute.pick_closest_hour(leituras, hora_atual)
        status = compute.derive_status(leitura.ocupacao_pct)
        out.append(
            StatusPonteUI(
                ponte=ponte,
                leitura_atual=leitura,
                status=status,
                cor=compute.status_cor(status),
            )
        )
    return out
