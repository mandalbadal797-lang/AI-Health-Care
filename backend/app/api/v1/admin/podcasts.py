import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.models.podcast import Podcast
from app.models.category import Category
from app.models.user import User
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/admin/podcasts", tags=["Admin Podcasts"])


class PodcastCreateUpdateSchema(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=280)
    description: str
    audio_url: str
    duration_seconds: int = Field(default=300, ge=1)
    episode_number: int = Field(default=1, ge=1)
    category_id: int
    transcript: Optional[str] = None
    publication_status: str = Field(default="draft")


@router.get("")
async def list_admin_podcasts(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    category_id: Optional[int] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List podcasts for admin management."""
    stmt = select(Podcast)
    count_stmt = select(func.count(Podcast.id))

    if search and search.strip():
        term = f"%{search.strip()}%"
        condition = or_(Podcast.title.ilike(term), Podcast.slug.ilike(term), Podcast.description.ilike(term))
        stmt = stmt.where(condition)
        count_stmt = count_stmt.where(condition)

    if status_filter and status_filter.strip():
        stmt = stmt.where(Podcast.publication_status == status_filter.strip())
        count_stmt = count_stmt.where(Podcast.publication_status == status_filter.strip())

    if category_id:
        stmt = stmt.where(Podcast.category_id == category_id)
        count_stmt = count_stmt.where(Podcast.category_id == category_id)

    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    skip = (page - 1) * limit
    stmt = stmt.order_by(Podcast.created_at.desc()).offset(skip).limit(limit)
    res = await db.execute(stmt)
    podcasts = res.scalars().all()

    items = []
    for pod in podcasts:
        cat_stmt = select(Category).where(Category.id == pod.category_id)
        cat_res = await db.execute(cat_stmt)
        cat = cat_res.scalar_one_or_none()

        items.append({
            "id": str(pod.id),
            "title": pod.title,
            "slug": pod.slug,
            "description": pod.description,
            "audio_url": pod.audio_url,
            "episode_number": pod.episode_number,
            "category_id": pod.category_id,
            "category_name": cat.name if cat else "General",
            "duration_seconds": pod.duration_seconds,
            "publication_status": pod.publication_status,
            "created_at": pod.created_at.isoformat(),
        })

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
    }


@router.post("")
async def create_admin_podcast(
    payload: PodcastCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new podcast episode."""
    slug_stmt = select(Podcast).where(Podcast.slug == payload.slug)
    slug_res = await db.execute(slug_stmt)
    if slug_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Podcast slug already exists.")

    podcast = Podcast(
        title=payload.title,
        slug=payload.slug,
        description=payload.description,
        audio_url=payload.audio_url,
        duration_seconds=payload.duration_seconds,
        episode_number=payload.episode_number,
        category_id=payload.category_id,
        transcript=payload.transcript,
        publication_status=payload.publication_status,
    )
    db.add(podcast)
    await db.flush()

    audit = AuditLog(
        user_id=admin_user.id,
        action="PODCAST_CREATED",
        content_type="podcast",
        content_id=str(podcast.id),
        details=f"Created podcast '{podcast.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"id": str(podcast.id), "message": "Podcast created successfully."}


@router.get("/{podcast_id}")
async def get_admin_podcast(
    podcast_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get podcast details for editing."""
    try:
        pod_uuid = uuid.UUID(podcast_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format.")

    stmt = select(Podcast).where(Podcast.id == pod_uuid)
    res = await db.execute(stmt)
    pod = res.scalar_one_or_none()
    if not pod:
        raise HTTPException(status_code=404, detail="Podcast not found.")

    return {
        "id": str(pod.id),
        "title": pod.title,
        "slug": pod.slug,
        "description": pod.description,
        "audio_url": pod.audio_url,
        "episode_number": pod.episode_number,
        "duration_seconds": pod.duration_seconds,
        "category_id": pod.category_id,
        "transcript": pod.transcript,
        "publication_status": pod.publication_status,
        "created_at": pod.created_at.isoformat(),
    }


@router.put("/{podcast_id}")
async def update_admin_podcast(
    podcast_id: str,
    payload: PodcastCreateUpdateSchema,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update podcast episode."""
    try:
        pod_uuid = uuid.UUID(podcast_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format.")

    stmt = select(Podcast).where(Podcast.id == pod_uuid)
    res = await db.execute(stmt)
    pod = res.scalar_one_or_none()
    if not pod:
        raise HTTPException(status_code=404, detail="Podcast not found.")

    pod.title = payload.title
    pod.slug = payload.slug
    pod.description = payload.description
    pod.audio_url = payload.audio_url
    pod.duration_seconds = payload.duration_seconds
    pod.episode_number = payload.episode_number
    pod.category_id = payload.category_id
    pod.transcript = payload.transcript
    pod.publication_status = payload.publication_status

    audit = AuditLog(
        user_id=admin_user.id,
        action="PODCAST_UPDATED",
        content_type="podcast",
        content_id=str(pod.id),
        details=f"Updated podcast '{pod.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Podcast updated successfully."}


@router.patch("/{podcast_id}/publish")
async def publish_admin_podcast(
    podcast_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Publish podcast episode."""
    try:
        pod_uuid = uuid.UUID(podcast_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format.")

    stmt = select(Podcast).where(Podcast.id == pod_uuid)
    res = await db.execute(stmt)
    pod = res.scalar_one_or_none()
    if not pod:
        raise HTTPException(status_code=404, detail="Podcast not found.")

    pod.publication_status = "published"
    audit = AuditLog(
        user_id=admin_user.id,
        action="PODCAST_PUBLISHED",
        content_type="podcast",
        content_id=str(pod.id),
        details=f"Published podcast '{pod.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Podcast published successfully."}


@router.patch("/{podcast_id}/unpublish")
async def unpublish_admin_podcast(
    podcast_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Unpublish podcast episode."""
    try:
        pod_uuid = uuid.UUID(podcast_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format.")

    stmt = select(Podcast).where(Podcast.id == pod_uuid)
    res = await db.execute(stmt)
    pod = res.scalar_one_or_none()
    if not pod:
        raise HTTPException(status_code=404, detail="Podcast not found.")

    pod.publication_status = "draft"
    audit = AuditLog(
        user_id=admin_user.id,
        action="PODCAST_UNPUBLISHED",
        content_type="podcast",
        content_id=str(pod.id),
        details=f"Unpublished podcast '{pod.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Podcast unpublished successfully."}


@router.delete("/{podcast_id}")
async def delete_admin_podcast(
    podcast_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Archive podcast episode."""
    try:
        pod_uuid = uuid.UUID(podcast_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid podcast ID format.")

    stmt = select(Podcast).where(Podcast.id == pod_uuid)
    res = await db.execute(stmt)
    pod = res.scalar_one_or_none()
    if not pod:
        raise HTTPException(status_code=404, detail="Podcast not found.")

    pod.publication_status = "archived"
    audit = AuditLog(
        user_id=admin_user.id,
        action="PODCAST_ARCHIVED",
        content_type="podcast",
        content_id=str(pod.id),
        details=f"Archived podcast '{pod.title}'",
    )
    db.add(audit)
    await db.commit()

    return {"message": "Podcast archived successfully."}
