from datetime import datetime
from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    icon_name: str | None = None


class CategorySchema(CategoryBase):
    id: int
    article_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryListResponse(BaseModel):
    items: list[CategorySchema]
    total: int
