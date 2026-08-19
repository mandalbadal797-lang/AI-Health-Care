import math
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.article_repository import ArticleRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.article import (
    ArticleSummarySchema,
    ArticleDetailSchema,
    PaginatedArticleResponse,
)
from app.schemas.category import CategorySchema
from app.schemas.tag import TagSchema
from app.core.exceptions import CustomAPIException


class ArticleService:
    """Business logic service for blog articles."""

    @staticmethod
    async def get_published_articles(
        db: AsyncSession,
        page: int = 1,
        limit: int = 10,
        category: str | None = None,
        search: str | None = None,
    ) -> PaginatedArticleResponse:
        if page < 1:
            raise CustomAPIException(status_code=400, code="INVALID_PAGINATION", message="Page number must be >= 1.")
        if limit < 1 or limit > 50:
            raise CustomAPIException(status_code=400, code="INVALID_PAGINATION", message="Limit must be between 1 and 50.")

        skip = (page - 1) * limit
        articles = await ArticleRepository.get_published_articles(
            db, skip=skip, limit=limit, category_slug=category, search_query=search
        )
        total = await ArticleRepository.count_published_articles(
            db, category_slug=category, search_query=search
        )
        total_pages = math.ceil(total / limit) if total > 0 else 1

        items = [
            ArticleSummarySchema(
                id=art.id,
                title=art.title,
                slug=art.slug,
                excerpt=art.excerpt,
                cover_image=art.cover_image,
                category_id=art.category_id,
                category_name=art.category.name,
                category_slug=art.category.slug,
                reading_time_minutes=art.reading_time_minutes,
                author_name=art.author.full_name if art.author else "MindCampus Editorial Team",
                publication_status=art.publication_status,
                is_ai_generated=art.is_ai_generated,
                created_at=art.created_at,
            )
            for art in articles
        ]

        return PaginatedArticleResponse(
            items=items,
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_article_by_slug(db: AsyncSession, slug: str) -> ArticleDetailSchema:
        article = await ArticleRepository.get_published_article_by_slug(db, slug)
        if not article:
            raise CustomAPIException(
                status_code=404,
                code="ARTICLE_NOT_FOUND",
                message=f"Published article with slug '{slug}' was not found.",
            )

        # Get related articles
        related_entities = await ArticleRepository.get_related_articles(
            db, article_id=article.id, category_id=article.category_id, limit=3
        )
        related_schemas = [
            ArticleSummarySchema(
                id=rel.id,
                title=rel.title,
                slug=rel.slug,
                excerpt=rel.excerpt,
                cover_image=rel.cover_image,
                category_id=rel.category_id,
                category_name=rel.category.name,
                category_slug=rel.category.slug,
                reading_time_minutes=rel.reading_time_minutes,
                author_name=rel.author.full_name if rel.author else "MindCampus Editorial Team",
                publication_status=rel.publication_status,
                is_ai_generated=rel.is_ai_generated,
                created_at=rel.created_at,
            )
            for rel in related_entities
        ]

        category_schema = CategorySchema(
            id=article.category.id,
            name=article.category.name,
            slug=article.category.slug,
            description=article.category.description,
            icon_name=article.category.icon_name,
            created_at=article.category.created_at,
        )

        tag_schemas = [
            TagSchema(id=tag.id, name=tag.name, slug=tag.slug)
            for tag in article.tags
        ]

        return ArticleDetailSchema(
            id=article.id,
            title=article.title,
            slug=article.slug,
            excerpt=article.excerpt,
            content=article.content,
            cover_image=article.cover_image,
            category=category_schema,
            reading_time_minutes=article.reading_time_minutes,
            author_name=article.author.full_name if article.author else "MindCampus Editorial Team",
            publication_status=article.publication_status,
            is_ai_generated=article.is_ai_generated,
            created_at=article.created_at,
            updated_at=article.updated_at,
            tags=tag_schemas,
            related_articles=related_schemas,
        )
