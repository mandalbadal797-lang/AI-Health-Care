from abc import ABC, abstractmethod
from typing import Any


class BaseAIProvider(ABC):
    """Abstract interface for AI LLM providers ensuring provider decoupling."""

    @abstractmethod
    async def generate_response(
        self,
        user_message: str,
        system_prompt: str,
        conversation_history: list[dict[str, str]] | None = None,
        content_context: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        """Generate supportive non-clinical response and recommendations given prompt and content context."""
        pass

    @abstractmethod
    async def classify_safety(self, user_message: str) -> str:
        """Classify safety level: NORMAL, EMOTIONAL_DISTRESS, POTENTIAL_CRISIS, IMMINENT_DANGER."""
        pass
