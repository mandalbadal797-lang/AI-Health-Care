import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_authenticated_user
from app.models.user import User
from app.services.community_service import CommunityService

router = APIRouter(prefix="/community", tags=["Student Community Engagement"])


class CreateCommentRequest(BaseModel):
    content_type: str = Field(..., description="article, podcast, story")
    body: str = Field(..., min_length=3, max_length=1000)
    parent_comment_id: Optional[str] = None


class EditCommentRequest(BaseModel):
    body: str = Field(..., min_length=3, max_length=1000)


class CreateReportRequest(BaseModel):
    target_type: str = Field(..., description="comment, content")
    target_id: str = Field(..., min_length=1)
    content_type: Optional[str] = None
    reason: str = Field(..., description="harassment, hate, spam, inappropriate, dangerous_advice")
    description: Optional[str] = None


@router.get("/content/{content_id}/comments")
async def get_content_comments(
    content_id: str,
    type: str = Query(..., description="article, podcast, story"),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve approved top-level comments and 2-level nested replies for published content."""
    try:
        user_id = current_user.id if current_user else None
        comments = await CommunityService.get_content_comments(
            db=db, content_id=content_id, content_type=type, current_user_id=user_id
        )
        return {"items": comments, "total": len(comments)}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/content/{content_id}/comments", status_code=status.HTTP_201_CREATED)
async def create_comment(
    content_id: str,
    req: CreateCommentRequest,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Post a comment or reply to published content. Verified against non-clinical boundaries."""
    try:
        parent_id = uuid.UUID(req.parent_comment_id) if req.parent_comment_id else None
        comment = await CommunityService.create_comment(
            db=db,
            user_id=current_user.id,
            content_id=content_id,
            content_type=req.content_type,
            body=req.body,
            parent_comment_id=parent_id,
        )
        return {
            "message": "Comment submitted successfully.",
            "comment_id": str(comment.id),
            "status": comment.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/comments/{comment_id}")
async def edit_comment(
    comment_id: uuid.UUID,
    req: EditCommentRequest,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Edit student's own comment. IDOR Protected."""
    try:
        comment = await CommunityService.edit_comment(
            db=db, user_id=current_user.id, comment_id=comment_id, new_body=req.body
        )
        return {"message": "Comment updated successfully.", "comment_id": str(comment.id), "body": comment.body}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: uuid.UUID,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Soft delete student's own comment. IDOR Protected."""
    try:
        await CommunityService.delete_comment(db=db, user_id=current_user.id, comment_id=comment_id)
        return {"message": "Comment deleted successfully."}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/comments/{comment_id}/helpful")
async def toggle_comment_helpful(
    comment_id: uuid.UUID,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle helpful reaction on a comment (1 reaction per user per comment)."""
    try:
        res = await CommunityService.toggle_comment_helpful(db=db, user_id=current_user.id, comment_id=comment_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reports", status_code=status.HTTP_201_CREATED)
async def submit_community_report(
    req: CreateReportRequest,
    current_user: User = Depends(require_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a report for inappropriate comment or content. Deduplicates active reports."""
    try:
        report = await CommunityService.submit_report(
            db=db,
            user_id=current_user.id,
            target_type=req.target_type,
            target_id=req.target_id,
            content_type=req.content_type,
            reason=req.reason,
            description=req.description,
        )
        return {
            "message": "Thank you. Your report has been submitted for review.",
            "report_id": str(report.id),
            "status": report.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
