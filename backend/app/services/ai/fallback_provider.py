from typing import Any
from app.services.ai.base import BaseAIProvider

CRISIS_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "end my life", "want to die",
    "self harm", "cut myself", "overdose", "hurt myself"
]


class FallbackAIProvider(BaseAIProvider):
    """Development and fallback AI provider that generates grounded supportive responses without requiring external API keys."""

    async def classify_safety(self, user_message: str) -> str:
        text_lower = user_message.lower()
        if any(kw in text_lower for kw in CRISIS_KEYWORDS):
            return "IMMINENT_DANGER"
        if any(kw in text_lower for kw in ["depressed", "hopeless", "can't go on", "overwhelmed completely"]):
            return "EMOTIONAL_DISTRESS"
        return "NORMAL"

    async def generate_response(
        self,
        user_message: str,
        system_prompt: str,
        conversation_history: list[dict[str, str]] | None = None,
        content_context: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        msg_lower = user_message.lower()

        # Deterministic supportive responses based on student topics
        if "unmotivated" in msg_lower or "motivation" in msg_lower or "start" in msg_lower:
            reply = (
                "Feeling unmotivated is a very common experience during college. "
                "Try using the 5-minute starter rule: pick just one task and commit to working on it for only 5 minutes. "
                "Starting breaks friction, and momentum often follows."
            )
        elif "exam" in msg_lower or "test" in msg_lower or "midterm" in msg_lower or "fail" in msg_lower:
            reply = (
                "An unexpected exam result can feel discouraging, but remember that a single grade is diagnostic feedback, "
                "not a permanent measure of your potential. Take a short pause, review where you lost points, and reach out to your instructor or campus tutoring center."
            )
        elif "compare" in msg_lower or "behind" in msg_lower or "imposter" in msg_lower:
            reply = (
                "Comparing your academic journey to classmates often creates unnecessary anxiety. "
                "Everyone learns at different paces and adapts to challenge differently. Focus on your personal growth marathon rather than someone else's highlight reel."
            )
        elif "listen" in msg_lower or "podcast" in msg_lower or "audio" in msg_lower:
            reply = (
                "Taking an audio break is a great way to reset your focus! I've selected a few MindCampus podcast episodes below for you to stream."
            )
        elif "story" in msg_lower or "stories" in msg_lower or "student" in msg_lower:
            reply = (
                "Reading how other students navigated academic setbacks can be deeply validating. "
                "Here are a few real-world student narratives from our digital storytelling library."
            )
        else:
            reply = (
                "Thank you for sharing. Navigating college workload requires balancing structured study habits with restorative breaks. "
                "Here are some hand-picked MindCampus wellness resources that may help you today."
            )

        recommendations = content_context[:3] if content_context else []

        return {
            "message": reply,
            "recommendations": recommendations,
            "safety_level": "NORMAL",
            "provider": "fallback",
        }
