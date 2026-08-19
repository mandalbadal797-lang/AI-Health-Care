from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Assistance"])


class ChatRequest(BaseModel):
    message: str = Field(..., max_length=2000, description="User prompt message")
    history: list[dict[str, str]] | None = Field(default=[], description="Optional short conversation history")


class RecommendRequest(BaseModel):
    query: str = Field(..., max_length=200, description="Recommendation search query")


@router.post("/chat")
async def ai_chat(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    """Process student AI chat query, returning supportive non-clinical response and grounded content recommendations."""
    return await AIService.process_chat(db, user_message=req.message, history=req.history)


@router.post("/recommend")
async def ai_recommendations(
    req: RecommendRequest,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve grounded recommendations across Articles, Podcasts, and Stories for a specific prompt query."""
    items = await AIService.get_recommendations(db, query=req.query)
    return {"query": req.query, "recommendations": items}
