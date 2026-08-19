from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.story_service import StoryService
from app.schemas.story import PaginatedStoryResponse, StoryDetailSchema

router = APIRouter(prefix="/stories", tags=["Stories"])


@router.get("", response_model=PaginatedStoryResponse)
async def list_stories(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    category: str | None = Query(None, description="Category slug filter"),
    search: str | None = Query(None, description="Search keyword filter"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve published digital stories with pagination, category filter, and keyword search."""
    return await StoryService.get_published_stories(
        db, page=page, limit=limit, category=category, search=search
    )


@router.get("/{slug}", response_model=StoryDetailSchema)
async def get_story_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full digital story narrative by unique slug along with reflection questions, takeaways, and related stories."""
    return await StoryService.get_story_by_slug(db, slug=slug)
