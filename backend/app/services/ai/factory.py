from app.core.config import settings
from app.services.ai.base import BaseAIProvider
from app.services.ai.fallback_provider import FallbackAIProvider
from app.services.ai.gemini_provider import GeminiAIProvider


def get_ai_provider() -> BaseAIProvider:
    """Factory function returning the active AI provider based on environment configuration."""
    provider_type = settings.AI_PROVIDER.lower() if settings.AI_PROVIDER else "fallback"
    if provider_type == "gemini" and settings.AI_API_KEY:
        return GeminiAIProvider()
    return FallbackAIProvider()
