import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class AIGeneration(Base):
    """ORM model storing AI-generated draft content, outlines, and improvement suggestions for human review."""

    __tablename__ = "ai_generations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    operation_type: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # 'generate', 'improve', 'analyze', 'ideas', 'summarize'
    content_type: Mapped[str] = mapped_column(
        String(30), nullable=False, index=True
    )  # 'article', 'podcast', 'story', 'all'
    topic: Mapped[str] = mapped_column(Text, nullable=True)
    source_content_id: Mapped[str] = mapped_column(String(100), nullable=True)
    prompt_version: Mapped[str] = mapped_column(String(20), nullable=False, default="v1.0")
    model: Mapped[str] = mapped_column(String(50), nullable=False, default="gemini-1.5-flash")
    input_params: Mapped[dict] = mapped_column(JSON, nullable=True)
    output_content: Mapped[dict] = mapped_column(JSON, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="generated", index=True
    )  # 'generated', 'under_review', 'approved', 'rejected'
    safety_status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pass"
    )  # 'pass', 'needs_human_review'
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
