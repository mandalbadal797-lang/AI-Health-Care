import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class ContentReview(Base):
    """ORM model tracking content moderation review state, priority, and human approval lifecycle."""

    __tablename__ = "content_reviews"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    content_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    content_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True
    )  # 'article', 'podcast', 'story'
    content_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    submitted_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assigned_reviewer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(
        String(30), nullable=False, default="submitted_for_review", index=True
    )  # 'submitted_for_review', 'automated_review', 'under_review', 'approved', 'changes_requested', 'rejected', 'escalated', 'published'
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, default="normal", index=True
    )  # 'low', 'normal', 'high', 'critical'
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    safety_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pass", index=True
    )  # 'pass', 'warning', 'fail'
    reviewer_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    comments = relationship("ReviewComment", back_populates="review", cascade="all, delete-orphan")
    safety_checks = relationship("SafetyCheckResult", back_populates="review", cascade="all, delete-orphan")


class ReviewComment(Base):
    """ORM model storing reviewer comments and annotations."""

    __tablename__ = "review_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("content_reviews.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    comment_type: Mapped[str] = mapped_column(
        String(30), nullable=False, default="general"
    )  # 'general', 'safety', 'fact_check', 'editorial'
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    review = relationship("ContentReview", back_populates="comments")


class SafetyCheckResult(Base):
    """ORM model storing automated safety scan findings for a review."""

    __tablename__ = "safety_check_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    review_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("content_reviews.id", ondelete="CASCADE"), nullable=False, index=True
    )
    check_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # 'pass', 'warning', 'fail'
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="info")  # 'info', 'low', 'medium', 'high', 'critical'
    details: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    review = relationship("ContentReview", back_populates="safety_checks")
