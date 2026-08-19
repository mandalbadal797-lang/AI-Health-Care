import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from app.models.podcast import Podcast
from app.models.category import Category


class PodcastRepository:
    """Data access repository for Podcast episodes enforcing published-only filtering for public consumers."""

    @staticmethod
    async def get_published_podcasts(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 10,
        category_slug: str | None = None,
        search_query: str | None = None,
    ) -> list[Podcast]:
        """Query published podcast episodes with optional category filter and keyword search."""
        stmt = (
            select(Podcast)
            .options(selectinload(Podcast.category))
            .where(Podcast.publication_status == "published")
        )

        if category_slug:
            stmt = stmt.join(Category).where(Category.slug == category_slug)

        if search_query:
            term = f"%{search_query.strip()}%"
            stmt = stmt.where(
                or_(
                    Podcast.title.ilike(term),
                    Podcast.description.ilike(term),
                    Podcast.transcript.ilike(term),
                )
            )

        stmt = stmt.order_by(Podcast.episode_number.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def count_published_podcasts(
        db: AsyncSession,
        category_slug: str | None = None,
        search_query: str | None = None,
    ) -> int:
        """Count total matching published podcasts for pagination metadata."""
        stmt = select(func.count(Podcast.id)).where(Podcast.publication_status == "published")

        if category_slug:
            stmt = stmt.join(Category).where(Category.slug == category_slug)

        if search_query:
            term = f"%{search_query.strip()}%"
            stmt = stmt.where(
                or_(
                    Podcast.title.ilike(term),
                    Podcast.description.ilike(term),
                    Podcast.transcript.ilike(term),
                )
            )

        result = await db.execute(stmt)
        return result.scalar() or 0

    @staticmethod
    async def get_published_podcast_by_slug(db: AsyncSession, slug: str) -> Podcast | None:
        """Fetch single published podcast episode by unique slug."""
        stmt = (
            select(Podcast)
            .options(selectinload(Podcast.category))
            .where(Podcast.slug == slug)
            .where(Podcast.publication_status == "published")
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_related_podcasts(
        db: AsyncSession, podcast_id: uuid.UUID, category_id: int, limit: int = 3
    ) -> list[Podcast]:
        """Fetch related published podcast episodes in the same category excluding current episode."""
        stmt = (
            select(Podcast)
            .options(selectinload(Podcast.category))
            .where(Podcast.publication_status == "published")
            .where(Podcast.category_id == category_id)
            .where(Podcast.id != podcast_id)
            .order_by(Podcast.episode_number.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())
