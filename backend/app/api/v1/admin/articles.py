import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.models.article import Article
from app.models.category import Category
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/admin/articles", tags=["Admin Articles"])


class ArticleCreateUpdateSchema(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=280)
    excerpt: str = Field(..., max_length=500)
    content: str
    category_id: int
    reading_time_minutes: int = Field(default=5, ge=1)
    publication_status: str = Field(default="draft")
    is_ai_generated: bool = Field(default=False)
    author_name: Optional[str] = Field(default="MindCampus Editorial")


@router.get("")
async def list_admin_articles(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    category_id: Optional[int] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all articles for admin management (including drafts and archived)."""
    stmt = select(Article)
    count_stmt = select(func.count(Article.id))

    if search and search.strip():
        term = f"%{search.strip()}%"
        condition = or_(Article.title.ilike(term), Article.slug.ilike(term), Article.excerpt.ilike(term))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if status_filter and status_filter.strip():
        stmt = stmt.where(Article.publication_status == status_filter.strip())
        count_stmt = count_stmt.where(Article.publication_status == status_filter.strip())

    if category_id:
        stmt = stmt.where(Article.category_id == category_id)
        count_stmt = count_stmt.where(Article.category_id == category_id)

    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    skip = (page - 1) * limit
    stmt = stmt.order_by(Article.created_at.desc()).offset(skip).limit(limit)
    res = await db.execute(stmt)
    articles = res.scalars().all()

    items = []
    for art in articles:
        cat_stmt = select(Category).where(Category.id == art.category_id)
        cat_res = await db.execute(cat_stmt)
        cat = cat_res.scalar_one_or_none()

        items.append({
            "id": str(art.id),
            "title": art.title,
            "slug": art.slug,
            "excerpt": art.excerpt,
            "category_id": art.category_id,
            "category_name": cat.name if cat else "General",
            "reading_time_minutes": art.reading_time_minutes,
            "publication_status": art.publication_status,
            "is_ai_generated": art.is_ai_generated,
            "author_name": art.author.full_name if art.author else "MindCampus Editorial",
            "created_at": art.created_at.isoformat(),
            "updated_at": art.updated_at.isoformat(),
        })

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
    }


@router.post("")
async def create_admin_article(
    payload: ArticleCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new article."""
    slug_stmt = select(Article).where(Article.slug == payload.slug)
    slug_res = await db.execute(slug_stmt)
    if slug_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Article slug already exists.")

    article = Article(
        title=payload.title,
        slug=payload.slug,
        excerpt=payload.excerpt,
        content=payload.content,
        author_id=admin_user.id,
        category_id=payload.category_id,
        reading_time_minutes=payload.reading_time_minutes,
        publication_status=payload.publication_status,
        is_ai_generated=payload.is_ai_generated,
    )
    db.add(article)
    await db.flush()

    audit = AuditLog(
        user_id=admin_user.id,
        action="BLOG_CREATED",
        content_type="article",
        content_id=str(article.id),
        details=f"Created article '{article.title}' with status {article.publication_status}",
    )
    db.add(audit)
    await db.commit()

    return {"id": str(article.id), "message": "Article created successfully."}


@router.get("/{article_id}")
async def get_admin_article(
    article_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get article details for editing/previewing."""
    try:
        art_uuid = uuid.UUID(article_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid article ID format.")

    stmt = select(Article).where(Article.id == art_uuid)
    res = await db.execute(stmt)
    art = res.scalar_one_or_none()
    if not art:
        raise HTTPException(status_code=404, detail="Article not found.")

    return {
        "id": str(art.id),
        "title": art.title,
        "slug": art.slug,
        "excerpt": art.excerpt,
        "content": art.content,
        "category_id": art.category_id,
        "reading_time_minutes": art.reading_time_minutes,
        "publication_status": art.publication_status,
        "is_ai_generated": art.is_ai_generated,
        "created_at": art.created_at.isoformat(),
    }


@router.put("/{article_id}")
async def update_admin_article(
    article_id: str,
    payload: ArticleCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update existing article."""
    try:
        art_uuid = uuid.UUID(article_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid article ID format.")

    stmt = select(Article).where(Article.id == art_uuid)
    res = await db.execute(stmt)
    art = res.scalar_one_or_none()
    if not art:
        raise HTTPException(status_code=404, detail="Article not found.")

    art.title = payload.title
    art.slug = payload.slug
    art.excerpt = payload.excerpt
    art.content = payload.content
    art.category_id = payload.category_id
    art.reading_time_minutes = payload.reading_time_minutes
    art.publication_status = payload.publication_status
    art.is_ai_generated = payload.is_ai_generated

    audit = AuditLog(
        user_id=admin_user.id,
        action="BLOG_UPDATED",
        content_type="article",
        content_id=str(art.id),
        details=f"Updated article '{art.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Article updated successfully."}


@router.patch("/{article_id}/publish")
async def publish_admin_article(
    article_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Publish an article."""
    try:
        art_uuid = uuid.UUID(article_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid article ID format.")

    stmt = select(Article).where(Article.id == art_uuid)
    res = await db.execute(stmt)
    art = res.scalar_one_or_none()
    if not art:
        raise HTTPException(status_code=404, detail="Article not found.")

    art.publication_status = "published"
    audit = AuditLog(
        user_id=admin_user.id,
        action="BLOG_PUBLISHED",
        content_type="article",
        content_id=str(art.id),
        details=f"Published article '{art.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Article published successfully."}


@router.patch("/{article_id}/unpublish")
async def unpublish_admin_article(
    article_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Unpublish an article (revert to draft)."""
    try:
        art_uuid = uuid.UUID(article_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid article ID format.")

    stmt = select(Article).where(Article.id == art_uuid)
    res = await db.execute(stmt)
    art = res.scalar_one_or_none()
    if not art:
        raise HTTPException(status_code=404, detail="Article not found.")

    art.publication_status = "draft"
    audit = AuditLog(
        user_id=admin_user.id,
        action="BLOG_UNPUBLISHED",
        content_type="article",
        content_id=str(art.id),
        details=f"Unpublished article '{art.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Article unpublished successfully."}


@router.delete("/{article_id}")
async def delete_admin_article(
    article_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Archive or delete an article."""
    try:
        art_uuid = uuid.UUID(article_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid article ID format.")

    stmt = select(Article).where(Article.id == art_uuid)
    res = await db.execute(stmt)
    art = res.scalar_one_or_none()
    if not art:
        raise HTTPException(status_code=404, detail="Article not found.")

    art.publication_status = "archived"
    audit = AuditLog(
        user_id=admin_user.id,
        action="BLOG_ARCHIVED",
        content_type="article",
        content_id=str(art.id),
        details=f"Archived article '{art.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Article archived successfully."}
