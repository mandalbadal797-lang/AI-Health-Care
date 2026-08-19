import math
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.story_repository import StoryRepository
from app.schemas.story import (
    StorySummarySchema,
    StoryDetailSchema,
    PaginatedStoryResponse,
)
from app.schemas.category import CategorySchema
from app.core.exceptions import CustomAPIException


class StoryService:
    """Business logic service for digital storytelling narratives."""

    @staticmethod
    async def get_published_stories(
        db: AsyncSession,
        page: int = 1,
        limit: int = 10,
        category: str | None = None,
        search: str | None = None,
    ) -> PaginatedStoryResponse:
        if page < 1:
            raise CustomAPIException(status_code=400, code="INVALID_PAGINATION", message="Page number must be >= 1.")
        if limit < 1 or limit > 50:
            raise CustomAPIException(status_code=400, code="INVALID_PAGINATION", message="Limit must be between 1 and 50.")

        skip = (page - 1) * limit
        stories = await StoryRepository.get_published_stories(
            db, skip=skip, limit=limit, category_slug=category, search_query=search
        )
        total = await StoryRepository.count_published_stories(
            db, category_slug=category, search_query=search
        )
        total_pages = math.ceil(total / limit) if total > 0 else 1

        items = [
            StorySummarySchema(
                id=s.id,
                title=s.title,
                slug=s.slug,
                subtitle=s.subtitle,
                cover_image=s.cover_image,
                author_name=s.author_name,
                reading_time_minutes=s.reading_time_minutes,
                category_id=s.category_id,
                category_name=s.category.name,
                category_slug=s.category.slug,
                publication_status=s.publication_status,
                created_at=s.created_at,
            )
            for s in stories
        ]

        return PaginatedStoryResponse(
            items=items,
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
        )

    @staticmethod
    async def get_story_by_slug(db: AsyncSession, slug: str) -> StoryDetailSchema:
        story = await StoryRepository.get_published_story_by_slug(db, slug)
        if not story:
            raise CustomAPIException(
                status_code=404,
                code="STORY_NOT_FOUND",
                message=f"Published digital story with slug '{slug}' was not found.",
            )

        # Get related stories
        related_entities = await StoryRepository.get_related_stories(
            db, story_id=story.id, category_id=story.category_id, limit=3
        )
        related_schemas = [
            StorySummarySchema(
                id=rel.id,
                title=rel.title,
                slug=rel.slug,
                subtitle=rel.subtitle,
                cover_image=rel.cover_image,
                author_name=rel.author_name,
                reading_time_minutes=rel.reading_time_minutes,
                category_id=rel.category_id,
                category_name=rel.category.name,
                category_slug=rel.category.slug,
                publication_status=rel.publication_status,
                created_at=rel.created_at,
            )
            for rel in related_entities
        ]

        category_schema = CategorySchema(
            id=story.category.id,
            name=story.category.name,
            slug=story.category.slug,
            description=story.category.description,
            icon_name=story.category.icon_name,
            created_at=story.category.created_at,
        )

        return StoryDetailSchema(
            id=story.id,
            title=story.title,
            slug=story.slug,
            subtitle=story.subtitle,
            content=story.content,
            cover_image=story.cover_image,
            author_name=story.author_name,
            reading_time_minutes=story.reading_time_minutes,
            category=category_schema,
            reflection_question=story.reflection_question,
            key_takeaway=story.key_takeaway,
            publication_status=story.publication_status,
            created_at=story.created_at,
            related_stories=related_schemas,
        )
