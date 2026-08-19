import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.category import CategorySchema


class StorySummarySchema(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    subtitle: str
    cover_image: str | None = None
    author_name: str
    reading_time_minutes: int
    category_id: int
    category_name: str
    category_slug: str
    publication_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StoryDetailSchema(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    subtitle: str
    content: str
    cover_image: str | None = None
    author_name: str
    reading_time_minutes: int
    category: CategorySchema
    reflection_question: str | None = None
    key_takeaway: str | None = None
    publication_status: str
    created_at: datetime
    related_stories: list[StorySummarySchema] = []

    model_config = ConfigDict(from_attributes=True)


class PaginatedStoryResponse(BaseModel):
    items: list[StorySummarySchema]
    page: int
    limit: int
    total: int
    total_pages: int
