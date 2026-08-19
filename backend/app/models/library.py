import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class SavedContent(Base):
    """Normalized database model representing user saved bookmarks across articles, podcasts, and stories."""

    __tablename__ = "saved_contents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    content_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # article, podcast, story
    saved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "content_id", "content_type", name="uq_user_saved_content"),
    )


class ContentProgress(Base):
    """Normalized database model tracking reading and playback progress for user content items."""

    __tablename__ = "content_progress"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    content_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # article, podcast, story
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    position_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_accessed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "content_id", "content_type", name="uq_user_content_progress"),
    )


class RecentlyViewed(Base):
    """Database model tracking recently accessed resources per student (capped at latest 20 items)."""

    __tablename__ = "recently_viewed"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    content_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), index=True, nullable=False)  # article, podcast, story
    viewed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "content_id", "content_type", name="uq_user_recently_viewed"),
    )
