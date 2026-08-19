from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.models.article import Article
from app.models.podcast import Podcast
from app.models.story import Story
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/dashboard")
async def get_admin_dashboard(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve operational content metrics for administrative dashboard."""
    # 1. Articles stats
    art_total_res = await db.execute(select(func.count(Article.id)))
    art_total = art_total_res.scalar() or 0

    art_pub_res = await db.execute(select(func.count(Article.id)).where(Article.publication_status == "published"))
    art_pub = art_pub_res.scalar() or 0

    art_draft_res = await db.execute(select(func.count(Article.id)).where(Article.publication_status == "draft"))
    art_draft = art_draft_res.scalar() or 0

    # 2. Podcasts stats
    pod_total_res = await db.execute(select(func.count(Podcast.id)))
    pod_total = pod_total_res.scalar() or 0

    pod_pub_res = await db.execute(select(func.count(Podcast.id)).where(Podcast.publication_status == "published"))
    pod_pub = pod_pub_res.scalar() or 0

    pod_draft_res = await db.execute(select(func.count(Podcast.id)).where(Podcast.publication_status == "draft"))
    pod_draft = pod_draft_res.scalar() or 0

    # 3. Stories stats
    st_total_res = await db.execute(select(func.count(Story.id)))
    st_total = st_total_res.scalar() or 0

    st_pub_res = await db.execute(select(func.count(Story.id)).where(Story.publication_status == "published"))
    st_pub = st_pub_res.scalar() or 0

    st_draft_res = await db.execute(select(func.count(Story.id)).where(Story.publication_status == "draft"))
    st_draft = st_draft_res.scalar() or 0

    # 4. Moderation Queue Count (Drafts / Pending Review)
    pending_moderation = art_draft + pod_draft + st_draft

    return {
        "articles": {"total": art_total, "published": art_pub, "draft": art_draft},
        "podcasts": {"total": pod_total, "published": pod_pub, "draft": pod_draft},
        "stories": {"total": st_total, "published": st_pub, "draft": st_draft},
        "pending_moderation_count": pending_moderation,
    }
