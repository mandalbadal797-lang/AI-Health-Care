import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from app.core.database import engine, AsyncSessionLocal, Base
from app.models.category import Category
from app.models.story import Story

SEED_STORIES = [
    {
        "title": "I Failed My First Midterm — And Found My Voice",
        "slug": "failed-first-midterm-found-my-voice",
        "subtitle": "How receiving an F on my first college exam forced me to change my study habits and ask for help.",
        "category_slug": "failure-resilience",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 6,
        "reflection_question": "What is one academic failure in your past that ultimately taught you a valuable lesson?",
        "key_takeaway": "An academic setback is diagnostic feedback, not a permanent definition of your potential.",
        "publication_status": "published",
        "content": """01 — The Beginning
Walking into my first university lecture hall with 300 other students, I felt like an impostor. I assumed everyone around me had perfectly structured study systems, endless motivation, and complete clarity about their futures.

02 — What Went Wrong
When midterms arrived, I tried using my high school strategy: cramming the night before. But college exams demand deep conceptual synthesis. When grades were posted, I opened my portal to find a bold red 'F' next to my chemistry exam. I felt a wave of shame and embarrassment.

03 — The Turning Point
Instead of retreating into isolation, I booked an appointment with my academic advisor. We looked at my study habits together. She pointed out that I had never attended office hours or asked for clarification when concepts got confusing. That afternoon, I walked into my professor's office. He walked me through the concepts line by line and encouraged me to join a weekly peer study group.

04 — What I Learned
By the end of the semester, I raised my grade to a B+. But more importantly, I realized that asking for help is a sign of self-advocacy and strength, not weakness.""",
    },
    {
        "title": "The Day I Stopped Comparing My Timeline to Others",
        "slug": "day-i-stopped-comparing-my-timeline",
        "subtitle": "Navigating social pressure and learning to trust my own unique academic pace.",
        "category_slug": "confidence",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 5,
        "reflection_question": "In what areas of your college journey do you catch yourself comparing your progress to peers?",
        "key_takeaway": "Your academic journey is a personal marathon, not a synchronized race against your classmates.",
        "publication_status": "published",
        "content": """01 — The Beginning
During junior year, LinkedIn and group chats felt like constant broadcasts of peer achievements: prestigious summer internships, early graduate admissions, and research grants.

02 — What Went Wrong
I spent weeks worrying that I was falling behind. I applied to internships that didn't align with my interests simply because everyone else was applying. My anxiety spiked and my focus fragmented.

03 — The Turning Point
I decided to take a weekend digital detox. I wrote down my core values, interests, and what genuinely mattered to me. I realized that my interest in campus community work was valuable, even if it didn't fit a corporate mold.

04 — What I Learned
I landed a local non-profit coordinator role that matched my passion for student wellness. When you focus on your own lane, progress becomes meaningful and fulfilling.""",
    },
    {
        "title": "Learning to Ask for Help When Overwhelmed",
        "slug": "learning-to-ask-for-help-when-overwhelmed",
        "subtitle": "Breaking through pride and isolation during a demanding sophomore semester.",
        "category_slug": "academic-stress",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 5,
        "reflection_question": "What holds you back from seeking assistance when your workload becomes overwhelming?",
        "key_takeaway": "Campus resources exist to support you—reaching out early prevents quiet burnout.",
        "publication_status": "published",
        "content": """01 — The Beginning
Taking 18 credit hours while working 15 hours a week at the campus library seemed doable on paper.

02 — What Went Wrong
By mid-semester, sleep deprivation caught up with me. I missed two major reading assignments and felt constantly on the verge of exhaustion.

03 — The Turning Point
My roommate noticed my stress and accompanied me to the campus student wellness center. The counselor helped me restructure my weekly calendar and request extension approvals.

04 — What I Learned
Seeking support early gave me the breathing room needed to regain balance.""",
    },
    {
        "title": "Starting College 1,000 Miles Away From Home",
        "slug": "starting-college-far-from-home",
        "subtitle": "Overcoming homesickness and building a supportive new community on campus.",
        "category_slug": "college-life",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 7,
        "reflection_question": "How do you create a sense of home and belonging when moving to a new environment?",
        "key_takeaway": "Belonging takes time to cultivate; small daily connections build lasting community.",
        "publication_status": "published",
        "content": """01 — The Beginning
Moving across the country for university was thrilling during orientation, but quiet dorm nights brought intense homesickness.

02 — What Went Wrong
I spent my first two weekends inside my room, calling family back home and avoiding campus events.

03 — The Turning Point
I signed up for a weekend campus hiking club excursion. I met three other students who were also adjusting to being far from home.

04 — What I Learned
Opening up to new experiences helped transform an unfamiliar campus into a welcoming home.""",
    },
    {
        "title": "From Career Confusion to Finding My True Purpose",
        "slug": "career-confusion-to-true-purpose",
        "subtitle": "Changing majors during senior year and discovering true academic alignment.",
        "category_slug": "career-stress",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 6,
        "reflection_question": "Are your current academic goals aligned with your genuine interests or external expectations?",
        "key_takeaway": "It is never too late to realign your path with what truly energizes your intellect.",
        "publication_status": "published",
        "content": """01 — The Beginning
I declared my major based on parental expectations rather than my own curiosity.

02 — What Went Wrong
By senior year, sitting in lectures felt disengaging. I dreaded every class session.

03 — The Turning Point
I took an elective in cognitive psychology. The material sparked an immediate interest I hadn't felt in years. I spoke with the department chair about transitioning into behavioral health research.

04 — What I Learned
Pivoting requires courage, but staying on the wrong path is far more exhausting.""",
    },
    {
        "title": "Building Confidence One Public Speaking Presentation at a Time",
        "slug": "building-confidence-public-speaking",
        "subtitle": "How micro-exposures cured my intense seminar anxiety.",
        "category_slug": "confidence",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 5,
        "reflection_question": "What small daily action could help you build confidence in intimidating situations?",
        "key_takeaway": "Confidence is a muscle built through small, repeated micro-actions.",
        "publication_status": "published",
        "content": """01 — The Beginning
Standing up to present in front of 30 classmates used to cause my voice to shake uncontrollable.

02 — What Went Wrong
I avoided participation grades and stayed silent during class discussions.

03 — The Turning Point
I decided to ask one brief question in every seminar lecture. The first time was scary, but by the third week it felt natural.

04 — What I Learned
Small actions repeated consistently erode big fears over time.""",
    },
    {
        "title": "The Semester I Almost Gave Up — And What Kept Me Going",
        "slug": "semester-i-almost-gave-up",
        "subtitle": "Finding resilience during personal family health emergencies.",
        "category_slug": "failure-resilience",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 6,
        "reflection_question": "Who can you lean on when life presents unexpected personal challenges?",
        "key_takeaway": "Resilience is not bearing everything alone—it is holding onto hope while leaning on your community.",
        "publication_status": "published",
        "content": """01 — The Beginning
During winter term, my family experienced a severe health emergency that required my presence back home.

02 — What Went Wrong
Trying to manage hospital visits while studying for finals felt impossible.

03 — The Turning Point
My dean of students coordinated an incomplete-status arrangement that allowed me to complete my coursework over winter break.

04 — What I Learned
Compassionate policies exist to protect your education during crisis moments.""",
    },
    {
        "title": "Mastering the 5-Minute Starter Rule for Heavy Research Papers",
        "slug": "mastering-5-minute-starter-rule",
        "subtitle": "Conquering chronic procrastination through micro-commitments.",
        "category_slug": "study-habits",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 4,
        "reflection_question": "What is one assignment you are postponing right now that you could work on for just 5 minutes?",
        "key_takeaway": "Action precedes motivation—starting for 5 minutes breaks friction.",
        "publication_status": "published",
        "content": """01 — The Beginning
A 15-page term paper used to freeze me in state of perfectionist paralysis.

02 — What Went Wrong
I would clean my room, check emails, and delay writing until 24 hours before the deadline.

03 — The Turning Point
I adopted the 5-minute rule: open the document and write just 3 sentences without caring if they were perfect.

04 — What I Learned
Once the blank screen is broken, momentum takes over naturally.""",
    },
    {
        "title": "Redefining Success Beyond a 4.0 GPA",
        "slug": "redefining-success-beyond-gpa",
        "subtitle": "Discovering the value of soft skills, wellness, and meaningful friendships.",
        "category_slug": "personal-growth",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 5,
        "reflection_question": "How do you measure personal growth outside of numerical grades?",
        "key_takeaway": "Academic excellence is important, but personal character and wellbeing define long-term success.",
        "publication_status": "published",
        "content": """01 — The Beginning
I used to tie 100% of my self-worth to grade point averages.

02 — What Went Wrong
A single lower mark would ruin my entire week and cause intense stress.

03 — The Turning Point
Joining campus student organizations helped me see how much value exists in leadership, empathy, and collaboration.

04 — What I Learned
Grades open initial doors, but character and health sustain your journey.""",
    },
    {
        "title": "Finding Calm in the Middle of Campus Noise",
        "slug": "finding-calm-middle-campus-noise",
        "subtitle": "Creating a personal daily mindfulness routine in a busy dormitory.",
        "category_slug": "mental-wellness",
        "author_name": "Student Story — Demonstration",
        "reading_time_minutes": 5,
        "reflection_question": "Where is your quiet sanctuary when campus life gets noisy?",
        "key_takeaway": "Creating quiet mental space daily protects your focus and emotional balance.",
        "publication_status": "published",
        "content": """01 — The Beginning
Dormitories are full of constant activity, music, and conversation.

02 — What Went Wrong
I felt overstimulated and struggled to concentrate on complex reading.

03 — The Turning Point
I found a quiet corner in the campus library garden and reserved 15 minutes each morning for silent reflection.

04 — What I Learned
Protecting quiet time grounds your mind for the rest of the day.""",
    },
    # Un-published / Draft digital stories (For testing draft privacy isolation!)
    {
        "title": "[DRAFT] Internal Story Editorial Review Notes",
        "slug": "draft-internal-story-editorial-review-notes",
        "subtitle": "Private internal draft review note.",
        "category_slug": "academic-stress",
        "author_name": "Internal Editor",
        "reading_time_minutes": 2,
        "reflection_question": "Draft question",
        "key_takeaway": "Draft takeaway",
        "publication_status": "draft",
        "content": "Private story content draft.",
    },
]


async def seed_stories():
    """Seed story categories and 11 digital stories (10 published + 1 draft)."""
    print("Starting MindCampus Digital Storytelling Database Seed...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        for idx, story_data in enumerate(SEED_STORIES):
            stmt = select(Story).where(Story.slug == story_data["slug"])
            res = await db.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                cat_stmt = select(Category).where(Category.slug == story_data["category_slug"])
                cat_res = await db.execute(cat_stmt)
                cat = cat_res.scalar_one_or_none()

                story = Story(
                    title=story_data["title"],
                    slug=story_data["slug"],
                    subtitle=story_data["subtitle"],
                    content=story_data["content"],
                    author_name=story_data["author_name"],
                    reading_time_minutes=story_data["reading_time_minutes"],
                    category_id=cat.id if cat else 1,
                    reflection_question=story_data.get("reflection_question"),
                    key_takeaway=story_data.get("key_takeaway"),
                    publication_status=story_data["publication_status"],
                    created_at=now - timedelta(days=idx * 2),
                )
                db.add(story)

        await db.commit()
        print("MindCampus Digital Storytelling Database Seed Completed Successfully!")


if __name__ == "__main__":
    asyncio.run(seed_stories())
