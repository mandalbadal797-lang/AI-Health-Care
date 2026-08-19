import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.moderation import ContentReview, ReviewComment, SafetyCheckResult
from app.models.article import Article
from app.models.podcast import Podcast
from app.models.story import Story
from app.models.audit_log import AuditLog


class ModerationService:
    """Core moderation service enforcing content safety, automated scans, human review decisions, and publish protection."""

    @classmethod
    async def submit_content_for_review(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        content_id: str,
        content_type: str,  # 'article', 'podcast', 'story'
    ) -> ContentReview:
        """Submit a draft content item for moderation review and run automated safety checks."""
        # 1. Fetch target entity
        content_title = ""
        content_text = ""
        is_ai_gen = False

        if content_type == "article":
            res = await db.execute(select(Article).where(Article.id == uuid.UUID(content_id)))
            art = res.scalar_one_or_none()
            if not art:
                raise ValueError("Article not found.")
            content_title = art.title
            content_text = f"{art.title} {art.excerpt} {art.content}"
            is_ai_gen = art.is_ai_generated

        elif content_type == "podcast":
            res = await db.execute(select(Podcast).where(Podcast.id == uuid.UUID(content_id)))
            pod = res.scalar_one_or_none()
            if not pod:
                raise ValueError("Podcast not found.")
            content_title = pod.title
            content_text = f"{pod.title} {pod.description} {pod.transcript or ''}"
            is_ai_gen = False  # Set default unless linked to AIGeneration

        else:  # Story
            res = await db.execute(select(Story).where(Story.id == uuid.UUID(content_id)))
            st = res.scalar_one_or_none()
            if not st:
                raise ValueError("Story not found.")
            content_title = st.title
            content_text = f"{st.title} {st.summary}"
            is_ai_gen = False

        # 2. Check if existing review exists
        res = await db.execute(
            select(ContentReview).where(
                ContentReview.content_id == content_id, ContentReview.content_type == content_type
            )
        )
        review = res.scalar_one_or_none()

        priority = "high" if is_ai_gen else "normal"

        if review:
            review.status = "submitted_for_review"
            review.priority = priority
            review.is_ai_generated = is_ai_gen
            review.updated_at = datetime.now(timezone.utc)
        else:
            review = ContentReview(
                content_id=content_id,
                content_type=content_type,
                submitted_by=user_id,
                status="submitted_for_review",
                priority=priority,
                is_ai_generated=is_ai_gen,
            )
            db.add(review)
            await db.flush()

        # 3. Run Automated Safety Checks
        await cls._run_automated_safety_checks(db, review, content_text)

        review.status = "under_review"
        db.add(AuditLog(user_id=user_id, action="CONTENT_SUBMITTED_FOR_REVIEW", content_type=content_type, content_id=content_id))
        await db.commit()
        await db.refresh(review)
        return review

    @classmethod
    async def _run_automated_safety_checks(cls, db: AsyncSession, review: ContentReview, text: str):
        """Execute automated safety scans checking for medical claims, factual citations, and non-clinical boundaries."""
        # Clear previous checks
        checks: List[SafetyCheckResult] = []
        text_lower = text.lower()

        # Check 1: Non-Clinical Safety Check
        clinical_words = ["clinical depression", "medication dose", "bipolar disorder", "schizophrenia"]
        found_clinical = [w for w in clinical_words if w in text_lower]
        if found_clinical:
            checks.append(
                SafetyCheckResult(
                    review_id=review.id,
                    check_name="Non-Clinical Safety Boundary",
                    status="warning",
                    severity="high",
                    details=f"Contains clinical diagnosis terms: {', '.join(found_clinical)}. Source verification required.",
                )
            )
            review.safety_status = "warning"
            review.priority = "high"
        else:
            checks.append(
                SafetyCheckResult(
                    review_id=review.id,
                    check_name="Non-Clinical Safety Boundary",
                    status="pass",
                    severity="info",
                    details="Text complies with non-clinical student wellness guardrails.",
                )
            )

        # Check 2: Medical Claim Verification
        claim_words = ["cure", "guarantee", "100% effective", "instant fix"]
        found_claims = [w for w in claim_words if w in text_lower]
        if found_claims:
            checks.append(
                SafetyCheckResult(
                    review_id=review.id,
                    check_name="Medical Claim Verification",
                    status="warning",
                    severity="medium",
                    details=f"Contains strong claim phrases: {', '.join(found_claims)}. Human review required.",
                )
            )
        else:
            checks.append(
                SafetyCheckResult(
                    review_id=review.id,
                    check_name="Medical Claim Verification",
                    status="pass",
                    severity="info",
                    details="No unsupported medical claims detected.",
                )
            )

        # Check 3: Script & Link Safety Check
        if "http://" in text_lower or "<script>" in text_lower:
            checks.append(
                SafetyCheckResult(
                    review_id=review.id,
                    check_name="Link & HTML Sanitization",
                    status="warning",
                    severity="medium",
                    details="Contains unencrypted links or HTML elements.",
                )
            )

        for c in checks:
            db.add(c)

    @classmethod
    async def get_moderation_queue(
        cls,
        db: AsyncSession,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        content_type: Optional[str] = None,
        is_ai_generated: Optional[bool] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Fetch paginated moderation review queue items with filter parameters."""
        stmt = select(ContentReview)

        if status:
            stmt = stmt.where(ContentReview.status == status)
        if priority:
            stmt = stmt.where(ContentReview.priority == priority)
        if content_type:
            stmt = stmt.where(ContentReview.content_type == content_type)
        if is_ai_generated is not None:
            stmt = stmt.where(ContentReview.is_ai_generated == is_ai_generated)

        stmt = stmt.order_by(ContentReview.created_at.desc())

        # Total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_res = await db.execute(count_stmt)
        total = total_res.scalar() or 0

        skip = (page - 1) * limit
        res = await db.execute(stmt.offset(skip).limit(limit))
        reviews = res.scalars().all()

        items = []
        for r in reviews:
            # Fetch content title
            title = "Content Resource"
            if r.content_type == "article":
                a_res = await db.execute(select(Article.title).where(Article.id == uuid.UUID(r.content_id)))
                title = a_res.scalar() or title
            elif r.content_type == "podcast":
                p_res = await db.execute(select(Podcast.title).where(Podcast.id == uuid.UUID(r.content_id)))
                title = p_res.scalar() or title
            elif r.content_type == "story":
                s_res = await db.execute(select(Story.title).where(Story.id == uuid.UUID(r.content_id)))
                title = s_res.scalar() or title

            items.append({
                "id": str(r.id),
                "content_id": r.content_id,
                "content_type": r.content_type,
                "title": title,
                "version": r.content_version,
                "status": r.status,
                "priority": r.priority,
                "is_ai_generated": r.is_ai_generated,
                "safety_status": r.safety_status,
                "created_at": r.created_at.isoformat(),
            })

        return {"total": total, "page": page, "limit": limit, "items": items}

    @classmethod
    async def get_moderation_kpis(cls, db: AsyncSession) -> Dict[str, int]:
        """Calculate counts for pending reviews, high priority items, approved, rejected, and published items."""
        res_pending = await db.execute(
            select(func.count(ContentReview.id)).where(
                ContentReview.status.in_(["submitted_for_review", "under_review", "automated_review"])
            )
        )
        res_high_prio = await db.execute(
            select(func.count(ContentReview.id)).where(
                ContentReview.priority.in_(["high", "critical"]),
                ContentReview.status.in_(["submitted_for_review", "under_review"]),
            )
        )
        res_changes = await db.execute(
            select(func.count(ContentReview.id)).where(ContentReview.status == "changes_requested")
        )
        res_approved = await db.execute(
            select(func.count(ContentReview.id)).where(ContentReview.status == "approved")
        )
        res_rejected = await db.execute(
            select(func.count(ContentReview.id)).where(ContentReview.status == "rejected")
        )
        res_published = await db.execute(
            select(func.count(ContentReview.id)).where(ContentReview.status == "published")
        )

        return {
            "pending_reviews": res_pending.scalar() or 0,
            "high_priority_reviews": res_high_prio.scalar() or 0,
            "changes_requested": res_changes.scalar() or 0,
            "approved": res_approved.scalar() or 0,
            "rejected": res_rejected.scalar() or 0,
            "published": res_published.scalar() or 0,
        }

    @classmethod
    async def execute_review_action(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        review_id: uuid.UUID,
        action: str,  # 'approve', 'request_changes', 'reject', 'escalate'
        reviewer_notes: Optional[str] = None,
        rejection_reason: Optional[str] = None,
    ) -> ContentReview:
        """Execute human review decision enforcing state machine rules and updating content status."""
        res = await db.execute(select(ContentReview).where(ContentReview.id == review_id))
        review = res.scalar_one_or_none()
        if not review:
            raise ValueError("Content review record not found.")

        # Check for critical safety fail blocking approval
        if action == "approve":
            fail_check_res = await db.execute(
                select(SafetyCheckResult).where(
                    SafetyCheckResult.review_id == review.id, SafetyCheckResult.status == "fail"
                )
            )
            if fail_check_res.scalars().all():
                raise ValueError("Cannot approve content with unresolved critical safety failures.")

            review.status = "approved"
            review.completed_at = datetime.now(timezone.utc)

            # Update target entity review_notes
            if review.content_type == "article":
                art = await db.get(Article, uuid.UUID(review.content_id))
                if art:
                    art.review_notes = reviewer_notes

        elif action == "request_changes":
            if not reviewer_notes:
                raise ValueError("Reviewer notes explanation required when requesting changes.")
            review.status = "changes_requested"

        elif action == "reject":
            if not rejection_reason:
                raise ValueError("Rejection reason required when rejecting content.")
            review.status = "rejected"
            review.rejection_reason = rejection_reason
            review.completed_at = datetime.now(timezone.utc)

        elif action == "escalate":
            review.status = "escalated"
            review.priority = "high"

        else:
            raise ValueError(f"Invalid review action '{action}'.")

        review.assigned_reviewer_id = user_id
        review.reviewer_notes = reviewer_notes
        review.updated_at = datetime.now(timezone.utc)

        db.add(AuditLog(user_id=user_id, action=f"REVIEW_ACTION_{action.upper()}", content_type=review.content_type, content_id=review.content_id))
        await db.commit()
        await db.refresh(review)
        return review

    @classmethod
    async def publish_approved_content(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        content_id: str,
        content_type: str,
    ) -> Dict[str, Any]:
        """Publish an approved content item. Strict backend protection: Enforces status=='approved'."""
        res = await db.execute(
            select(ContentReview).where(
                ContentReview.content_id == content_id, ContentReview.content_type == content_type
            )
        )
        review = res.scalar_one_or_none()

        if not review or review.status != "approved":
            raise ValueError("Publishing denied: Content must have an approved moderation status before publication.")

        # Update entity status to published
        if content_type == "article":
            art = await db.get(Article, uuid.UUID(content_id))
            if art:
                art.publication_status = "published"
        elif content_type == "podcast":
            pod = await db.get(Podcast, uuid.UUID(content_id))
            if pod:
                pod.publication_status = "published"
        elif content_type == "story":
            st = await db.get(Story, uuid.UUID(content_id))
            if st:
                st.publication_status = "published"

        review.status = "published"
        review.updated_at = datetime.now(timezone.utc)

        db.add(AuditLog(user_id=user_id, action="CONTENT_PUBLISHED", content_type=content_type, content_id=content_id))
        await db.commit()

        return {
            "message": "Content published successfully.",
            "content_id": content_id,
            "content_type": content_type,
            "publication_status": "published",
        }
