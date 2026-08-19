from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.category_service import CategoryService
from app.services.article_service import ArticleService
from app.schemas.category import CategoryListResponse, CategorySchema
from app.schemas.article import PaginatedArticleResponse

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("", response_model=CategoryListResponse)
async def list_categories(db: AsyncSession = Depends(get_db)):
    """Retrieve all categories with article counts."""
    return await CategoryService.get_all_categories(db)


@router.get("/{slug}", response_model=CategorySchema)
async def get_category_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Retrieve single category detail by slug."""
    return await CategoryService.get_category_by_slug(db, slug=slug)


@router.get("/{slug}/articles", response_model=PaginatedArticleResponse)
async def get_category_articles(
    slug: str,
    page: int = 1,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve published articles in a specific category."""
    # Verify category exists first
    await CategoryService.get_category_by_slug(db, slug=slug)
    return await ArticleService.get_published_articles(
        db, page=page, limit=limit, category=slug
    )
