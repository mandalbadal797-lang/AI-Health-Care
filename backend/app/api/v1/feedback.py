import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_authenticated_user, require_admin
from app.models.user import User
from app.services.feedback_service import FeedbackService

router = APIRouter(tags=["Content Feedback & Quality"])


class FeedbackSubmissionRequest(BaseModel):
    content_type: str = Field(..., description="article, podcast, or story")
    is_helpful: bool
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    category_tags: Optional[List[str]] = Field(default=None)
    comment: Optional[str] = Field(default=None, max_length=1000)


class ModerationRequest(BaseModel):
    status: str = Field(..., description="approved, rejected, or flagged")
    reason: Optional[str] = Field(default=None, max_length=255)


@router.post("/content/{content_id}/feedback", status_code=status.HTTP_201_CREATED)
async def submit_content_feedback(
    content_id: str,
    payload: FeedbackSubmissionRequest,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit or update student content helpfulness feedback, rating, and optional comments."""
    try:
        fb = await FeedbackService.submit_or_update_feedback(
            db=db,
            user_id=current_user.id,
            content_id=content_id,
            content_type=payload.content_type,
            is_helpful=payload.is_helpful,
            rating=payload.rating,
            category_tags=payload.category_tags,
            comment=payload.comment,
        )
        return {
            "message": "Feedback submitted successfully.",
            "feedback_id": str(fb.id),
            "content_id": fb.content_id,
            "content_type": fb.content_type,
            "is_helpful": fb.is_helpful,
            "rating": fb.rating,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/content/{content_id}/feedback/me")
async def get_my_content_feedback(
    content_id: str,
    type: str = Query(..., description="article, podcast, or story"),
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve authenticated student's own feedback record for target content."""
    fb = await FeedbackService.get_student_feedback(
        db=db, user_id=current_user.id, content_id=content_id, content_type=type
    )
    if not fb:
        return {"feedback": None}
    return {"feedback": fb}


@router.delete("/content/{content_id}/feedback/me")
async def delete_my_content_feedback(
    content_id: str,
    type: str = Query(..., description="article, podcast, or story"),
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete authenticated student's own feedback record for target content."""
    success = await FeedbackService.delete_student_feedback(
        db=db, user_id=current_user.id, content_id=content_id, content_type=type
    )
    if not success:
        raise HTTPException(status_code=404, detail="Feedback record not found.")
    return {"message": "Feedback deleted successfully."}


@router.get("/content/{content_id}/feedback/summary")
async def get_public_content_feedback_summary(
    content_id: str,
    type: str = Query(..., description="article, podcast, or story"),
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint returning aggregate content quality metrics (Helpful rate, avg rating, rating count)."""
    summary = await FeedbackService.get_public_feedback_summary(
        db=db, content_id=content_id, content_type=type
    )
    return summary


@router.get("/admin/feedback")
async def get_admin_feedback_dashboard(
    type: str = Query(default="all"),
    moderation_status: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint returning operational content quality metrics and student feedback moderation queue."""
    dashboard = await FeedbackService.get_admin_feedback_dashboard(
        db=db, content_type=type, moderation_status=moderation_status, page=page, limit=limit
    )
    return dashboard


@router.patch("/admin/feedback/{feedback_id}/moderate")
async def moderate_feedback_item(
    feedback_id: str,
    payload: ModerationRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin endpoint to approve, reject, or flag written student feedback."""
    try:
        fb_uuid = uuid.UUID(feedback_id)
        fb = await FeedbackService.moderate_feedback(
            db=db,
            admin_id=current_user.id,
            feedback_id=fb_uuid,
            status=payload.status,
            reason=payload.reason,
        )
        return {
            "message": f"Feedback status updated to {payload.status}.",
            "feedback_id": str(fb.id),
            "moderation_status": fb.moderation_status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
