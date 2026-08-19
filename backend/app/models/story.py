import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class Story(Base):
    """Story entity representing student digital narratives, reflections, and key takeaways."""

    __tablename__ = "stories"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4, index=True
    )
    title: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(280), unique=True, index=True, nullable=False)
    subtitle: Mapped[str] = mapped_column(String(500), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    author_name: Mapped[str] = mapped_column(String(100), default="Student Story — Demonstration", nullable=False)
    reading_time_minutes: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    reflection_question: Mapped[str | None] = mapped_column(String(500), nullable=True)
    key_takeaway: Mapped[str | None] = mapped_column(String(500), nullable=True)
    publication_status: Mapped[str] = mapped_column(String(20), default="draft", index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    category = relationship("Category")
