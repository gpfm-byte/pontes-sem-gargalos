from fastapi import APIRouter, Depends

from ..deps import get_repo
from ..repository import Repository
from ..schemas import Health

router = APIRouter()


@router.get("/health", response_model=Health)
async def health(repo: Repository = Depends(get_repo)) -> Health:
    try:
        ok = await repo.ping()
        return Health(status="ok", db="up" if ok else "down")
    except Exception:
        return Health(status="degraded", db="down")
