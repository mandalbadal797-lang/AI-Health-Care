import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.category import CategorySchema
from app.schemas.tag import TagSchema


class ArticleSummarySchema(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str
    cover_image: str | None = None
    category_id: int
    category_name: str
    category_slug: str
    reading_time_minutes: int
    author_name: str
    publication_status: str
    is_ai_generated: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ArticleDetailSchema(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str
    content: str
    cover_image: str | None = None
    category: CategorySchema
    reading_time_minutes: int
    author_name: str
    publication_status: str
    is_ai_generated: bool
    created_at: datetime
    updated_at: datetime
    tags: list[TagSchema] = []
    related_articles: list[ArticleSummarySchema] = []

    model_config = ConfigDict(from_attributes=True)


class PaginatedArticleResponse(BaseModel):
    items: list[ArticleSummarySchema]
    page: int
    limit: int
    total: int
    total_pages: int
