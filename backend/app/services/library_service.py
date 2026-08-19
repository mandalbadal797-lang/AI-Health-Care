import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import select, delete, func, or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.library import SavedContent, ContentProgress, RecentlyViewed
from app.models.article import Article
from app.models.podcast import Podcast
from app.models.story import Story


class LibraryService:
    """Core service managing user bookmarks, progress tracking, and recently viewed library items."""

    @classmethod
    async def validate_public_content(
        cls, db: AsyncSession, content_id: str, content_type: str
    ) -> Optional[dict]:
        """Validate content existence and return metadata if published."""
        content_type = content_type.lower()
        if content_type in ["article", "blog"]:
            try:
                art_id = uuid.UUID(content_id)
                stmt = select(Article).options(joinedload(Article.category), joinedload(Article.author)).where(
                    Article.id == art_id, Article.publication_status == "published"
                )
                res = await db.execute(stmt)
                art = res.scalar_one_or_none()
                if art:
                    return {
                        "id": str(art.id),
                        "type": "article",
                        "title": art.title,
                        "slug": art.slug,
                        "excerpt": art.excerpt,
                        "category_id": art.category_id,
                        "category_name": art.category.name if art.category else "General",
                        "url": f"/blog/{art.slug}",
                        "reading_time_minutes": art.reading_time_minutes,
                        "author_name": art.author.full_name if art.author else "MindCampus Editorial",
                        "created_at": art.created_at,
                    }
            except ValueError:
                return None

        elif content_type == "podcast":
            try:
                pod_id = uuid.UUID(content_id)
                stmt = select(Podcast).options(joinedload(Podcast.category)).where(
                    Podcast.id == pod_id, Podcast.publication_status == "published"
                )
                res = await db.execute(stmt)
                pod = res.scalar_one_or_none()
                if pod:
                    return {
                        "id": str(pod.id),
                        "type": "podcast",
                        "title": pod.title,
                        "slug": pod.slug,
                        "excerpt": pod.description,
                        "category_id": pod.category_id,
                        "category_name": pod.category.name if pod.category else "General",
                        "url": f"/podcasts/{pod.slug}",
                        "duration_seconds": pod.duration_seconds,
                        "episode_number": pod.episode_number,
                        "created_at": pod.created_at,
                    }
            except ValueError:
                return None

        elif content_type == "story":
            try:
                st_id = uuid.UUID(content_id)
                stmt = select(Story).options(joinedload(Story.category)).where(
                    Story.id == st_id, Story.publication_status == "published"
                )
                res = await db.execute(stmt)
                st = res.scalar_one_or_none()
                if st:
                    return {
                        "id": str(st.id),
                        "type": "story",
                        "title": st.title,
                        "slug": st.slug,
                        "excerpt": st.subtitle,
                        "category_id": st.category_id,
                        "category_name": st.category.name if st.category else "General",
                        "url": f"/stories/{st.slug}",
                        "reading_time_minutes": st.reading_time_minutes,
                        "author_name": st.author_name,
                        "created_at": st.created_at,
                    }
            except ValueError:
                return None

        return None

    @classmethod
    async def save_content(
        cls, db: AsyncSession, user_id: uuid.UUID, content_id: str, content_type: str
    ) -> SavedContent:
        """Save a bookmark for target content, verifying public publication status."""
        c_meta = await cls.validate_public_content(db, content_id, content_type)
        if not c_meta:
            raise ValueError("Target content does not exist or is not publicly published.")

        # Check existing save to prevent duplicates
        stmt = select(SavedContent).where(
            SavedContent.user_id == user_id,
            SavedContent.content_id == content_id,
            SavedContent.content_type == content_type,
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            return existing

        saved = SavedContent(
            user_id=user_id,
            content_id=content_id,
            content_type=content_type,
            saved_at=datetime.now(timezone.utc),
        )
        db.add(saved)
        await db.commit()
        await db.refresh(saved)
        return saved

    @classmethod
    async def remove_saved_content(
        cls, db: AsyncSession, user_id: uuid.UUID, content_id: str, content_type: str
    ) -> bool:
        """Remove saved bookmark for target user and content ID."""
        stmt = delete(SavedContent).where(
            SavedContent.user_id == user_id,
            SavedContent.content_id == content_id,
            SavedContent.content_type == content_type,
        )
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount > 0

    @classmethod
    async def get_user_saved_library(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        content_type: str = "all",
        category_id: Optional[int] = None,
        sort: str = "recently_saved",
        query: str = "",
    ) -> List[Dict[str, Any]]:
        """Retrieve user's saved library items joined with current published content details."""
        stmt = select(SavedContent).where(SavedContent.user_id == user_id)
        if content_type and content_type != "all":
            stmt = stmt.where(SavedContent.content_type == content_type)

        res = await db.execute(stmt)
        saves = res.scalars().all()

        library_items = []
        for s in saves:
            meta = await cls.validate_public_content(db, s.content_id, s.content_type)
            if not meta:
                # Unpublished content is excluded from active student library display
                continue

            if category_id and meta.get("category_id") != category_id:
                continue

            if query and query.strip():
                q_lower = query.strip().lower()
                if q_lower not in meta["title"].lower() and q_lower not in meta["excerpt"].lower():
                    continue

            # Fetch associated progress record if present
            prog_stmt = select(ContentProgress).where(
                ContentProgress.user_id == user_id,
                ContentProgress.content_id == s.content_id,
                ContentProgress.content_type == s.content_type,
            )
            prog_res = await db.execute(prog_stmt)
            prog = prog_res.scalar_one_or_none()

            meta["saved_id"] = str(s.id)
            meta["saved_at"] = s.saved_at.isoformat()
            meta["saved_at_raw"] = s.saved_at
            meta["progress_percent"] = prog.progress_percent if prog else 0.0
            meta["position_seconds"] = prog.position_seconds if prog else 0.0
            meta["is_completed"] = prog.is_completed if prog else False
            meta["last_accessed_at"] = prog.last_accessed_at.isoformat() if prog else s.saved_at.isoformat()
            meta["last_accessed_at_raw"] = prog.last_accessed_at if prog else s.saved_at

            library_items.append(meta)

        # Apply Sorting
        if sort == "recently_accessed":
            library_items.sort(key=lambda x: x["last_accessed_at_raw"], reverse=True)
        elif sort == "alphabetical":
            library_items.sort(key=lambda x: x["title"].lower())
        elif sort == "oldest_saved":
            library_items.sort(key=lambda x: x["saved_at_raw"])
        else:  # recently_saved
            library_items.sort(key=lambda x: x["saved_at_raw"], reverse=True)

        # Clean temporary raw datetime objects
        results = []
        for item in library_items:
            clean = {k: v for k, v in item.items() if k not in ["saved_at_raw", "last_accessed_at_raw"]}
            results.append(clean)

        return results

    @classmethod
    async def update_content_progress(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        content_id: str,
        content_type: str,
        progress_percent: float,
        position_seconds: float = 0.0,
        duration_seconds: float = 0.0,
    ) -> ContentProgress:
        """Update or insert content progress record for target student."""
        if progress_percent < 0 or progress_percent > 100:
            raise ValueError("Progress percentage must be between 0 and 100.")
        if position_seconds < 0:
            raise ValueError("Position seconds cannot be negative.")

        meta = await cls.validate_public_content(db, content_id, content_type)
        if not meta:
            raise ValueError("Target content does not exist or is not published.")

        stmt = select(ContentProgress).where(
            ContentProgress.user_id == user_id,
            ContentProgress.content_id == content_id,
            ContentProgress.content_type == content_type,
        )
        res = await db.execute(stmt)
        prog = res.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        is_completed = progress_percent >= 90.0

        if not prog:
            prog = ContentProgress(
                user_id=user_id,
                content_id=content_id,
                content_type=content_type,
                progress_percent=progress_percent,
                position_seconds=position_seconds,
                duration_seconds=duration_seconds,
                is_completed=is_completed,
                last_accessed_at=now,
                completed_at=now if is_completed else None,
            )
            db.add(prog)
        else:
            prog.progress_percent = max(prog.progress_percent, progress_percent)
            prog.position_seconds = position_seconds
            if duration_seconds > 0:
                prog.duration_seconds = duration_seconds
            prog.last_accessed_at = now
            if not prog.is_completed and is_completed:
                prog.is_completed = True
                prog.completed_at = now

        await db.commit()
        await db.refresh(prog)
        return prog

    @classmethod
    async def get_user_progress_list(
        cls, db: AsyncSession, user_id: uuid.UUID, mode: str = "all"
    ) -> List[Dict[str, Any]]:
        """Retrieve student's progress records (continue learning or completed items)."""
        stmt = select(ContentProgress).where(ContentProgress.user_id == user_id)
        if mode == "in_progress":
            stmt = stmt.where(ContentProgress.progress_percent > 0, ContentProgress.is_completed == False)
        elif mode == "completed":
            stmt = stmt.where(ContentProgress.is_completed == True)

        res = await db.execute(stmt)
        progresses = res.scalars().all()

        items = []
        for p in progresses:
            meta = await cls.validate_public_content(db, p.content_id, p.content_type)
            if not meta:
                continue

            meta["progress_id"] = str(p.id)
            meta["progress_percent"] = p.progress_percent
            meta["position_seconds"] = p.position_seconds
            meta["duration_seconds"] = p.duration_seconds
            meta["is_completed"] = p.is_completed
            meta["last_accessed_at"] = p.last_accessed_at.isoformat()
            meta["completed_at"] = p.completed_at.isoformat() if p.completed_at else None
            meta["last_accessed_at_raw"] = p.last_accessed_at

            items.append(meta)

        items.sort(key=lambda x: x["last_accessed_at_raw"], reverse=True)
        results = [{k: v for k, v in item.items() if k != "last_accessed_at_raw"} for item in items]
        return results

    @classmethod
    async def track_recently_viewed(
        cls, db: AsyncSession, user_id: uuid.UUID, content_id: str, content_type: str
    ) -> RecentlyViewed:
        """Upsert recently viewed item timestamp and cap maximum records at 20."""
        meta = await cls.validate_public_content(db, content_id, content_type)
        if not meta:
            raise ValueError("Target content is not public.")

        stmt = select(RecentlyViewed).where(
            RecentlyViewed.user_id == user_id,
            RecentlyViewed.content_id == content_id,
            RecentlyViewed.content_type == content_type,
        )
        res = await db.execute(stmt)
        rv = res.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        if rv:
            rv.viewed_at = now
        else:
            rv = RecentlyViewed(
                user_id=user_id,
                content_id=content_id,
                content_type=content_type,
                viewed_at=now,
            )
            db.add(rv)

        await db.commit()

        # Enforce history limit: delete records beyond latest 20 items
        all_stmt = select(RecentlyViewed).where(RecentlyViewed.user_id == user_id).order_by(RecentlyViewed.viewed_at.desc())
        all_res = await db.execute(all_stmt)
        records = all_res.scalars().all()
        if len(records) > 20:
            to_delete = records[20:]
            for d in to_delete:
                await db.delete(d)
            await db.commit()

        await db.refresh(rv)
        return rv

    @classmethod
    async def get_user_recently_viewed(
        cls, db: AsyncSession, user_id: uuid.UUID
    ) -> List[Dict[str, Any]]:
        """Fetch latest 20 recently viewed items for authenticated student."""
        stmt = select(RecentlyViewed).where(RecentlyViewed.user_id == user_id).order_by(RecentlyViewed.viewed_at.desc()).limit(20)
        res = await db.execute(stmt)
        views = res.scalars().all()

        items = []
        for v in views:
            meta = await cls.validate_public_content(db, v.content_id, v.content_type)
            if not meta:
                continue

            meta["viewed_at"] = v.viewed_at.isoformat()
            items.append(meta)

        return items
