import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship, backref
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Comment(Base):
    """ORM model tracking student comments and replies on published content."""

    __tablename__ = "comments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    content_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    content_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True
    )  # 'article', 'podcast', 'story'
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    parent_comment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="approved", index=True
    )  # 'approved', 'pending', 'hidden', 'rejected', 'deleted'
    helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    author = relationship("User", foreign_keys=[user_id])
    parent = relationship("Comment", remote_side=[id], backref=backref("replies", cascade="all, delete-orphan"))


class CommentHelpful(Base):
    """ORM model storing student helpful reactions on comments (1 reaction per user per comment)."""

    __tablename__ = "comment_helpfuls"
    __table_args__ = (
        UniqueConstraint("user_id", "comment_id", name="uq_user_comment_helpful"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    comment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )


class CommunityReport(Base):
    """ORM model storing student reports for inappropriate comments or published content."""

    __tablename__ = "community_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    target_type: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True
    )  # 'comment', 'content'
    target_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    content_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    reported_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reason: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="open", index=True
    )  # 'open', 'under_review', 'resolved', 'dismissed'
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
