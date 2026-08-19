import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.category import CategorySchema


class PodcastSummarySchema(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    description: str
    audio_url: str
    thumbnail_url: str | None = None
    duration_seconds: int
    duration_formatted: str
    episode_number: int
    category_id: int
    category_name: str
    category_slug: str
    publication_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PodcastDetailSchema(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    description: str
    audio_url: str
    thumbnail_url: str | None = None
    duration_seconds: int
    duration_formatted: str
    episode_number: int
    category: CategorySchema
    transcript: str | None = None
    publication_status: str
    created_at: datetime
    related_podcasts: list[PodcastSummarySchema] = []

    model_config = ConfigDict(from_attributes=True)


class PaginatedPodcastResponse(BaseModel):
    items: list[PodcastSummarySchema]
    page: int
    limit: int
    total: int
    total_pages: int
