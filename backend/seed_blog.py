import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.core.database import engine, AsyncSessionLocal, Base
from app.models.user import User
from app.models.category import Category
from app.models.tag import Tag
from app.models.article import Article, article_tags


SEED_CATEGORIES = [
    {"name": "Mental Wellness", "slug": "mental-wellness", "description": "General mindfulness and self-care strategies for students.", "icon_name": "Sparkles"},
    {"name": "Academic Stress", "slug": "academic-stress", "description": "Managing course workloads, deadlines, and study burnout.", "icon_name": "BookOpen"},
    {"name": "Exam Pressure", "slug": "exam-pressure", "description": "Coping tools and test preparation routines for finals week.", "icon_name": "Zap"},
    {"name": "Study Habits", "slug": "study-habits", "description": "Pacing techniques, memory retention, and study schedules.", "icon_name": "BookOpen"},
    {"name": "Time Management", "slug": "time-management", "description": "Prioritizing tasks and balancing academics with college life.", "icon_name": "Clock"},
    {"name": "Confidence", "slug": "confidence", "description": "Overcoming imposter syndrome and building self-efficacy.", "icon_name": "Award"},
    {"name": "College Life", "slug": "college-life", "description": "Navigating roommate relationships, campus life, and social transition.", "icon_name": "Users"},
    {"name": "Career Stress", "slug": "career-stress", "description": "Managing internship anxiety, resume building, and post-grad uncertainty.", "icon_name": "Briefcase"},
    {"name": "Failure & Resilience", "slug": "failure-resilience", "description": "Recovering from academic setbacks and unexpected midterm grades.", "icon_name": "RefreshCw"},
    {"name": "Self-Care", "slug": "self-care", "description": "Sleep hygiene, physical movement, and mental rest intervals.", "icon_name": "Heart"},
]

SEED_TAGS = [
    {"name": "StudyHabits", "slug": "study-habits"},
    {"name": "ExamAnxiety", "slug": "exam-anxiety"},
    {"name": "Resilience", "slug": "resilience"},
    {"name": "TimeManagement", "slug": "time-management"},
    {"name": "MentalHealth", "slug": "mental-health"},
    {"name": "SelfCare", "slug": "self-care"},
    {"name": "CollegeTransition", "slug": "college-transition"},
]

SEED_USERS = [
    {"full_name": "Dr. Sarah Jenkins", "email": "sarah.jenkins@mindcampus.edu", "role": "admin"},
    {"full_name": "Alex Mercer", "email": "alex.mercer@mindcampus.edu", "role": "student"},
    {"full_name": "Maya Lin", "email": "maya.lin@mindcampus.edu", "role": "student"},
    {"full_name": "Prof. David Ross", "email": "david.ross@mindcampus.edu", "role": "admin"},
]

SEED_ARTICLES = [
    {
        "title": "How to Stay Calm During Exam Week: Actionable Tools for Managing Academic Pressure",
        "slug": "how-to-stay-calm-during-exam-week",
        "excerpt": "Finals week can feel overwhelming. Discover proven cognitive pacing tools and rest intervals to protect your focus and reduce anxiety.",
        "category_slug": "exam-pressure",
        "reading_time_minutes": 5,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Pacing Your Review During Exam Season

Exam season brings intense academic demands. When finals approach, it is common for college students to experience heightened stress, brain fog, and disrupted sleep schedules.

### 1. The 25-5 Pacing Technique
Rather than studying uninterrupted for six straight hours, divide your day into structured study blocks:
- **25 Minutes of Unbroken Focus**: Turn off phone notifications and eliminate tabs.
- **5 Minutes of Total Disconnect**: Walk away from your desk, stretch, or sip water.

### 2. Cognitive Pacing vs Night-Before Cramming
Cramming late into the night impairs memory consolidation. Quality sleep allows your brain to convert short-term study review into retrievable long-term memory.

> *“Pacing yourself is not a sign of weakness; it is the most sustainable key to academic endurance.”*

### Key Actionable Takeaways
- Limit caffeine intake after 3:00 PM during exam week.
- Focus on one topic per study block instead of context switching.
- Reach out to campus peer study groups when encountering difficult concepts.
""",
    },
    {
        "title": "What to Do When You Feel Behind Everyone Else: Overcoming Academic Comparison",
        "slug": "what-to-do-when-you-feel-behind-everyone-else",
        "excerpt": "Comparing your progress to classmates causes unnecessary anxiety. Learn how to focus on your unique trajectory and build self-efficacy.",
        "category_slug": "confidence",
        "reading_time_minutes": 4,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## The Trap of Social and Academic Comparison

In college, it often feels like everyone around you has their major, internship, and career mapped out flawlessly. However, what you observe in class or on social media is merely a highlight reel.

### Re-framing Your Perspective
- **Recognize Highlight Reels**: Classmates rarely broadcast their academic struggles or failed drafts.
- **Focus on Incremental Growth**: Compare your current knowledge to where you started at the beginning of the semester, not to someone else’s end point.

### Building Personal Milestones
Set weekly goals aligned with your personal strengths rather than external expectations.

> *“Your academic journey is a marathon tuned to your personal pace, not a sprint against your peers.”*
""",
    },
    {
        "title": "Small Habits That Make College Life Easier: A Practical Self-Care Guide",
        "slug": "small-habits-that-make-college-life-easier",
        "excerpt": "Self-care doesn’t require hours of free time. Explore micro-habits that restore your energy during busy academic semesters.",
        "category_slug": "self-care",
        "reading_time_minutes": 6,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Micro-Habits for Sustainable Semester Energy

When balancing coursework, lab reports, and campus commitments, self-care is often the first thing sacrificed. However, small micro-habits can preserve your mental reserves.

### Daily 10-Minute Energy Resets
- **Morning Sunlight**: Spending 10 minutes outdoors boosts natural circadian rhythm and focus.
- **Dedicated Study Zones**: Keep your bed reserved strictly for sleep, not for reading textbooks or writing essays.
- **Hydration & Pacing**: Keep a water bottle at your desk and take brief breathing breaks between classes.

> *“Consistency in small habits builds immense emotional resilience over time.”*
""",
    },
    {
        "title": "How to Recover After a Bad Academic Day: A Student Resilience Roadmap",
        "slug": "how-to-recover-after-a-bad-academic-day",
        "excerpt": "Receiving an unexpected grade does not define your academic potential. Learn how to analyze mistakes without falling into despair.",
        "category_slug": "failure-resilience",
        "reading_time_minutes": 5,
        "is_ai_generated": True,
        "publication_status": "published",
        "content": """## Turning Setbacks Into Step-by-Step Growth

Receiving a disappointing midterm grade or struggling through a difficult presentation can be disheartening. However, an academic setback is feedback, not a final verdict.

### 3 Steps to Academic Recovery
1. **Allow Yourself Time to Process**: Acknowledge your frustration without immediate self-criticism.
2. **Review the Mistakes Objectively**: Identify whether the difficulty stemmed from exam format, time allocation, or foundational concepts.
3. **Schedule Office Hours Early**: Professors and teaching assistants appreciate students who proactively seek feedback.

> *“A single grade reflects a snapshot of performance on one day, not your ultimate capacity to master the material.”*
""",
    },
    {
        "title": "Building Confidence Without Comparing Yourself to Others",
        "slug": "building-confidence-without-comparing-yourself-to-others",
        "excerpt": "Overcome imposter syndrome in lectures and seminars by cultivating intrinsic self-confidence and self-advocacy.",
        "category_slug": "confidence",
        "reading_time_minutes": 5,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Cultivating Authentic Academic Confidence

Imposter syndrome makes students feel as though they do not belong in demanding academic environments. Overcoming this requires shifting from external validation to intrinsic mastery.

### Actionable Confidence Exercises
- Keep a personal log of weekly academic wins.
- Ask questions during lecture without worrying about sounding imperfect.
- Form study groups with peers who foster supportive collaboration.
""",
    },
    {
        "title": "A Practical Way to Manage Your Study Time Without Burnout",
        "slug": "a-practical-way-to-manage-your-study-time",
        "excerpt": "Learn how time-blocking and energy management techniques help you complete assignments efficiently while leaving room for rest.",
        "category_slug": "time-management",
        "reading_time_minutes": 4,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Time-Blocking for College Students

Managing deadlines across four or five subjects requires more than a simple to-do list. Time-blocking assigns specific calendar hours to specific tasks.

### Implementing Time-Blocking
- **High-Energy Tasks**: Schedule heavy reading or problem sets during your peak alertness hours.
- **Low-Energy Tasks**: Reserve routine admin work, like organizing lecture notes, for lower-energy periods.
""",
    },
    {
        "title": "When Motivation Disappears: What to Do Next",
        "slug": "when-motivation-disappears-what-to-do-next",
        "excerpt": "Relying purely on motivation often leads to procrastination. Discover how discipline and small starter tasks keep you moving forward.",
        "category_slug": "motivation",
        "reading_time_minutes": 4,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Moving Beyond Motivation

Motivation comes and goes. When mid-semester exhaustion sets in, relying solely on feeling motivated can delay progress.

### The 5-Minute Action Rule
Tell yourself you will work on an essay for just 5 minutes. Often, initiating the task breaks the friction of starting, allowing momentum to take over.
""",
    },
    {
        "title": "How to Handle Academic Pressure and Maintain Balance",
        "slug": "how-to-handle-academic-pressure",
        "excerpt": "Strategies for balancing heavy course requirements, campus extracurriculars, and personal wellness without burning out.",
        "category_slug": "academic-stress",
        "reading_time_minutes": 5,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Navigating Heavy Academic Workloads

Academic pressure increases when multiple deadlines converge in the same week. Prioritization and clear boundaries prevent overwhelm.
""",
    },
    {
        "title": "Why Taking a Break Does Not Mean Giving Up",
        "slug": "why-taking-a-break-does-not-mean-giving-up",
        "excerpt": "Rest is an essential component of high cognitive performance. Understand why mental breaks improve memory and focus.",
        "category_slug": "mental-wellness",
        "reading_time_minutes": 3,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Rest as an Active Performance Strategy

Guilt-free rest allows your brain's default mode network to synthesize complex information. Continuous non-stop study diminishes cognitive retention.
""",
    },
    {
        "title": "Starting Again After a Difficult Semester: A Fresh Perspective",
        "slug": "starting-again-after-a-difficult-semester",
        "excerpt": "How to approach a new academic term with renewed clarity, adjusted habits, and practical support systems.",
        "category_slug": "college-life",
        "reading_time_minutes": 5,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Resetting for the New Term

A new semester offers a clean slate. Reflect on lessons learned from past terms and establish proactive support systems early.
""",
    },
    {
        "title": "Managing Internship Anxiety and Career Uncertainty",
        "slug": "managing-internship-anxiety-and-career-uncertainty",
        "excerpt": "Navigating job applications and post-graduation decisions without letting career anxiety overshadow college life.",
        "category_slug": "career-stress",
        "reading_time_minutes": 5,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Navigating Post-Graduation Career Stress

Career planning is an iterative journey. Break down job searches into manageable weekly steps and utilize campus career services.
""",
    },
    {
        "title": "Effective Study Habits for STEM and Lab-Based Courses",
        "slug": "effective-study-habits-for-stem-courses",
        "excerpt": "Master active recall and spaced repetition techniques to excel in problem-heavy engineering, computer science, and lab classes.",
        "category_slug": "study-habits",
        "reading_time_minutes": 6,
        "is_ai_generated": False,
        "publication_status": "published",
        "content": """## Active Recall vs Passive Rereading

Rereading highlighted notes creates an illusion of competence. Active recall testing forces your brain to retrieve knowledge, cementing understanding.
""",
    },
    # Un-published / Draft articles (For testing draft privacy enforcement!)
    {
        "title": "[DRAFT] Internal Editor Notes: Advanced AI Draft Guidelines",
        "slug": "draft-internal-editor-notes",
        "excerpt": "Unpublished internal draft document.",
        "category_slug": "mental-wellness",
        "reading_time_minutes": 2,
        "is_ai_generated": True,
        "publication_status": "draft",
        "content": "This is a private draft and must NEVER be visible on public endpoints.",
    },
    {
        "title": "[DRAFT] Future Semester Planning Guide",
        "slug": "draft-future-semester-planning-guide",
        "excerpt": "Unpublished draft for upcoming term.",
        "category_slug": "college-life",
        "reading_time_minutes": 3,
        "is_ai_generated": False,
        "publication_status": "draft",
        "content": "This is another private draft document.",
    },
]


async def seed_database():
    """Seed categories, users, tags, and realistic blog articles into SQLite/PostgreSQL."""
    print("Starting MindCampus Blog Database Seed...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Seed Categories
        cat_map = {}
        for cat_data in SEED_CATEGORIES:
            stmt = select(Category).where(Category.slug == cat_data["slug"])
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                cat = Category(**cat_data)
                db.add(cat)
                await db.flush()
                cat_map[cat.slug] = cat
            else:
                cat_map[existing.slug] = existing

        # Seed Tags
        tag_list = []
        for tag_data in SEED_TAGS:
            stmt = select(Tag).where(Tag.slug == tag_data["slug"])
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                tag = Tag(**tag_data)
                db.add(tag)
                await db.flush()
                tag_list.append(tag)
            else:
                tag_list.append(existing)

        # Seed Users
        user_list = []
        for user_data in SEED_USERS:
            stmt = select(User).where(User.email == user_data["email"])
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                u = User(
                    email=user_data["email"],
                    password_hash="pbkdf2_hashed_placeholder",
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                )
                db.add(u)
                await db.flush()
                user_list.append(u)
            else:
                user_list.append(existing)

        # Seed Articles
        now = datetime.now(timezone.utc)
        for idx, art_data in enumerate(SEED_ARTICLES):
            stmt = select(Article).where(Article.slug == art_data["slug"])
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                cat = cat_map.get(art_data["category_slug"])
                author = user_list[idx % len(user_list)] if user_list else None
                art = Article(
                    title=art_data["title"],
                    slug=art_data["slug"],
                    excerpt=art_data["excerpt"],
                    content=art_data["content"],
                    category_id=cat.id if cat else 1,
                    author_id=author.id if author else None,
                    reading_time_minutes=art_data["reading_time_minutes"],
                    publication_status=art_data["publication_status"],
                    is_ai_generated=art_data["is_ai_generated"],
                    created_at=now - timedelta(days=idx),
                    updated_at=now - timedelta(days=idx),
                )
                if tag_list:
                    art.tags.append(tag_list[idx % len(tag_list)])
                db.add(art)

        await db.commit()
        print("MindCampus Blog Database Seed Completed Successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
