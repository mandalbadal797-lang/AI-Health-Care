import httpx
from typing import Any
from app.core.config import settings
from app.core.logging import logger
from app.services.ai.base import BaseAIProvider
from app.services.ai.fallback_provider import FallbackAIProvider


class GeminiAIProvider(BaseAIProvider):
    """Google Gemini AI Provider utilizing HTTP REST integration."""

    def __init__(self):
        self.fallback = FallbackAIProvider()

    async def classify_safety(self, user_message: str) -> str:
        return await self.fallback.classify_safety(user_message)

    async def generate_response(
        self,
        user_message: str,
        system_prompt: str,
        conversation_history: list[dict[str, str]] | None = None,
        content_context: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        api_key = settings.AI_API_KEY
        if not api_key:
            logger.info("No AI_API_KEY set. Using FallbackAIProvider.")
            return await self.fallback.generate_response(user_message, system_prompt, conversation_history, content_context)

        try:
            # Construct context prompt
            context_str = ""
            if content_context:
                context_str = "\n\nAvailable Grounded Resources:\n" + "\n".join(
                    [f"- [{item.get('type', 'content').upper()}] {item.get('title')}: {item.get('excerpt', item.get('subtitle', ''))} (URL: /{item.get('type')}s/{item.get('slug')})" for item in content_context]
                )

            full_prompt = f"{system_prompt}\n{context_str}\n\nUser Message: {user_message}"

            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL}:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {
                    "temperature": settings.AI_TEMPERATURE,
                    "maxOutputTokens": settings.AI_MAX_TOKENS,
                },
            }

            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            text = parts[0]["text"]
                            return {
                                "message": text,
                                "recommendations": content_context[:3] if content_context else [],
                                "safety_level": "NORMAL",
                                "provider": "gemini",
                            }
        except Exception as e:
            logger.warning(f"Gemini API call failed: {e}. Falling back to FallbackAIProvider.")

        return await self.fallback.generate_response(user_message, system_prompt, conversation_history, content_context)
