from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_authenticated_user
from app.models.user import User
from app.services.library_service import LibraryService

router = APIRouter(prefix="/library", tags=["Student Personal Library"])


class SaveContentRequest(BaseModel):
    content_id: str
    content_type: str = Field(..., description="article, podcast, or story")


class ProgressUpdateRequest(BaseModel):
    content_type: str = Field(..., description="article, podcast, or story")
    progress_percent: float = Field(..., ge=0.0, le=100.0)
    position_seconds: float = Field(default=0.0, ge=0.0)
    duration_seconds: float = Field(default=0.0, ge=0.0)


class TrackViewRequest(BaseModel):
    content_id: str
    content_type: str = Field(..., description="article, podcast, or story")


@router.get("")
async def get_saved_library(
    type: str = Query(default="all"),
    category_id: Optional[int] = Query(default=None),
    sort: str = Query(default="recently_saved"),
    q: str = Query(default=""),
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve authenticated student's personal saved content library."""
    items = await LibraryService.get_user_saved_library(
        db=db,
        user_id=current_user.id,
        content_type=type,
        category_id=category_id,
        sort=sort,
        query=q,
    )
    return {"items": items, "total": len(items)}


@router.post("", status_code=status.HTTP_201_CREATED)
async def save_content_to_library(
    payload: SaveContentRequest,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Save an article, podcast, or story to authenticated student's library."""
    try:
        saved = await LibraryService.save_content(
            db=db,
            user_id=current_user.id,
            content_id=payload.content_id,
            content_type=payload.content_type,
        )
        return {
            "message": "Content successfully saved to library.",
            "saved_id": str(saved.id),
            "content_id": saved.content_id,
            "content_type": saved.content_type,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{content_id}")
async def remove_content_from_library(
    content_id: str,
    type: str = Query(..., description="article, podcast, or story"),
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove saved content bookmark from authenticated student's library."""
    success = await LibraryService.remove_saved_content(
        db=db,
        user_id=current_user.id,
        content_id=content_id,
        content_type=type,
    )
    if not success:
        raise HTTPException(status_code=404, detail="Saved content bookmark not found.")
    return {"message": "Content removed from library."}


@router.get("/progress")
async def get_library_progress(
    mode: str = Query(default="all", description="all, in_progress, completed"),
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """List authenticated student's reading and listening progress records."""
    items = await LibraryService.get_user_progress_list(
        db=db, user_id=current_user.id, mode=mode
    )
    return {"items": items, "total": len(items)}


@router.put("/progress/{content_id}")
async def update_content_progress(
    content_id: str,
    payload: ProgressUpdateRequest,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Update or record content reading/listening progress for authenticated student."""
    try:
        prog = await LibraryService.update_content_progress(
            db=db,
            user_id=current_user.id,
            content_id=content_id,
            content_type=payload.content_type,
            progress_percent=payload.progress_percent,
            position_seconds=payload.position_seconds,
            duration_seconds=payload.duration_seconds,
        )
        return {
            "message": "Progress updated successfully.",
            "progress_id": str(prog.id),
            "progress_percent": prog.progress_percent,
            "position_seconds": prog.position_seconds,
            "is_completed": prog.is_completed,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/recently-viewed")
async def get_recently_viewed(
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """List authenticated student's recently viewed items (max 20)."""
    items = await LibraryService.get_user_recently_viewed(db=db, user_id=current_user.id)
    return {"items": items, "total": len(items)}


@router.post("/recently-viewed")
async def track_recently_viewed(
    payload: TrackViewRequest,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Track a content view for authenticated student."""
    try:
        rv = await LibraryService.track_recently_viewed(
            db=db,
            user_id=current_user.id,
            content_id=payload.content_id,
            content_type=payload.content_type,
        )
        return {"message": "Recently viewed tracked successfully.", "viewed_at": rv.viewed_at.isoformat()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
