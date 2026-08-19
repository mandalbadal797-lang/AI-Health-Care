import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import select, delete, func, or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.feedback import ContentFeedback
from app.models.audit_log import AuditLog
from app.services.library_service import LibraryService


class FeedbackService:
    """Core service managing student content feedback, ratings, and administrative quality moderation."""

    @classmethod
    def _classify_comment_ai(cls, comment: str) -> str:
        """Categorize written comment into operational content quality bucket without psychological profiling."""
        if not comment or not comment.strip():
            return "General"
        text = comment.lower()
        if any(w in text for w in ["bug", "audio", "broken", "sound", "volume", "error", "load"]):
            return "Technical Issue"
        elif any(w in text for w in ["great", "helpful", "loved", "awesome", "excellent", "clear", "good"]):
            return "Positive"
        elif any(w in text for w in ["add", "should", "suggest", "could", "more", "wish", "please"]):
            return "Suggestion"
        elif any(w in text for w in ["confusing", "hard", "long", "boring", "bad", "difficult"]):
            return "Content Issue"
        return "General"

    @classmethod
    async def submit_or_update_feedback(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        content_id: str,
        content_type: str,
        is_helpful: bool,
        rating: Optional[int] = None,
        category_tags: Optional[List[str]] = None,
        comment: Optional[str] = None,
    ) -> ContentFeedback:
        """Submit or update student feedback for published content."""
        # 1. Validate Content Existence & Publication Status
        c_meta = await LibraryService.validate_public_content(db, content_id, content_type)
        if not c_meta:
            raise ValueError("Target content does not exist or is not publicly published.")

        # 2. Validate Rating
        if rating is not None and (rating < 1 or rating > 5):
            raise ValueError("Rating must be an integer between 1 and 5.")

        # 3. Validate Comment Length
        cleaned_comment = comment.strip() if comment else None
        if cleaned_comment and len(cleaned_comment) > 1000:
            raise ValueError("Written feedback comment exceeds maximum length of 1000 characters.")

        # 4. Find Existing Feedback Record
        stmt = select(ContentFeedback).where(
            ContentFeedback.user_id == user_id,
            ContentFeedback.content_id == content_id,
            ContentFeedback.content_type == content_type,
        )
        res = await db.execute(stmt)
        fb = res.scalar_one_or_none()

        now = datetime.now(timezone.utc)
        ai_cat = cls._classify_comment_ai(cleaned_comment) if cleaned_comment else None

        if not fb:
            fb = ContentFeedback(
                user_id=user_id,
                content_id=content_id,
                content_type=content_type,
                is_helpful=is_helpful,
                rating=rating,
                category_tags={"tags": category_tags} if category_tags else None,
                comment=cleaned_comment,
                ai_category=ai_cat,
                moderation_status="pending" if cleaned_comment else "approved",
                created_at=now,
                updated_at=now,
            )
            db.add(fb)
        else:
            fb.is_helpful = is_helpful
            if rating is not None:
                fb.rating = rating
            if category_tags is not None:
                fb.category_tags = {"tags": category_tags}
            if cleaned_comment is not None:
                fb.comment = cleaned_comment
                fb.ai_category = ai_cat
                fb.moderation_status = "pending"
            fb.updated_at = now

        await db.commit()
        await db.refresh(fb)
        return fb

    @classmethod
    async def get_student_feedback(
        cls, db: AsyncSession, user_id: uuid.UUID, content_id: str, content_type: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch authenticated student's own feedback record for a specific content item."""
        stmt = select(ContentFeedback).where(
            ContentFeedback.user_id == user_id,
            ContentFeedback.content_id == content_id,
            ContentFeedback.content_type == content_type,
        )
        res = await db.execute(stmt)
        fb = res.scalar_one_or_none()
        if not fb:
            return None

        tags = fb.category_tags.get("tags", []) if fb.category_tags else []
        return {
            "id": str(fb.id),
            "content_id": fb.content_id,
            "content_type": fb.content_type,
            "is_helpful": fb.is_helpful,
            "rating": fb.rating,
            "category_tags": tags,
            "comment": fb.comment,
            "updated_at": fb.updated_at.isoformat(),
        }

    @classmethod
    async def delete_student_feedback(
        cls, db: AsyncSession, user_id: uuid.UUID, content_id: str, content_type: str
    ) -> bool:
        """Delete authenticated student's own feedback record."""
        stmt = delete(ContentFeedback).where(
            ContentFeedback.user_id == user_id,
            ContentFeedback.content_id == content_id,
            ContentFeedback.content_type == content_type,
        )
        res = await db.execute(stmt)
        await db.commit()
        return res.rowcount > 0

    @classmethod
    async def get_public_feedback_summary(
        cls, db: AsyncSession, content_id: str, content_type: str
    ) -> Dict[str, Any]:
        """Compute public aggregate feedback quality metrics for target content."""
        stmt = select(ContentFeedback).where(
            ContentFeedback.content_id == content_id,
            ContentFeedback.content_type == content_type,
        )
        res = await db.execute(stmt)
        feedbacks = res.scalars().all()

        total_responses = len(feedbacks)
        if total_responses == 0:
            return {
                "total_responses": 0,
                "helpful_count": 0,
                "not_helpful_count": 0,
                "helpful_rate": 0.0,
                "average_rating": 0.0,
                "rating_count": 0,
                "rating_distribution": {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
            }

        helpful_count = sum(1 for f in feedbacks if f.is_helpful)
        not_helpful_count = total_responses - helpful_count
        helpful_rate = round((helpful_count / total_responses) * 100, 1)

        ratings = [f.rating for f in feedbacks if f.rating is not None]
        rating_count = len(ratings)
        avg_rating = round(sum(ratings) / rating_count, 1) if rating_count > 0 else 0.0

        dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in ratings:
            if 1 <= r <= 5:
                dist[r] += 1

        return {
            "total_responses": total_responses,
            "helpful_count": helpful_count,
            "not_helpful_count": not_helpful_count,
            "helpful_rate": helpful_rate,
            "average_rating": avg_rating,
            "rating_count": rating_count,
            "rating_distribution": dist,
        }

    @classmethod
    async def get_admin_feedback_dashboard(
        cls,
        db: AsyncSession,
        content_type: str = "all",
        moderation_status: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Retrieve aggregated feedback quality metrics and moderation queue for administrators."""
        # 1. Total & Moderation Counts
        total_stmt = select(func.count(ContentFeedback.id))
        total_res = await db.execute(total_stmt)
        total_responses = total_res.scalar() or 0

        pending_stmt = select(func.count(ContentFeedback.id)).where(ContentFeedback.moderation_status == "pending")
        pending_res = await db.execute(pending_stmt)
        pending_count = pending_res.scalar() or 0

        helpful_stmt = select(func.count(ContentFeedback.id)).where(ContentFeedback.is_helpful == True)
        helpful_res = await db.execute(helpful_stmt)
        helpful_count = helpful_res.scalar() or 0
        overall_helpful_rate = round((helpful_count / total_responses) * 100, 1) if total_responses > 0 else 0.0

        avg_stmt = select(func.avg(ContentFeedback.rating)).where(ContentFeedback.rating.isnot(None))
        avg_res = await db.execute(avg_stmt)
        avg_val = avg_res.scalar()
        overall_avg_rating = round(float(avg_val), 1) if avg_val else 0.0

        # 2. Paginated Comments Queue
        list_stmt = select(ContentFeedback)
        if content_type != "all":
            list_stmt = list_stmt.where(ContentFeedback.content_type == content_type)
        if moderation_status:
            list_stmt = list_stmt.where(ContentFeedback.moderation_status == moderation_status)

        list_stmt = list_stmt.order_by(ContentFeedback.created_at.desc())
        list_res = await db.execute(list_stmt)
        all_fb = list_res.scalars().all()

        skip = (page - 1) * limit
        paginated_fb = all_fb[skip : skip + limit]

        items = []
        for fb in paginated_fb:
            meta = await LibraryService.validate_public_content(db, fb.content_id, fb.content_type)
            tags = fb.category_tags.get("tags", []) if fb.category_tags else []
            items.append({
                "id": str(fb.id),
                "content_id": fb.content_id,
                "content_type": fb.content_type,
                "content_title": meta["title"] if meta else "Content Resource",
                "content_url": meta["url"] if meta else "#",
                "is_helpful": fb.is_helpful,
                "rating": fb.rating,
                "category_tags": tags,
                "comment": fb.comment,
                "ai_category": fb.ai_category or "General",
                "moderation_status": fb.moderation_status,
                "created_at": fb.created_at.isoformat(),
            })

        return {
            "summary": {
                "total_responses": total_responses,
                "pending_moderation_count": pending_count,
                "overall_helpful_rate": overall_helpful_rate,
                "overall_average_rating": overall_avg_rating,
            },
            "page": page,
            "limit": limit,
            "total": len(all_fb),
            "items": items,
        }

    @classmethod
    async def moderate_feedback(
        cls,
        db: AsyncSession,
        admin_id: uuid.UUID,
        feedback_id: uuid.UUID,
        status: str,
        reason: Optional[str] = None,
    ) -> ContentFeedback:
        """Update written feedback moderation status and append audit log."""
        if status not in ["approved", "rejected", "flagged"]:
            raise ValueError("Invalid moderation status. Must be approved, rejected, or flagged.")

        stmt = select(ContentFeedback).where(ContentFeedback.id == feedback_id)
        res = await db.execute(stmt)
        fb = res.scalar_one_or_none()
        if not fb:
            raise ValueError("Target content feedback record not found.")

        old_status = fb.moderation_status
        fb.moderation_status = status
        fb.moderated_by = admin_id
        fb.moderated_at = datetime.now(timezone.utc)

        audit = AuditLog(
            user_id=admin_id,
            action=f"FEEDBACK_{status.upper()}",
            content_type=fb.content_type,
            content_id=fb.content_id,
            details=f"Changed feedback {feedback_id} status from '{old_status}' to '{status}'. Reason: {reason or 'Admin moderation'}",
        )
        db.add(audit)

        await db.commit()
        await db.refresh(fb)
        return fb
