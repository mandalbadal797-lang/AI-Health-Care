import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.core.database import engine, AsyncSessionLocal, Base
from app.models.category import Category
from app.models.podcast import Podcast

# Public domain / development-safe audio assets
DEV_AUDIO_URL = "https://actions.google.com/sounds/v1/ambiences/outdoor_ambience.ogg"

SEED_PODCASTS = [
    {
        "episode_number": 1,
        "title": "Navigating Midterm Anxiety & Resetting Your Mindset",
        "slug": "navigating-midterm-anxiety-resetting-mindset",
        "description": "In this opening episode, campus counselors discuss actionable breathing techniques, cognitive pacing, and resetting your focus during peak exam weeks.",
        "category_slug": "academic-stress",
        "duration_seconds": 860,  # 14:20
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to MindCampus Podcast Episode 1: Navigating Midterm Anxiety & Resetting Your Mindset.

Host: Welcome everyone. Today we are joined by Dr. Sarah Jenkins to discuss how college students can navigate severe midterm stress without burning out.

Dr. Jenkins: Thank you for having me. The first thing students must realize is that test anxiety is a natural physiological signal, not a character flaw. When your heart starts racing before an exam, your nervous system is simply preparing for performance.

Host: What is the most effective micro-break technique during heavy study sessions?

Dr. Jenkins: I strongly recommend the 25-5 rule. Study uninterrupted for 25 minutes, then stand up and disconnect completely for 5 minutes. That brief interval allows cognitive consolidation.

Host: Thank you Dr. Jenkins. Remember to take a deep breath, pace your study intervals, and take care of yourselves this exam week.""",
    },
    {
        "episode_number": 2,
        "title": "Student Stories — Recovering After Academic Probation",
        "slug": "student-stories-recovering-after-probation",
        "description": "Senior students share their honest experiences recovering after a difficult freshman semester and rebuilding self-efficacy.",
        "category_slug": "failure-resilience",
        "duration_seconds": 1125,  # 18:45
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to MindCampus Episode 2: Student Stories — Recovering After Academic Probation.

Jordan: When I opened my grade report after my first semester and saw I was on academic probation, I felt completely defeated. I thought I was the only student struggling.

Maya: The biggest turning point was realizing that staying silent made it worse. I walked into the campus tutoring center, explained where I was struggling, and set up a structured weekly study schedule.

Jordan: Exactly. An academic setback is a detour, not the end of your education.""",
    },
    {
        "episode_number": 3,
        "title": "Building Healthy Daily Habits During Finals Week",
        "slug": "building-healthy-daily-habits-finals-week",
        "description": "Practical advice on nutrition, sleep hygiene, and study pacing during high-stress exam periods.",
        "category_slug": "self-care",
        "duration_seconds": 730,  # 12:10
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 3: Building Healthy Daily Habits During Finals Week.

Today we break down how 7 hours of restorative sleep directly improves test recall compared to pulling all-nighters.""",
    },
    {
        "episode_number": 4,
        "title": "Overcoming Imposter Syndrome in Technical Courses",
        "slug": "overcoming-imposter-syndrome-technical-courses",
        "description": "How STEM and CS students build confidence, ask questions without fear, and collaborate effectively.",
        "category_slug": "confidence",
        "duration_seconds": 940,  # 15:40
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 4: Overcoming Imposter Syndrome in Technical Courses.

Many students feel intimidated when entering lab lectures. Remember that everyone is learning at different speeds.""",
    },
    {
        "episode_number": 5,
        "title": "Time-Management Secrets for Working Students",
        "slug": "time-management-secrets-working-students",
        "description": "Balancing part-time jobs, coursework, and personal health through calendar time-blocking.",
        "category_slug": "time-management",
        "duration_seconds": 1050,  # 17:30
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 5: Time Management Secrets for Working Students.

Learn how to block out study hours with non-negotiable breaks.""",
    },
    {
        "episode_number": 6,
        "title": "When Motivation Disappears: How to Maintain Paced Progress",
        "slug": "when-motivation-disappears-paced-progress",
        "description": "Moving beyond temporary bursts of inspiration by establishing simple daily routines.",
        "category_slug": "motivation",
        "duration_seconds": 800,  # 13:20
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 6: When Motivation Disappears.

Discover the 5-minute starter rule for starting tough assignments.""",
    },
    {
        "episode_number": 7,
        "title": "Navigating Roommate Dynamics and College Social Life",
        "slug": "navigating-roommate-dynamics-college-social-life",
        "description": "Communicating expectations, protecting personal space, and resolving dorm living friction.",
        "category_slug": "college-life",
        "duration_seconds": 910,  # 15:10
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 7: Navigating Roommate Dynamics and College Social Life.

Communication is key when sharing study and quiet hours.""",
    },
    {
        "episode_number": 8,
        "title": "Managing Internship Anxiety and Post-Grad Uncertainty",
        "slug": "managing-internship-anxiety-post-grad-uncertainty",
        "description": "Handling career pressure, resume building, and finding peace with your post-grad direction.",
        "category_slug": "career-stress",
        "duration_seconds": 1180,  # 19:40
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 8: Managing Internship Anxiety.

Your first career steps are part of an ongoing discovery process.""",
    },
    {
        "episode_number": 9,
        "title": "Mindful Breathing Techniques Before Oral Presentations",
        "slug": "mindful-breathing-before-oral-presentations",
        "description": "Slowing down heart rate and managing public speaking anxiety in seminars.",
        "category_slug": "mental-wellness",
        "duration_seconds": 650,  # 10:50
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 9: Mindful Breathing Before Presentations.

Practice box breathing before stepping up to speak.""",
    },
    {
        "episode_number": 10,
        "title": "Pacing Your Reading Assignments for Complex Humanities Courses",
        "slug": "pacing-reading-assignments-humanities",
        "description": "Active annotation and summary strategies for heavy weekly reading lists.",
        "category_slug": "study-habits",
        "duration_seconds": 890,  # 14:50
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "published",
        "transcript": """Welcome to Episode 10: Pacing Your Reading Assignments.

Active note-taking turns passive reading into long-term retention.""",
    },
    # Un-published / Draft episodes (For testing draft privacy isolation!)
    {
        "episode_number": 99,
        "title": "[DRAFT] Internal Audio Production Guidelines",
        "slug": "draft-internal-audio-production-guidelines",
        "description": "Unpublished internal draft recording.",
        "category_slug": "academic-stress",
        "duration_seconds": 300,
        "audio_url": DEV_AUDIO_URL,
        "publication_status": "draft",
        "transcript": "Private draft audio transcript.",
    },
]


async def seed_podcasts():
    """Seed podcast categories and 11 podcast episodes (10 published + 1 draft)."""
    print("Starting MindCampus Podcast Database Seed...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        for pod_data in SEED_PODCASTS:
            stmt = select(Podcast).where(Podcast.slug == pod_data["slug"])
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                cat_stmt = select(Category).where(Category.slug == pod_data["category_slug"])
                cat_res = await db.execute(cat_stmt)
                cat = cat_res.scalar_one_or_none()

                pod = Podcast(
                    episode_number=pod_data["episode_number"],
                    title=pod_data["title"],
                    slug=pod_data["slug"],
                    description=pod_data["description"],
                    audio_url=pod_data["audio_url"],
                    duration_seconds=pod_data["duration_seconds"],
                    category_id=cat.id if cat else 1,
                    publication_status=pod_data["publication_status"],
                    transcript=pod_data["transcript"],
                    created_at=now - timedelta(days=pod_data["episode_number"]),
                )
                db.add(pod)

        await db.commit()
        print("MindCampus Podcast Database Seed Completed Successfully!")


if __name__ == "__main__":
    asyncio.run(seed_podcasts())
