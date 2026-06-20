from fastapi import APIRouter, Depends

from ..deps import get_repo
from ..repository import Repository
from ..schemas import Ponte

router = APIRouter()


@router.get("/pontes", response_model=list[Ponte])
async def get_pontes(repo: Repository = Depends(get_repo)) -> list[Ponte]:
    return await repo.get_pontes()
