import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.models.story import Story
from app.models.category import Category
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/admin", tags=["Admin Stories & Moderation"])


class StoryCreateUpdateSchema(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=280)
    subtitle: str = Field(..., max_length=500)
    content: str
    category_id: int
    author_name: str = Field(default="Student Story — Demonstration")
    reading_time_minutes: int = Field(default=5, ge=1)
    reflection_question: Optional[str] = None
    key_takeaway: Optional[str] = None
    publication_status: str = Field(default="draft")


@router.get("/stories")
async def list_admin_stories(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    category_id: Optional[int] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List digital stories for admin management."""
    stmt = select(Story)
    count_stmt = select(func.count(Story.id))

    if search and search.strip():
        term = f"%{search.strip()}%"
        condition = or_(Story.title.ilike(term), Story.slug.ilike(term), Story.subtitle.ilike(term))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if status_filter and status_filter.strip():
        stmt = stmt.where(Story.publication_status == status_filter.strip())
        count_stmt = count_stmt.where(Story.publication_status == status_filter.strip())

    if category_id:
        stmt = stmt.where(Story.category_id == category_id)
        count_stmt = count_stmt.where(Story.category_id == category_id)

    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    skip = (page - 1) * limit
    stmt = stmt.order_by(Story.created_at.desc()).offset(skip).limit(limit)
    res = await db.execute(stmt)
    stories = res.scalars().all()

    items = []
    for st in stories:
        cat_stmt = select(Category).where(Category.id == st.category_id)
        cat_res = await db.execute(cat_stmt)
        cat = cat_res.scalar_one_or_none()

        items.append({
            "id": str(st.id),
            "title": st.title,
            "slug": st.slug,
            "subtitle": st.subtitle,
            "category_id": st.category_id,
            "category_name": cat.name if cat else "General",
            "author_name": st.author_name,
            "reading_time_minutes": st.reading_time_minutes,
            "publication_status": st.publication_status,
            "created_at": st.created_at.isoformat(),
        })

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
    }


@router.post("/stories")
async def create_admin_story(
    payload: StoryCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new digital story."""
    slug_stmt = select(Story).where(Story.slug == payload.slug)
    slug_res = await db.execute(slug_stmt)
    if slug_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Story slug already exists.")

    story = Story(
        title=payload.title,
        slug=payload.slug,
        subtitle=payload.subtitle,
        content=payload.content,
        author_name=payload.author_name,
        category_id=payload.category_id,
        reading_time_minutes=payload.reading_time_minutes,
        reflection_question=payload.reflection_question,
        key_takeaway=payload.key_takeaway,
        publication_status=payload.publication_status,
    )
    db.add(story)
    await db.flush()

    audit = AuditLog(
        user_id=admin_user.id,
        action="STORY_CREATED",
        content_type="story",
        content_id=str(story.id),
        details=f"Created digital story '{story.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"id": str(story.id), "message": "Digital story created successfully."}


@router.get("/stories/{story_id}")
async def get_admin_story(
    story_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get digital story for editing."""
    try:
        st_uuid = uuid.UUID(story_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid story ID format.")

    stmt = select(Story).where(Story.id == st_uuid)
    res = await db.execute(stmt)
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Digital story not found.")

    return {
        "id": str(st.id),
        "title": st.title,
        "slug": st.slug,
        "subtitle": st.subtitle,
        "content": st.content,
        "author_name": st.author_name,
        "reading_time_minutes": st.reading_time_minutes,
        "category_id": st.category_id,
        "reflection_question": st.reflection_question,
        "key_takeaway": st.key_takeaway,
        "publication_status": st.publication_status,
        "created_at": st.created_at.isoformat(),
    }


@router.put("/stories/{story_id}")
async def update_admin_story(
    story_id: str,
    payload: StoryCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update digital story."""
    try:
        st_uuid = uuid.UUID(story_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid story ID format.")

    stmt = select(Story).where(Story.id == st_uuid)
    res = await db.execute(stmt)
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Digital story not found.")

    st.title = payload.title
    st.slug = payload.slug
    st.subtitle = payload.subtitle
    st.content = payload.content
    st.author_name = payload.author_name
    st.category_id = payload.category_id
    st.reading_time_minutes = payload.reading_time_minutes
    st.reflection_question = payload.reflection_question
    st.key_takeaway = payload.key_takeaway
    st.publication_status = payload.publication_status

    audit = AuditLog(
        user_id=admin_user.id,
        action="STORY_UPDATED",
        content_type="story",
        content_id=str(st.id),
        details=f"Updated digital story '{st.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Digital story updated successfully."}


@router.patch("/stories/{story_id}/publish")
async def publish_admin_story(
    story_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Publish digital story."""
    try:
        st_uuid = uuid.UUID(story_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid story ID format.")

    stmt = select(Story).where(Story.id == st_uuid)
    res = await db.execute(stmt)
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Digital story not found.")

    st.publication_status = "published"
    audit = AuditLog(
        user_id=admin_user.id,
        action="STORY_PUBLISHED",
        content_type="story",
        content_id=str(st.id),
        details=f"Published digital story '{st.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Digital story published successfully."}


@router.patch("/stories/{story_id}/unpublish")
async def unpublish_admin_story(
    story_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Unpublish digital story."""
    try:
        st_uuid = uuid.UUID(story_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid story ID format.")

    stmt = select(Story).where(Story.id == st_uuid)
    res = await db.execute(stmt)
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Digital story not found.")

    st.publication_status = "draft"
    audit = AuditLog(
        user_id=admin_user.id,
        action="STORY_UNPUBLISHED",
        content_type="story",
        content_id=str(st.id),
        details=f"Unpublished digital story '{st.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Digital story unpublished successfully."}


@router.delete("/stories/{story_id}")
async def delete_admin_story(
    story_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Archive digital story."""
    try:
        st_uuid = uuid.UUID(story_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid story ID format.")

    stmt = select(Story).where(Story.id == st_uuid)
    res = await db.execute(stmt)
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Digital story not found.")

    st.publication_status = "archived"
    audit = AuditLog(
        user_id=admin_user.id,
        action="STORY_ARCHIVED",
        content_type="story",
        content_id=str(st.id),
        details=f"Archived digital story '{st.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Digital story archived successfully."}


# --- MODERATION QUEUE ---

@router.get("/moderation")
async def get_moderation_queue(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List content items awaiting administrative safety & editorial moderation approval."""
    # Retrieve draft articles, podcasts, and stories requiring review
    art_stmt = select(Story).where(Story.publication_status == "draft").limit(10)
    res = await db.execute(art_stmt)
    draft_stories = res.scalars().all()

    queue = []
    for st in draft_stories:
        queue.append({
            "id": str(st.id),
            "content_type": "story",
            "title": st.title,
            "author_name": st.author_name,
            "status": st.publication_status,
            "created_at": st.created_at.isoformat(),
            "safety_warning": "Educational Demonstration Narrative Review",
        })

    return {"items": queue, "total": len(queue)}
