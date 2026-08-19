from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.category import Category
from app.models.article import Article


class CategoryRepository:
    """Data access repository for Categories."""

    @staticmethod
    async def get_all_categories(db: AsyncSession) -> list[tuple[Category, int]]:
        """Retrieve all categories with their count of published articles."""
        stmt = (
            select(
                Category,
                func.count(
                    func.nullif(Article.publication_status != "published", True)
                ).label("article_count"),
            )
            .outerjoin(Article, Category.id == Article.category_id)
            .group_by(Category.id)
            .order_by(Category.name.asc())
        )
        result = await db.execute(stmt)
        return list(result.all())

    @staticmethod
    async def get_category_by_slug(db: AsyncSession, slug: str) -> Category | None:
        """Retrieve category by unique slug."""
        stmt = select(Category).where(Category.slug == slug)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
