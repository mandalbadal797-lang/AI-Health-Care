from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.models.category import Category
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])


class CategoryCreateUpdateSchema(BaseModel):
    name: str = Field(..., max_length=50)
    slug: str = Field(..., max_length=60)
    description: Optional[str] = None
    icon_name: Optional[str] = "BookOpen"


@router.get("")
async def list_admin_categories(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all categories with usage count."""
    stmt = select(Category).order_by(Category.name.asc())
    res = await db.execute(stmt)
    cats = res.scalars().all()

    items = []
    for c in cats:
        items.append({
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "icon_name": c.icon_name,
        })
    return {"items": items}


@router.post("")
async def create_admin_category(
    payload: CategoryCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new category taxonomy."""
    stmt = select(Category).where(Category.slug == payload.slug)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Category slug already exists.")

    cat = Category(
        name=payload.name,
        slug=payload.slug,
        description=payload.description,
        icon_name=payload.icon_name,
    )
    db.add(cat)
    await db.flush()

    audit = AuditLog(
        user_id=admin_user.id,
        action="CATEGORY_CREATED",
        content_type="category",
        content_id=str(cat.id),
        details=f"Created category '{cat.name}'",
    )
    db.add(audit)
    await db.commit()

    return {"id": cat.id, "message": "Category created successfully."}


@router.put("/{category_id}")
async def update_admin_category(
    category_id: int,
    payload: CategoryCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update existing category taxonomy."""
    stmt = select(Category).where(Category.id == category_id)
    res = await db.execute(stmt)
    cat = res.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")

    cat.name = payload.name
    cat.slug = payload.slug
    cat.description = payload.description
    cat.icon_name = payload.icon_name

    audit = AuditLog(
        user_id=admin_user.id,
        action="CATEGORY_UPDATED",
        content_type="category",
        content_id=str(cat.id),
        details=f"Updated category '{cat.name}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Category updated successfully."}
