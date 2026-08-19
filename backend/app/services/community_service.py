import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.community import Comment, CommentHelpful, CommunityReport
from app.models.article import Article
from app.models.podcast import Podcast
from app.models.story import Story
from app.models.user import User
from app.models.audit_log import AuditLog


class CommunityService:
    """Service handling student comments, replies, helpful reactions, community reporting, and moderation."""

    @classmethod
    async def _verify_published_content(cls, db: AsyncSession, content_id: str, content_type: str):
        """Verify content resource exists and is published. Throws ValueError if draft or rejected."""
        if content_type == "article":
            res = await db.execute(select(Article).where(Article.id == uuid.UUID(content_id)))
            item = res.scalar_one_or_none()
            if not item or item.publication_status != "published":
                raise ValueError("Commenting disabled: Content resource is not published.")
        elif content_type == "podcast":
            res = await db.execute(select(Podcast).where(Podcast.id == uuid.UUID(content_id)))
            item = res.scalar_one_or_none()
            if not item or item.publication_status != "published":
                raise ValueError("Commenting disabled: Content resource is not published.")
        elif content_type == "story":
            res = await db.execute(select(Story).where(Story.id == uuid.UUID(content_id)))
            item = res.scalar_one_or_none()
            if not item or item.publication_status != "published":
                raise ValueError("Commenting disabled: Content resource is not published.")
        else:
            raise ValueError(f"Invalid content type '{content_type}'.")

    @classmethod
    def _sanitize_and_validate_body(cls, body: str) -> tuple[str, str]:
        """Validate length (3 to 1000 chars), sanitize script tags, and check for safety flags."""
        clean_body = body.strip()
        if len(clean_body) < 3:
            raise ValueError("Comment is too short. Minimum 3 characters required.")
        if len(clean_body) > 1000:
            raise ValueError("Comment is too long. Maximum 1000 characters permitted.")

        # XSS / Malicious Link Prevention
        clean_body = clean_body.replace("<script>", "").replace("</script>", "")
        if "javascript:" in clean_body.lower() or "data:text/html" in clean_body.lower():
            raise ValueError("Invalid comment content. Executable scripts or malicious protocols are forbidden.")

        # Automated Safety Scan: Flag clinical diagnosis or harassment phrases for pending review
        lower_text = clean_body.lower()
        clinical_flags = ["clinical depression", "medication dose", "bipolar disorder", "suicide method"]
        if any(f in lower_text for f in clinical_flags):
            return clean_body, "pending"

        return clean_body, "approved"

    @classmethod
    async def get_content_comments(
        cls,
        db: AsyncSession,
        content_id: str,
        content_type: str,
        current_user_id: Optional[uuid.UUID] = None,
    ) -> List[Dict[str, Any]]:
        """Fetch approved top-level comments and 2-level nested replies for published content."""
        # 1. Verify content is published
        await cls._verify_published_content(db, content_id, content_type)

        # 2. Fetch top-level approved comments
        stmt = (
            select(Comment, User.full_name)
            .join(User, Comment.user_id == User.id)
            .where(
                Comment.content_id == content_id,
                Comment.content_type == content_type,
                Comment.parent_comment_id.is_(None),
                Comment.status.in_(["approved", "deleted"]),
            )
            .order_by(Comment.created_at.desc())
        )
        res = await db.execute(stmt)
        rows = res.all()

        # Fetch helpful reactions set by user
        user_helpful_set = set()
        if current_user_id:
            h_res = await db.execute(
                select(CommentHelpful.comment_id).where(CommentHelpful.user_id == current_user_id)
            )
            user_helpful_set = set(h_res.scalars().all())

        comments = []
        for comment, author_name in rows:
            # Fetch replies for this comment
            r_stmt = (
                select(Comment, User.full_name)
                .join(User, Comment.user_id == User.id)
                .where(
                    Comment.parent_comment_id == comment.id,
                    Comment.status.in_(["approved", "deleted"]),
                )
                .order_by(Comment.created_at.asc())
            )
            r_res = await db.execute(r_stmt)
            r_rows = r_res.all()

            replies_list = [
                {
                    "id": str(reply.id),
                    "author_name": author_name_rep,
                    "user_id": str(reply.user_id),
                    "body": reply.body,
                    "status": reply.status,
                    "helpful_count": reply.helpful_count,
                    "is_helpful": reply.id in user_helpful_set,
                    "is_edited": reply.is_edited,
                    "created_at": reply.created_at.isoformat(),
                }
                for reply, author_name_rep in r_rows
            ]

            comments.append({
                "id": str(comment.id),
                "author_name": author_name,
                "user_id": str(comment.user_id),
                "body": comment.body,
                "status": comment.status,
                "helpful_count": comment.helpful_count,
                "is_helpful": comment.id in user_helpful_set,
                "is_edited": comment.is_edited,
                "created_at": comment.created_at.isoformat(),
                "replies": replies_list,
            })

        return comments

    @classmethod
    async def create_comment(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        content_id: str,
        content_type: str,
        body: str,
        parent_comment_id: Optional[uuid.UUID] = None,
    ) -> Comment:
        """Create a new comment or reply enforcing max 2-level reply depth and safety checks."""
        await cls._verify_published_content(db, content_id, content_type)
        clean_body, init_status = cls._sanitize_and_validate_body(body)

        # Enforce max 2-level nesting
        if parent_comment_id:
            parent_res = await db.execute(select(Comment).where(Comment.id == parent_comment_id))
            parent = parent_res.scalar_one_or_none()
            if not parent:
                raise ValueError("Parent comment not found.")
            if parent.parent_comment_id is not None:
                raise ValueError("Maximum reply depth reached (2 levels maximum).")

        comment = Comment(
            content_id=content_id,
            content_type=content_type,
            user_id=user_id,
            parent_comment_id=parent_comment_id,
            body=clean_body,
            status=init_status,
        )
        db.add(comment)
        db.add(AuditLog(user_id=user_id, action="COMMENT_CREATED", content_type=content_type, content_id=content_id))
        await db.commit()
        await db.refresh(comment)
        return comment

    @classmethod
    async def edit_comment(cls, db: AsyncSession, user_id: uuid.UUID, comment_id: uuid.UUID, new_body: str) -> Comment:
        """Edit student's own comment. IDOR Protected: Verifies comment.user_id == user_id."""
        res = await db.execute(select(Comment).where(Comment.id == comment_id))
        comment = res.scalar_one_or_none()
        if not comment or comment.status == "deleted":
            raise ValueError("Comment not found or deleted.")

        if comment.user_id != user_id:
            raise PermissionError("Forbidden: You can only edit your own comments.")

        clean_body, new_status = cls._sanitize_and_validate_body(new_body)
        comment.body = clean_body
        comment.status = new_status
        comment.is_edited = True
        comment.updated_at = datetime.now(timezone.utc)

        db.add(AuditLog(user_id=user_id, action="COMMENT_EDITED", content_type=comment.content_type, content_id=comment.content_id))
        await db.commit()
        await db.refresh(comment)
        return comment

    @classmethod
    async def delete_comment(cls, db: AsyncSession, user_id: uuid.UUID, comment_id: uuid.UUID) -> bool:
        """Soft delete student's own comment. IDOR Protected: Verifies comment.user_id == user_id."""
        res = await db.execute(select(Comment).where(Comment.id == comment_id))
        comment = res.scalar_one_or_none()
        if not comment:
            raise ValueError("Comment not found.")

        if comment.user_id != user_id:
            raise PermissionError("Forbidden: You can only delete your own comments.")

        comment.status = "deleted"
        comment.body = "[Comment removed]"
        comment.deleted_at = datetime.now(timezone.utc)

        db.add(AuditLog(user_id=user_id, action="COMMENT_DELETED", content_type=comment.content_type, content_id=comment.content_id))
        await db.commit()
        return True

    @classmethod
    async def toggle_comment_helpful(cls, db: AsyncSession, user_id: uuid.UUID, comment_id: uuid.UUID) -> Dict[str, Any]:
        """Toggle helpful reaction on a comment (1 reaction per user per comment)."""
        c_res = await db.execute(select(Comment).where(Comment.id == comment_id))
        comment = c_res.scalar_one_or_none()
        if not comment or comment.status != "approved":
            raise ValueError("Comment not found or not eligible for reactions.")

        res = await db.execute(
            select(CommentHelpful).where(
                CommentHelpful.comment_id == comment_id, CommentHelpful.user_id == user_id
            )
        )
        existing = res.scalar_one_or_none()

        if existing:
            await db.delete(existing)
            comment.helpful_count = max(0, comment.helpful_count - 1)
            is_helpful = False
        else:
            db.add(CommentHelpful(comment_id=comment_id, user_id=user_id))
            comment.helpful_count += 1
            is_helpful = True

        await db.commit()
        return {"comment_id": str(comment_id), "is_helpful": is_helpful, "helpful_count": comment.helpful_count}

    @classmethod
    async def submit_report(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        target_type: str,  # 'comment', 'content'
        target_id: str,
        reason: str,
        description: Optional[str] = None,
        content_type: Optional[str] = None,
    ) -> CommunityReport:
        """Submit a community report for inappropriate comments or published content. Deduplicates open reports."""
        # Deduplicate open reports from same user
        res = await db.execute(
            select(CommunityReport).where(
                CommunityReport.reported_by == user_id,
                CommunityReport.target_type == target_type,
                CommunityReport.target_id == target_id,
                CommunityReport.status.in_(["open", "under_review"]),
            )
        )
        if res.scalar_one_or_none():
            raise ValueError("You have already submitted an active report for this item.")

        report = CommunityReport(
            target_type=target_type,
            target_id=target_id,
            content_type=content_type,
            reported_by=user_id,
            reason=reason,
            description=description,
            status="open",
        )
        db.add(report)
        db.add(AuditLog(user_id=user_id, action="COMMUNITY_REPORT_SUBMITTED", content_type=target_type, content_id=target_id))
        await db.commit()
        await db.refresh(report)
        return report

    @classmethod
    async def get_admin_community_reports(cls, db: AsyncSession, status: Optional[str] = None, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Fetch paginated community report queue for moderators."""
        stmt = select(CommunityReport)
        if status:
            stmt = stmt.where(CommunityReport.status == status)

        stmt = stmt.order_by(CommunityReport.created_at.desc())
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        skip = (page - 1) * limit
        res = await db.execute(stmt.offset(skip).limit(limit))
        reports = res.scalars().all()

        items = [
            {
                "id": str(r.id),
                "target_type": r.target_type,
                "target_id": r.target_id,
                "content_type": r.content_type,
                "reason": r.reason,
                "description": r.description,
                "status": r.status,
                "created_at": r.created_at.isoformat(),
            }
            for r in reports
        ]
        return {"total": total, "page": page, "limit": limit, "items": items}

    @classmethod
    async def execute_admin_report_action(cls, db: AsyncSession, admin_id: uuid.UUID, report_id: uuid.UUID, action: str) -> CommunityReport:
        """Execute admin report decision (resolve, dismiss)."""
        res = await db.execute(select(CommunityReport).where(CommunityReport.id == report_id))
        report = res.scalar_one_or_none()
        if not report:
            raise ValueError("Report record not found.")

        if action == "resolve":
            report.status = "resolved"
            report.resolved_at = datetime.now(timezone.utc)
        elif action == "dismiss":
            report.status = "dismissed"
            report.resolved_at = datetime.now(timezone.utc)
        else:
            raise ValueError(f"Invalid report action '{action}'.")

        db.add(AuditLog(user_id=admin_id, action=f"REPORT_ACTION_{action.upper()}", content_type=report.target_type, content_id=report.target_id))
        await db.commit()
        await db.refresh(report)
        return report
