from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.article_service import ArticleService
from app.schemas.article import PaginatedArticleResponse, ArticleDetailSchema

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.get("", response_model=PaginatedArticleResponse)
async def list_articles(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    category: str | None = Query(None, description="Category slug filter"),
    search: str | None = Query(None, description="Search keyword filter"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve published articles with pagination, category filter, and keyword search."""
    return await ArticleService.get_published_articles(
        db, page=page, limit=limit, category=category, search=search
    )


@router.get("/{slug}", response_model=ArticleDetailSchema)
async def get_article_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full article detail by unique slug along with related articles."""
    return await ArticleService.get_article_by_slug(db, slug=slug)
