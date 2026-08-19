import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.models.moderation import ContentReview, ReviewComment, SafetyCheckResult
from app.services.moderation_service import ModerationService

router = APIRouter(prefix="/admin/moderation", tags=["Admin Content Moderation"])


# Request Schemas
class SubmitReviewRequest(BaseModel):
    content_id: str = Field(..., min_length=1)
    content_type: str = Field(..., description="article, podcast, story")


class ReviewActionRequest(BaseModel):
    action: str = Field(..., description="approve, request_changes, reject, escalate")
    reviewer_notes: Optional[str] = None
    rejection_reason: Optional[str] = None


class AddCommentRequest(BaseModel):
    comment_type: Optional[str] = "general"
    content: str = Field(..., min_length=1)


class PublishRequest(BaseModel):
    content_type: str = Field(..., description="article, podcast, story")


@router.get("")
async def get_moderation_queue(
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    type: Optional[str] = Query(default=None),
    is_ai_generated: Optional[bool] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve paginated moderation review queue with filter options."""
    res = await ModerationService.get_moderation_queue(
        db=db,
        status=status,
        priority=priority,
        content_type=type,
        is_ai_generated=is_ai_generated,
        page=page,
        limit=limit,
    )
    return res


@router.get("/kpis")
async def get_moderation_kpis(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve overview KPI counts for pending, high priority, approved, and published items."""
    kpis = await ModerationService.get_moderation_kpis(db)
    return kpis


@router.get("/{review_id}")
async def get_review_detail(
    review_id: uuid.UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve detailed content review record including automated safety check results."""
    res = await db.execute(select(ContentReview).where(ContentReview.id == review_id))
    review = res.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review record not found.")

    # Fetch safety checks
    checks_res = await db.execute(
        select(SafetyCheckResult).where(SafetyCheckResult.review_id == review_id)
    )
    checks = checks_res.scalars().all()

    # Fetch comments
    comments_res = await db.execute(
        select(ReviewComment).where(ReviewComment.review_id == review_id)
    )
    comments = comments_res.scalars().all()

    return {
        "id": str(review.id),
        "content_id": review.content_id,
        "content_type": review.content_type,
        "version": review.content_version,
        "status": review.status,
        "priority": review.priority,
        "is_ai_generated": review.is_ai_generated,
        "safety_status": review.safety_status,
        "reviewer_notes": review.reviewer_notes,
        "rejection_reason": review.rejection_reason,
        "created_at": review.created_at.isoformat(),
        "safety_checks": [
            {
                "id": str(c.id),
                "name": c.check_name,
                "status": c.status,
                "severity": c.severity,
                "details": c.details,
            }
            for c in checks
        ],
        "comments": [
            {
                "id": str(cm.id),
                "comment_type": cm.comment_type,
                "content": cm.content,
                "is_resolved": cm.is_resolved,
                "created_at": cm.created_at.isoformat(),
            }
            for cm in comments
        ],
    }


@router.post("/submit", status_code=status.HTTP_201_CREATED)
async def submit_content_for_review(
    req: SubmitReviewRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Submit a draft content item for moderation review and run automated safety checks."""
    try:
        review = await ModerationService.submit_content_for_review(
            db=db,
            user_id=current_user.id,
            content_id=req.content_id,
            content_type=req.content_type,
        )
        return {
            "message": "Content submitted for review successfully.",
            "review_id": str(review.id),
            "status": review.status,
            "priority": review.priority,
            "safety_status": review.safety_status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{review_id}/action")
async def execute_review_action(
    review_id: uuid.UUID,
    req: ReviewActionRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Execute human review decision (approve, request_changes, reject, escalate)."""
    try:
        review = await ModerationService.execute_review_action(
            db=db,
            user_id=current_user.id,
            review_id=review_id,
            action=req.action,
            reviewer_notes=req.reviewer_notes,
            rejection_reason=req.rejection_reason,
        )
        return {
            "message": f"Review action '{req.action}' recorded successfully.",
            "review_id": str(review.id),
            "status": review.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{content_id}/publish")
async def publish_approved_content(
    content_id: str,
    req: PublishRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Publish an approved content item. Strict protection: Enforces approved moderation status."""
    try:
        res = await ModerationService.publish_approved_content(
            db=db,
            user_id=current_user.id,
            content_id=content_id,
            content_type=req.content_type,
        )
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
