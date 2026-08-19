from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.search_service import SearchService
from app.services.ai_service import AIService

router = APIRouter(prefix="/search", tags=["Search & Discovery"])


class AITranslateRequest(BaseModel):
    natural_query: str = Field(..., max_length=300)


@router.get("")
async def search_content(
    q: str = Query(default="", max_length=200),
    type: str = Query(default="all"),
    category_id: Optional[int] = Query(default=None),
    category_slug: Optional[str] = Query(default=None),
    sort: str = Query(default="relevance"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Global search across published Articles, Podcasts, and Digital Stories."""
    if len(q.strip()) > 200:
        raise HTTPException(status_code=400, detail="Search query exceeds maximum length of 200 characters.")

    results = await SearchService.global_search(
        db=db,
        query=q,
        content_type=type,
        category_id=category_id,
        category_slug=category_slug,
        sort=sort,
        page=page,
        limit=limit,
    )
    return results


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1, max_length=100),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve live search suggestions for autocomplete dropdown."""
    suggestions = await SearchService.get_suggestions(db=db, query=q, max_results=6)
    return {"suggestions": suggestions}


@router.get("/related")
async def get_related_content(
    type: str = Query(..., description="article, podcast, or story"),
    id: str = Query(..., description="Current content item ID"),
    category_id: int = Query(..., description="Content category ID"),
    limit: int = Query(default=3, ge=1, le=10),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve related content items matching category, excluding current content ID."""
    related = await SearchService.get_related_content(
        db=db, content_type=type, current_id=id, category_id=category_id, limit=limit
    )
    return {"items": related}


@router.post("/ai-translate")
async def ai_translate_natural_query(
    payload: AITranslateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Translate natural language discovery prompts into structured search terms."""
    query = payload.natural_query.strip()
    if not query:
        return {"translated_query": "", "suggested_category": None}

    # Keyword extraction fallback without LLM dependency
    keywords = [w.lower() for w in query.split() if len(w) > 3 and w.lower() not in ["want", "help", "with", "from", "that", "this", "some", "like"]]
    extracted_q = " ".join(keywords[:3]) if keywords else query

    return {
        "original_query": query,
        "translated_query": extracted_q,
        "recommendation_prompt": f"Search results translated from: '{query}'",
    }
