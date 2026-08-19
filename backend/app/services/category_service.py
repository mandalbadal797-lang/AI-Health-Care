from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategorySchema, CategoryListResponse
from app.core.exceptions import CustomAPIException


class CategoryService:
    """Business logic service for category taxonomy."""

    @staticmethod
    async def get_all_categories(db: AsyncSession) -> CategoryListResponse:
        results = await CategoryRepository.get_all_categories(db)
        schemas = [
            CategorySchema(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                description=cat.description,
                icon_name=cat.icon_name,
                article_count=count,
                created_at=cat.created_at,
            )
            for cat, count in results
        ]
        return CategoryListResponse(items=schemas, total=len(schemas))

    @staticmethod
    async def get_category_by_slug(db: AsyncSession, slug: str) -> CategorySchema:
        cat = await CategoryRepository.get_category_by_slug(db, slug)
        if not cat:
            raise CustomAPIException(
                status_code=404,
                code="CATEGORY_NOT_FOUND",
                message=f"Category with slug '{slug}' was not found.",
            )
        return CategorySchema.model_validate(cat)
