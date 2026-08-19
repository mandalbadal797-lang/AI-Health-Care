import re
from typing import Optional, List, Dict, Any
from sqlalchemy import select, or_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.article import Article
from app.models.podcast import Podcast
from app.models.story import Story
from app.models.category import Category


class SearchService:
    """Unified search and discovery engine for MindCampus published content."""

    @staticmethod
    def _calculate_relevance(item: dict, terms: List[str]) -> int:
        """Calculate deterministic relevance score for a search result item based on term matches."""
        score = 0
        title_lower = item['title'].lower()
        excerpt_lower = item['excerpt'].lower()
        cat_lower = item['category_name'].lower()
        content_lower = (item.get('content') or '').lower()

        for term in terms:
            if not term:
                continue
            if term in title_lower:
                score += 10
                if title_lower.startswith(term):
                    score += 5
            if term in cat_lower:
                score += 4
            if term in excerpt_lower:
                score += 3
            if term in content_lower:
                score += 1

        return score

    @classmethod
    async def global_search(
        cls,
        db: AsyncSession,
        query: str = "",
        content_type: str = "all",
        category_id: Optional[int] = None,
        category_slug: Optional[str] = None,
        sort: str = "relevance",
        page: int = 1,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """Perform normalized multi-format search across published articles, podcasts, and digital stories."""
        normalized_q = query.strip().lower()
        terms = [t for t in re.split(r'\s+', normalized_q) if t]

        candidates: List[dict] = []

        # Resolve category_id from category_slug if provided
        if category_slug and not category_id:
            cat_res = await db.execute(select(Category).where(Category.slug == category_slug))
            cat = cat_res.scalar_one_or_none()
            if cat:
                category_id = cat.id

        # 1. Fetch Published Articles
        if content_type in ["all", "article", "blog"]:
            art_stmt = select(Article).options(joinedload(Article.category), joinedload(Article.author)).where(Article.publication_status == "published")
            if category_id:
                art_stmt = art_stmt.where(Article.category_id == category_id)

            if terms:
                conditions = []
                for term in terms:
                    t = f"%{term}%"
                    conditions.append(or_(Article.title.ilike(t), Article.excerpt.ilike(t), Article.content.ilike(t)))
                art_stmt = art_stmt.where(or_(*conditions))

            art_res = await db.execute(art_stmt)
            for art in art_res.scalars().all():
                candidates.append({
                    "id": str(art.id),
                    "type": "article",
                    "title": art.title,
                    "slug": art.slug,
                    "excerpt": art.excerpt,
                    "content": art.content,
                    "category_id": art.category_id,
                    "category_name": art.category.name if art.category else "General",
                    "category_slug": art.category.slug if art.category else "general",
                    "reading_time_minutes": art.reading_time_minutes,
                    "author_name": art.author.full_name if art.author else "MindCampus Editorial",
                    "url": f"/blog/{art.slug}",
                    "published_at": art.created_at.isoformat(),
                    "created_at_raw": art.created_at,
                })

        # 2. Fetch Published Podcasts
        if content_type in ["all", "podcast"]:
            pod_stmt = select(Podcast).options(joinedload(Podcast.category)).where(Podcast.publication_status == "published")
            if category_id:
                pod_stmt = pod_stmt.where(Podcast.category_id == category_id)

            if terms:
                conditions = []
                for term in terms:
                    t = f"%{term}%"
                    conditions.append(or_(Podcast.title.ilike(t), Podcast.description.ilike(t)))
                pod_stmt = pod_stmt.where(or_(*conditions))

            pod_res = await db.execute(pod_stmt)
            for pod in pod_res.scalars().all():
                candidates.append({
                    "id": str(pod.id),
                    "type": "podcast",
                    "title": pod.title,
                    "slug": pod.slug,
                    "excerpt": pod.description,
                    "content": pod.description,
                    "category_id": pod.category_id,
                    "category_name": pod.category.name if pod.category else "General",
                    "category_slug": pod.category.slug if pod.category else "general",
                    "duration_seconds": pod.duration_seconds,
                    "episode_number": pod.episode_number,
                    "url": f"/podcasts/{pod.slug}",
                    "published_at": pod.created_at.isoformat(),
                    "created_at_raw": pod.created_at,
                })

        # 3. Fetch Published Digital Stories
        if content_type in ["all", "story"]:
            st_stmt = select(Story).options(joinedload(Story.category)).where(Story.publication_status == "published")
            if category_id:
                st_stmt = st_stmt.where(Story.category_id == category_id)

            if terms:
                conditions = []
                for term in terms:
                    t = f"%{term}%"
                    conditions.append(or_(Story.title.ilike(t), Story.subtitle.ilike(t), Story.content.ilike(t)))
                st_stmt = st_stmt.where(or_(*conditions))

            st_res = await db.execute(st_stmt)
            for st in st_res.scalars().all():
                candidates.append({
                    "id": str(st.id),
                    "type": "story",
                    "title": st.title,
                    "slug": st.slug,
                    "excerpt": st.subtitle,
                    "content": st.content,
                    "category_id": st.category_id,
                    "category_name": st.category.name if st.category else "General",
                    "category_slug": st.category.slug if st.category else "general",
                    "reading_time_minutes": st.reading_time_minutes,
                    "author_name": st.author_name,
                    "url": f"/stories/{st.slug}",
                    "published_at": st.created_at.isoformat(),
                    "created_at_raw": st.created_at,
                })

        # Calculate scores if query provided
        for item in candidates:
            if terms:
                item['relevance_score'] = cls._calculate_relevance(item, terms)
            else:
                item['relevance_score'] = 1

        # Apply Sorting
        if sort == "newest":
            candidates.sort(key=lambda x: (x['created_at_raw'], x['relevance_score']), reverse=True)
        elif sort == "oldest":
            candidates.sort(key=lambda x: x['created_at_raw'])
        elif sort == "alphabetical":
            candidates.sort(key=lambda x: x['title'].lower())
        else:  # relevance
            candidates.sort(key=lambda x: (x['relevance_score'], x['created_at_raw']), reverse=True)

        total = len(candidates)
        skip = (page - 1) * limit
        paginated_items = candidates[skip : skip + limit]

        # Clean up temporary raw fields
        results = []
        for item in paginated_items:
            clean_item = {k: v for k, v in item.items() if k not in ['created_at_raw', 'content']}
            results.append(clean_item)

        return {
            "query": query,
            "content_type": content_type,
            "sort": sort,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit if total > 0 else 1,
            "items": results,
        }

    @classmethod
    async def get_suggestions(cls, db: AsyncSession, query: str, max_results: int = 6) -> List[dict]:
        """Fetch title suggestions for live search bar autocomplete based on public published items."""
        q = query.strip().lower()
        if not q:
            return []

        suggestions: List[dict] = []
        term = f"%{q}%"

        # Search titles in Articles, Podcasts, and Stories
        art_res = await db.execute(select(Article).where(Article.publication_status == "published", Article.title.ilike(term)).limit(max_results))
        for art in art_res.scalars().all():
            suggestions.append({"title": art.title, "type": "article", "slug": art.slug, "url": f"/blog/{art.slug}"})

        if len(suggestions) < max_results:
            pod_res = await db.execute(select(Podcast).where(Podcast.publication_status == "published", Podcast.title.ilike(term)).limit(max_results - len(suggestions)))
            for pod in pod_res.scalars().all():
                suggestions.append({"title": pod.title, "type": "podcast", "slug": pod.slug, "url": f"/podcasts/{pod.slug}"})

        if len(suggestions) < max_results:
            st_res = await db.execute(select(Story).where(Story.publication_status == "published", Story.title.ilike(term)).limit(max_results - len(suggestions)))
            for st in st_res.scalars().all():
                suggestions.append({"title": st.title, "type": "story", "slug": st.slug, "url": f"/stories/{st.slug}"})

        return suggestions[:max_results]

    @classmethod
    async def get_related_content(
        cls,
        db: AsyncSession,
        content_type: str,
        current_id: str,
        category_id: int,
        limit: int = 3,
    ) -> List[dict]:
        """Retrieve related content items matching category, excluding current content ID."""
        results: List[dict] = []

        if content_type in ["article", "blog"]:
            art_res = await db.execute(select(Article).options(joinedload(Article.category)).where(Article.publication_status == "published", Article.category_id == category_id).limit(limit + 2))
            for art in art_res.scalars().all():
                if str(art.id) != current_id:
                    results.append({
                        "id": str(art.id),
                        "type": "article",
                        "title": art.title,
                        "slug": art.slug,
                        "excerpt": art.excerpt,
                        "category_name": art.category.name if art.category else "General",
                        "url": f"/blog/{art.slug}",
                    })
        elif content_type == "podcast":
            pod_res = await db.execute(select(Podcast).options(joinedload(Podcast.category)).where(Podcast.publication_status == "published", Podcast.category_id == category_id).limit(limit + 2))
            for pod in pod_res.scalars().all():
                if str(pod.id) != current_id:
                    results.append({
                        "id": str(pod.id),
                        "type": "podcast",
                        "title": pod.title,
                        "slug": pod.slug,
                        "excerpt": pod.description,
                        "category_name": pod.category.name if pod.category else "General",
                        "url": f"/podcasts/{pod.slug}",
                    })
        elif content_type == "story":
            st_res = await db.execute(select(Story).options(joinedload(Story.category)).where(Story.publication_status == "published", Story.category_id == category_id).limit(limit + 2))
            for st in st_res.scalars().all():
                if str(st.id) != current_id:
                    results.append({
                        "id": str(st.id),
                        "type": "story",
                        "title": st.title,
                        "slug": st.slug,
                        "excerpt": st.subtitle,
                        "category_name": st.category.name if st.category else "General",
                        "url": f"/stories/{st.slug}",
                    })

        return results[:limit]
