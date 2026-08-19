from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.article_repository import ArticleRepository
from app.repositories.podcast_repository import PodcastRepository
from app.repositories.story_repository import StoryRepository


class ContentSearchService:
    """Content retrieval service searching across articles, podcasts, and stories for grounded AI recommendations."""

    @staticmethod
    async def retrieve_relevant_content(
        db: AsyncSession, query: str, limit_per_type: int = 2
    ) -> list[dict]:
        """Search published database records across all three media formats."""
        items = []

        # 1. Search Articles
        articles = await ArticleRepository.get_published_articles(
            db, skip=0, limit=limit_per_type, search_query=query
        )
        for art in articles:
            items.append({
                "id": str(art.id),
                "type": "article",
                "title": art.title,
                "slug": art.slug,
                "excerpt": art.excerpt,
                "category": art.category.name,
                "url": f"/blog/{art.slug}",
            })

        # 2. Search Podcasts
        podcasts = await PodcastRepository.get_published_podcasts(
            db, skip=0, limit=limit_per_type, search_query=query
        )
        for pod in podcasts:
            items.append({
                "id": str(pod.id),
                "type": "podcast",
                "title": pod.title,
                "slug": pod.slug,
                "excerpt": pod.description,
                "category": pod.category.name,
                "url": f"/podcasts/{pod.slug}",
            })

        # 3. Search Digital Stories
        stories = await StoryRepository.get_published_stories(
            db, skip=0, limit=limit_per_type, search_query=query
        )
        for st in stories:
            items.append({
                "id": str(st.id),
                "type": "story",
                "title": st.title,
                "slug": st.slug,
                "excerpt": st.subtitle,
                "category": st.category.name,
                "url": f"/stories/{st.slug}",
            })

        # If no specific keyword search matched, return latest top items across categories
        if not items:
            articles = await ArticleRepository.get_published_articles(db, skip=0, limit=1)
            podcasts = await PodcastRepository.get_published_podcasts(db, skip=0, limit=1)
            stories = await StoryRepository.get_published_stories(db, skip=0, limit=1)

            if articles:
                items.append({
                    "id": str(articles[0].id),
                    "type": "article",
                    "title": articles[0].title,
                    "slug": articles[0].slug,
                    "excerpt": articles[0].excerpt,
                    "category": articles[0].category.name,
                    "url": f"/blog/{articles[0].slug}",
                })
            if podcasts:
                items.append({
                    "id": str(podcasts[0].id),
                    "type": "podcast",
                    "title": podcasts[0].title,
                    "slug": podcasts[0].slug,
                    "excerpt": podcasts[0].description,
                    "category": podcasts[0].category.name,
                    "url": f"/podcasts/{podcasts[0].slug}",
                })
            if stories:
                items.append({
                    "id": str(stories[0].id),
                    "type": "story",
                    "title": stories[0].title,
                    "slug": stories[0].slug,
                    "excerpt": stories[0].subtitle,
                    "category": stories[0].category.name,
                    "url": f"/stories/{stories[0].slug}",
                })

        return items
