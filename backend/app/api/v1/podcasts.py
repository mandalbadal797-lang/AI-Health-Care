from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.podcast_service import PodcastService
from app.schemas.podcast import PaginatedPodcastResponse, PodcastDetailSchema

router = APIRouter(prefix="/podcasts", tags=["Podcasts"])


@router.get("", response_model=PaginatedPodcastResponse)
async def list_podcasts(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    category: str | None = Query(None, description="Category slug filter"),
    search: str | None = Query(None, description="Search keyword filter"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve published podcast episodes with pagination, category filter, and keyword search."""
    return await PodcastService.get_published_podcasts(
        db, page=page, limit=limit, category=category, search=search
    )


@router.get("/{slug}", response_model=PodcastDetailSchema)
async def get_podcast_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full podcast episode detail by unique slug along with transcript and related episodes."""
    return await PodcastService.get_podcast_by_slug(db, slug=slug)
