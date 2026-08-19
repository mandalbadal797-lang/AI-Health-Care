from fastapi import APIRouter
from app.core.exceptions import CustomAPIException

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


@router.get("")
async def list_bookmarks():
    raise CustomAPIException(
        status_code=501,
        code="NOT_IMPLEMENTED",
        message="Bookmarks features will be implemented in Phase 8."
    )
