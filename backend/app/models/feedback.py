import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, Integer, Boolean, Text, DateTime, ForeignKey, UniqueConstraint, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class ContentFeedback(Base):
    """Normalized database model representing student content feedback, ratings, and moderation state."""

    __tablename__ = "content_feedback"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    content_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # article, podcast, story
    
    is_helpful: Mapped[bool] = mapped_column(Boolean, nullable=False)
    rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # 1 to 5 stars
    category_tags: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # List of tag strings e.g. ["Easy to understand", "Practical"]
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # Optional comment max 1000 chars
    
    ai_category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # Positive, Suggestion, Technical Issue, etc.
    moderation_status: Mapped[str] = mapped_column(String(20), default="pending", index=True, nullable=False)  # pending, approved, rejected, flagged
    moderated_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    moderated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "content_id", "content_type", name="uq_user_content_feedback"),
    )
