import math
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.podcast_repository import PodcastRepository
from app.schemas.podcast import (
    PodcastSummarySchema,
    PodcastDetailSchema,
    PaginatedPodcastResponse,
)
from app.schemas.category import CategorySchema
from app.core.exceptions import CustomAPIException


def format_duration(seconds: int) -> str:
    """Helper to convert seconds integer to mm:ss format string."""
    mins = seconds // 60
    secs = seconds % 60
    return f"{mins}:{secs:02d}"


class PodcastService:
    """Business logic service for podcast audio episodes."""

    @staticmethod
    async def get_published_podcasts(
        db: AsyncSession,
        page: int = 1,
        limit: int = 10,
        category: str | None = None,
        search: str | None = None,
    ) -> PaginatedPodcastResponse:
        if page < 1:
            raise CustomAPIException(status_code=400, code="INVALID_PAGINATION", message="Page number must be >= 1.")
        if limit < 1 or limit > 50:
            raise CustomAPIException(status_code=400, code="INVALID_PAGINATION", message="Limit must be between 1 and 50.")

        skip = (page - 1) * limit
        podcasts = await PodcastRepository.get_published_podcasts(
            db, skip=skip, limit=limit, category_slug=category, search_query=search
        )
        total = await PodcastRepository.count_published_podcasts(
            db, category_slug=category, search_query=search
        )
        total_pages = math.ceil(total / limit) if total > 0 else 1

        items = [
            PodcastSummarySchema(
                id=p.id,
                title=p.title,
                slug=p.slug,
                description=p.description,
                audio_url=p.audio_url,
                thumbnail_url=p.thumbnail_url,
                duration_seconds=p.duration_seconds,
                duration_formatted=format_duration(p.duration_seconds),
                episode_number=p.episode_number,
                category_id=p.category_id,
                category_name=p.category.name,
                category_slug=p.category.slug,
                publication_status=p.publication_status,
                created_at=p.created_at,
            )
            for p in podcasts
        ]

        return PaginatedPodcastResponse(
            items=items,
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_podcast_by_slug(db: AsyncSession, slug: str) -> PodcastDetailSchema:
        podcast = await PodcastRepository.get_published_podcast_by_slug(db, slug)
        if not podcast:
            raise CustomAPIException(
                status_code=404,
                code="PODCAST_NOT_FOUND",
                message=f"Published podcast episode with slug '{slug}' was not found.",
            )

        # Get related episodes
        related_entities = await PodcastRepository.get_related_podcasts(
            db, podcast_id=podcast.id, category_id=podcast.category_id, limit=3
        )
        related_schemas = [
            PodcastSummarySchema(
                id=rel.id,
                title=rel.title,
                slug=rel.slug,
                description=rel.description,
                audio_url=rel.audio_url,
                thumbnail_url=rel.thumbnail_url,
                duration_seconds=rel.duration_seconds,
                duration_formatted=format_duration(rel.duration_seconds),
                episode_number=rel.episode_number,
                category_id=rel.category_id,
                category_name=rel.category.name,
                category_slug=rel.category.slug,
                publication_status=rel.publication_status,
                created_at=rel.created_at,
            )
            for rel in related_entities
        ]

        category_schema = CategorySchema(
            id=podcast.category.id,
            name=podcast.category.name,
            slug=podcast.category.slug,
            description=podcast.category.description,
            icon_name=podcast.category.icon_name,
            created_at=podcast.category.created_at,
        )

        return PodcastDetailSchema(
            id=podcast.id,
            title=podcast.title,
            slug=podcast.slug,
            description=podcast.description,
            audio_url=podcast.audio_url,
            thumbnail_url=podcast.thumbnail_url,
            duration_seconds=podcast.duration_seconds,
            duration_formatted=format_duration(podcast.duration_seconds),
            episode_number=podcast.episode_number,
            category=category_schema,
            transcript=podcast.transcript,
            publication_status=podcast.publication_status,
            created_at=podcast.created_at,
            related_podcasts=related_schemas,
        )
