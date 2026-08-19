import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.models.article import Article
from app.models.category import Category
from app.models.user import User


class ArticleRepository:
    """Data access repository for Articles enforcing published-only filtering for public consumers."""

    @staticmethod
    async def get_published_articles(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 10,
        category_slug: str | None = None,
        search_query: str | None = None,
    ) -> list[Article]:
        """Query published articles with optional category filter and keyword search."""
        stmt = (
            select(Article)
            .options(selectinload(Article.category), selectinload(Article.author))
            .where(Article.publication_status == "published")
        )

        if category_slug:
            stmt = stmt.join(Category).where(Category.slug == category_slug)

        if search_query:
            term = f"%{search_query.strip()}%"
            stmt = stmt.where(
                or_(
                    Article.title.ilike(term),
                    Article.excerpt.ilike(term),
                    Article.content.ilike(term),
                )
            )

        stmt = stmt.order_by(Article.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def count_published_articles(
        db: AsyncSession,
        category_slug: str | None = None,
        search_query: str | None = None,
    ) -> int:
        """Count total matching published articles for pagination metadata."""
        stmt = select(func.count(Article.id)).where(Article.publication_status == "published")

        if category_slug:
            stmt = stmt.join(Category).where(Category.slug == category_slug)

        if search_query:
            term = f"%{search_query.strip()}%"
            stmt = stmt.where(
                or_(
                    Article.title.ilike(term),
                    Article.excerpt.ilike(term),
                    Article.content.ilike(term),
                )
            )

        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_published_article_by_slug(db: AsyncSession, slug: str) -> Article | None:
        """Fetch single published article by unique slug."""
        stmt = (
            select(Article)
            .options(
                selectinload(Article.category),
                selectinload(Article.author),
                selectinload(Article.tags),
            )
            .where(Article.slug == slug)
            .where(Article.publication_status == "published")
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_related_articles(
        db: AsyncSession, article_id: uuid.UUID, category_id: int, limit: int = 3
    ) -> list[Article]:
        """Fetch related published articles within the same category excluding current article."""
        stmt = (
            select(Article)
            .options(selectinload(Article.category), selectinload(Article.author))
            .where(Article.publication_status == "published")
            .where(Article.category_id == category_id)
            .where(Article.id != article_id)
            .order_by(Article.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
