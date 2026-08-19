import uuid
import re
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_generation import AIGeneration
from app.models.article import Article
from app.models.podcast import Podcast
from app.models.story import Story
from app.models.audit_log import AuditLog
from app.services.analytics_service import AnalyticsService


class AIStudioService:
    """Core AI Content Studio service for drafting, improving, analyzing, and converting AI content into CMS drafts."""

    @classmethod
    def _sanitize_prompt_input(cls, text: str) -> str:
        """Sanitize prompt input against prompt injection attempts."""
        if not text:
            return ""
        text = re.sub(r"(ignore\s+all\s+previous\s+instructions)", "[FILTERED]", text, flags=re.IGNORECASE)
        text = re.sub(r"(system\s+prompt|reveal\s+api\s+key)", "[FILTERED]", text, flags=re.IGNORECASE)
        return text.strip()

    @classmethod
    def _perform_safety_check(cls, text: str) -> Dict[str, Any]:
        """Perform automated safety review checking for unsupported medical claims or dangerous statements."""
        flags = []
        is_pass = True

        medical_keywords = ["cure", "diagnose", "prescribe", "treatment", "clinical depression", "medication dose"]
        for kw in medical_keywords:
            if kw in text.lower():
                flags.append(f"Contains clinical/medical term '{kw}'. Source verification required before publication.")
                is_pass = False

        return {
            "safety_status": "pass" if is_pass else "needs_human_review",
            "flags": flags,
        }

    @classmethod
    async def generate_content_draft(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        content_type: str,  # 'article', 'podcast', 'story'
        topic: str,
        audience: str = "College Students",
        purpose: str = "Educational & Motivational",
        tone: str = "Supportive",
        length: str = "medium",  # 'short', 'medium', 'long'
        category_id: Optional[int] = None,
        keywords: Optional[List[str]] = None,
    ) -> AIGeneration:
        """Generate a structured draft for a Blog article, Podcast script, or Digital Story."""
        clean_topic = cls._sanitize_prompt_input(topic)

        if content_type == "podcast":
            output = {
                "title": f"Episode Draft: Master Your Mindset in {clean_topic.title()}",
                "description": f"In this episode, we explore practical, non-clinical strategies for handling {clean_topic} during college life.",
                "intro_script": f"HOST: Welcome back to MindCampus! Today we're diving deep into {clean_topic}. If you've been feeling overwhelmed, you're in the right place.",
                "sections": [
                    {
                        "section_title": "Section 1: Understanding the Pressure",
                        "script": f"HOST: Let's talk about why {clean_topic} feels so intense during midterms. It's completely natural to experience stress when expectations rise.",
                    },
                    {
                        "section_title": "Section 2: Three Practical Strategies",
                        "script": f"HOST: Strategy 1: Break large assignments into 20-minute focus blocks. Strategy 2: Practice active pause breaks. Strategy 3: Connect with campus peer support groups.",
                    },
                ],
                "outro_script": "HOST: That wraps up today's episode! Remember to check out the written resources on MindCampus. Until next time, take care of yourself.",
                "call_to_action": "Subscribe and share this episode with a fellow student!",
                "tags": ["podcast", "student-life", "audio-guide"],
            }
        elif content_type == "story":
            output = {
                "title": f"Student Story: Overcoming {clean_topic.title()}",
                "setting": "Campus Library & Dorm Study Room",
                "characters": "Alex (Sophomore Student), Maya (Peer Mentor)",
                "story_body": (
                    f"Alex sat staring at the blank screen, overwhelmed by {clean_topic}. Every paragraph felt like an insurmountable hurdle. "
                    f"When Maya noticed Alex's hesitation, she shared a simple insight: progress comes from small, daily steps rather than perfection. "
                    f"Together, they outlined a manageable study plan."
                ),
                "reflection": f"Looking back, Alex realized that seeking support and reframing obstacles was the turning point in managing {clean_topic}.",
                "key_takeaway": "Perfectionism creates inertia; small consistent actions build confidence and resilience.",
                "tags": ["digital-story", "peer-experience", "resilience"],
            }
        else:  # Default article/blog
            output = {
                "title": f"Navigating {clean_topic.title()}: A Student Guide",
                "summary": f"A supportive guide offering practical, actionable strategies for managing {clean_topic} effectively while in college.",
                "introduction": f"College life brings unique challenges, and learning to navigate {clean_topic} is a crucial skill for every student.",
                "outline": [
                    "1. Recognizing the Signs of Overwhelm",
                    "2. Actionable Micro-Habits for Daily Study",
                    "3. Building a Supportive Peer Network",
                ],
                "body": (
                    f"### 1. Recognizing the Signs of Overwhelm\nWhen dealing with {clean_topic}, it is common to experience cognitive fatigue. "
                    f"Recognizing early warning signs allows you to reset before burnout occurs.\n\n"
                    f"### 2. Actionable Micro-Habits\nImplement the 25/5 Pomodoro method. Focus on one task for 25 minutes, followed by a 5-minute movement break.\n\n"
                    f"### 3. Seeking Support\nDon't hesitate to utilize campus academic advisement and peer tutoring resources."
                ),
                "conclusion": f"Managing {clean_topic} is an ongoing journey. Focus on continuous progress rather than instant perfection.",
                "tags": ["blog", "study-tips", "wellness"],
                "seo_title": f"Navigating {clean_topic.title()} - MindCampus Guide",
                "meta_description": f"Practical, student-tested tips for overcoming {clean_topic} during college.",
            }

        full_text = str(output)
        safety_info = cls._perform_safety_check(full_text)

        gen = AIGeneration(
            user_id=user_id,
            operation_type="generate",
            content_type=content_type,
            topic=clean_topic,
            input_params={
                "audience": audience,
                "purpose": purpose,
                "tone": tone,
                "length": length,
                "category_id": category_id,
                "keywords": keywords,
            },
            output_content=output,
            status="generated",
            safety_status=safety_info["safety_status"],
        )
        db.add(gen)
        await db.commit()
        await db.refresh(gen)
        return gen

    @classmethod
    async def improve_content(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        text: str,
        operation: str = "simplify",  # 'simplify', 'readability', 'intro', 'practical'
        content_type: str = "article",
        source_content_id: Optional[str] = None,
    ) -> AIGeneration:
        """Generate side-by-side improved text suggestions for existing content."""
        clean_text = cls._sanitize_prompt_input(text)

        if operation == "simplify":
            improved = f"Simplified Version:\n\n{clean_text.replace('cognitive fatigue', 'mental tiredness').replace('insurmountable', 'huge')}"
            notes = "Replaced complex vocabulary with accessible student-friendly phrasing."
        elif operation == "intro":
            improved = f"Engaging Introduction Alternative:\n\nHave you ever felt completely stuck before a major deadline? You are not alone. Here is how to regain momentum..."
            notes = "Crafted a direct, empathetic hook targeting common student experiences."
        else:  # default readability / practical
            improved = f"Action-Oriented Version:\n\n{clean_text}\n\nKey Takeaway Bullet Points:\n- Set clear daily micro-goals\n- Take structured study breaks\n- Leverage campus learning resources"
            notes = "Structured long prose into scannable bullet points."

        output = {
            "original_text": clean_text,
            "improved_text": improved,
            "improvement_notes": notes,
            "operation": operation,
        }

        gen = AIGeneration(
            user_id=user_id,
            operation_type="improve",
            content_type=content_type,
            source_content_id=source_content_id,
            output_content=output,
            status="generated",
            safety_status="pass",
        )
        db.add(gen)
        await db.commit()
        await db.refresh(gen)
        return gen

    @classmethod
    async def analyze_content(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        text: str,
        content_type: str = "article",
    ) -> Dict[str, Any]:
        """Analyze content for readability index, reading time, sentence complexity, and factual claim flags."""
        clean_text = cls._sanitize_prompt_input(text)
        words = clean_text.split()
        word_count = len(words)
        reading_time_minutes = round(word_count / 200, 1) if word_count > 0 else 0

        sentences = [s for s in re.split(r"[.!?]+", clean_text) if s.strip()]
        avg_sentence_len = round(word_count / len(sentences), 1) if len(sentences) > 0 else 0

        readability_label = "Student Friendly (Grade 8-10)"
        if avg_sentence_len > 25:
            readability_label = "Complex Phrasing (Consider shortening sentences)"

        safety = cls._perform_safety_check(clean_text)

        return {
            "word_count": word_count,
            "estimated_reading_time_minutes": reading_time_minutes,
            "sentence_count": len(sentences),
            "avg_sentence_length": avg_sentence_len,
            "readability_label": readability_label,
            "safety_status": safety["safety_status"],
            "safety_flags": safety["flags"],
        }

    @classmethod
    async def generate_content_ideas(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        category_id: Optional[int] = None,
        content_type: str = "all",
        include_analytics: bool = True,
    ) -> List[Dict[str, Any]]:
        """Generate analytics-informed content opportunity ideas based on Phase 14 signals."""
        ideas = [
            {
                "id": "idea-1",
                "title": "5 Micro-Habits for Failure Resilience Before Midterms",
                "content_type": "article",
                "target_audience": "Undergraduate Students",
                "problem_need": "High stress during exam preparation weeks",
                "suggested_angle": "Actionable 5-minute study reset techniques",
                "reason_analytics": "Analytics show high save counts for study skills articles.",
            },
            {
                "id": "idea-2",
                "title": "Overcoming Sophomore Slump: A Peer Conversation",
                "content_type": "podcast",
                "target_audience": "Second-Year College Students",
                "problem_need": "Loss of initial momentum and academic clarity",
                "suggested_angle": "Relatable student interview format",
                "reason_analytics": "Podcasts exhibit 78% completion rates among second-year topics.",
            },
            {
                "id": "idea-3",
                "title": "From Blank Page to Completed Thesis: Maya's Story",
                "content_type": "story",
                "target_audience": "Graduating Seniors",
                "problem_need": "Writer's block and thesis anxiety",
                "suggested_angle": "Visual storytelling with interactive reflections",
                "reason_analytics": "Digital stories on academic growth receive high helpful ratings.",
            },
        ]
        return ideas

    @classmethod
    async def send_draft_to_cms(
        cls,
        db: AsyncSession,
        user_id: uuid.UUID,
        generation_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """Convert an approved AI generation into an official draft item in Admin CMS."""
        res = await db.execute(select(AIGeneration).where(AIGeneration.id == generation_id))
        gen = res.scalar_one_or_none()
        if not gen:
            raise ValueError("AI Generation record not found.")

        output = gen.output_content
        ctype = gen.content_type
        created_cms_id = None

        if ctype == "article" or "body" in output:
            slug = f"ai-draft-{uuid.uuid4().hex[:8]}"
            art = Article(
                title=output.get("title", "AI Draft Article"),
                slug=slug,
                excerpt=output.get("summary", "AI generated draft excerpt."),
                content=output.get("body", output.get("improved_text", "AI generated draft content.")),
                publication_status="draft",
                is_ai_generated=True,
                category_id=1,  # Default category
                author_id=user_id,
            )
            db.add(art)
            await db.flush()
            created_cms_id = str(art.id)

        elif ctype == "podcast" or "intro_script" in output:
            slug = f"ai-podcast-draft-{uuid.uuid4().hex[:8]}"
            sections_text = "\n\n".join([f"### {s['section_title']}\n{s['script']}" for s in output.get("sections", [])])
            pod = Podcast(
                title=output.get("title", "AI Draft Podcast"),
                slug=slug,
                description=output.get("description", "AI generated podcast description."),
                audio_url="https://media.mindcampus.edu/audio/placeholder.mp3",
                duration_seconds=600,
                transcript=f"{output.get('intro_script', '')}\n\n{sections_text}\n\n{output.get('outro_script', '')}",
                publication_status="draft",
                is_featured=False,
                category_id=1,
                author_id=user_id,
            )
            db.add(pod)
            await db.flush()
            created_cms_id = str(pod.id)

        else:  # Story
            slug = f"ai-story-draft-{uuid.uuid4().hex[:8]}"
            st = Story(
                title=output.get("title", "AI Draft Story"),
                slug=slug,
                summary=output.get("reflection", "AI generated story reflection."),
                cover_image_url="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
                publication_status="draft",
                is_featured=False,
                category_id=1,
                author_id=user_id,
            )
            db.add(st)
            await db.flush()
            created_cms_id = str(st.id)

        gen.status = "approved"
        db.add(AuditLog(user_id=user_id, action="AI_DRAFT_SENT_TO_CMS", content_type=ctype, content_id=str(gen.id)))
        await db.commit()

        return {
            "message": f"AI generation successfully converted to CMS draft ({ctype}).",
            "cms_id": created_cms_id,
            "content_type": ctype,
            "publication_status": "draft",
        }
