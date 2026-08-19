import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.models.ai_generation import AIGeneration
from app.services.ai_studio_service import AIStudioService

router = APIRouter(prefix="/admin/ai", tags=["Admin AI Content Studio"])


# Request Schemas
class AIGenerateRequest(BaseModel):
    content_type: str = Field(..., description="article, podcast, story")
    topic: str = Field(..., min_length=2, max_length=500)
    audience: Optional[str] = "College Students"
    purpose: Optional[str] = "Educational & Motivational"
    tone: Optional[str] = "Supportive"
    length: Optional[str] = "medium"
    category_id: Optional[int] = None
    keywords: Optional[List[str]] = None


class AIImproveRequest(BaseModel):
    text: str = Field(..., min_length=5)
    operation: str = Field(default="simplify", description="simplify, readability, intro, practical")
    content_type: Optional[str] = "article"
    source_content_id: Optional[str] = None


class AIAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=5)
    content_type: Optional[str] = "article"


class AIIdeasRequest(BaseModel):
    category_id: Optional[int] = None
    content_type: Optional[str] = "all"
    include_analytics: Optional[bool] = True


@router.post("/content/generate", status_code=status.HTTP_201_CREATED)
async def generate_content_draft(
    req: AIGenerateRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Generate structured AI draft for a Blog, Podcast script, or Digital Story."""
    gen = await AIStudioService.generate_content_draft(
        db=db,
        user_id=current_user.id,
        content_type=req.content_type,
        topic=req.topic,
        audience=req.audience or "College Students",
        purpose=req.purpose or "Educational & Motivational",
        tone=req.tone or "Supportive",
        length=req.length or "medium",
        category_id=req.category_id,
        keywords=req.keywords,
    )
    return {
        "generation_id": str(gen.id),
        "content_type": gen.content_type,
        "topic": gen.topic,
        "output": gen.output_content,
        "status": gen.status,
        "safety_status": gen.safety_status,
        "created_at": gen.created_at.isoformat(),
    }


@router.post("/content/improve")
async def improve_content(
    req: AIImproveRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Generate side-by-side improved text suggestions for existing content."""
    gen = await AIStudioService.improve_content(
        db=db,
        user_id=current_user.id,
        text=req.text,
        operation=req.operation,
        content_type=req.content_type or "article",
        source_content_id=req.source_content_id,
    )
    return {
        "generation_id": str(gen.id),
        "output": gen.output_content,
        "status": gen.status,
        "created_at": gen.created_at.isoformat(),
    }


@router.post("/content/analyze")
async def analyze_content(
    req: AIAnalyzeRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Analyze readability index, reading time, sentence complexity, and factual claim flags."""
    analysis = await AIStudioService.analyze_content(
        db=db,
        user_id=current_user.id,
        text=req.text,
        content_type=req.content_type or "article",
    )
    return analysis


@router.post("/content/ideas")
async def generate_content_ideas(
    req: AIIdeasRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Generate analytics-informed content opportunity ideas based on Phase 14 signals."""
    ideas = await AIStudioService.generate_content_ideas(
        db=db,
        user_id=current_user.id,
        category_id=req.category_id,
        content_type=req.content_type or "all",
        include_analytics=req.include_analytics if req.include_analytics is not None else True,
    )
    return {"ideas": ideas}


@router.get("/history")
async def get_ai_generation_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve history of AI generations for human review and CMS draft conversion."""
    skip = (page - 1) * limit
    res = await db.execute(
        select(AIGeneration)
        .where(AIGeneration.user_id == current_user.id)
        .order_by(AIGeneration.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    generations = res.scalars().all()

    items = []
    for g in generations:
        items.append({
            "id": str(g.id),
            "operation_type": g.operation_type,
            "content_type": g.content_type,
            "topic": g.topic,
            "output": g.output_content,
            "status": g.status,
            "safety_status": g.safety_status,
            "created_at": g.created_at.isoformat(),
        })

    return {"total": len(items), "page": page, "limit": limit, "items": items}


@router.post("/history/{generation_id}/send-to-cms")
async def send_ai_draft_to_cms(
    generation_id: uuid.UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Convert an approved AI generation into an official draft item in Admin CMS."""
    try:
        res = await AIStudioService.send_draft_to_cms(db, current_user.id, generation_id)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
