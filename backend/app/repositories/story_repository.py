import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.models.story import Story
from app.models.category import Category


class StoryRepository:
    """Data access repository for digital stories enforcing published-only filtering for public consumers."""

    @staticmethod
    async def get_published_stories(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 10,
        category_slug: str | None = None,
        search_query: str | None = None,
    ) -> list[Story]:
        """Query published digital stories with optional category filter and keyword search."""
        stmt = (
            select(Story)
            .options(selectinload(Story.category))
            .where(Story.publication_status == "published")
        )

        if category_slug:
            stmt = stmt.join(Category).where(Category.slug == category_slug)

        if search_query:
            term = f"%{search_query.strip()}%"
            stmt = stmt.where(
                or_(
                    Story.title.ilike(term),
                    Story.subtitle.ilike(term),
                    Story.content.ilike(term),
                )
            )

        stmt = stmt.order_by(Story.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def count_published_stories(
        db: AsyncSession,
        category_slug: str | None = None,
        search_query: str | None = None,
    ) -> int:
        """Count total matching published stories for pagination metadata."""
        stmt = select(func.count(Story.id)).where(Story.publication_status == "published")

        if category_slug:
            stmt = stmt.join(Category).where(Category.slug == category_slug)

        if search_query:
            term = f"%{search_query.strip()}%"
            stmt = stmt.where(
                or_(
                    Story.title.ilike(term),
                    Story.subtitle.ilike(term),
                    Story.content.ilike(term),
                )
            )

        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_published_story_by_slug(db: AsyncSession, slug: str) -> Story | None:
        """Fetch single published digital story by unique slug."""
        stmt = (
            select(Story)
            .options(selectinload(Story.category))
            .where(Story.slug == slug)
            .where(Story.publication_status == "published")
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_related_stories(
        db: AsyncSession, story_id: uuid.UUID, category_id: int, limit: int = 3
    ) -> list[Story]:
        """Fetch related published digital stories in the same category excluding current story."""
        stmt = (
            select(Story)
            .options(selectinload(Story.category))
            .where(Story.publication_status == "published")
            .where(Story.category_id == category_id)
            .where(Story.id != story_id)
            .order_by(Story.created_at.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
