from fastapi import APIRouter
from app.api.v1 import health, auth, articles, podcasts, stories, bookmarks, categories, ai, search, library, feedback, community
from app.api.v1.admin import dashboard as admin_dashboard
from app.api.v1.admin import articles as admin_articles
from app.api.v1.admin import podcasts as admin_podcasts
from app.api.v1.admin import stories as admin_stories
from app.api.v1.admin import categories as admin_categories
from app.api.v1.admin import audit_logs as admin_audit_logs
from app.api.v1.admin import analytics as admin_analytics
from app.api.v1.admin import ai_studio as admin_ai_studio
from app.api.v1.admin import moderation as admin_moderation
from app.api.v1.admin import community_admin as admin_community

api_router = APIRouter()

# Include version 1 public routers
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(articles.router)
api_router.include_router(podcasts.router)
api_router.include_router(stories.router)
api_router.include_router(bookmarks.router)
api_router.include_router(categories.router)
api_router.include_router(ai.router)
api_router.include_router(search.router)
api_router.include_router(library.router)
api_router.include_router(feedback.router)
api_router.include_router(community.router)

# Include Admin routers (RBAC protected via require_admin)
api_router.include_router(admin_dashboard.router)
api_router.include_router(admin_articles.router)
api_router.include_router(admin_podcasts.router)
api_router.include_router(admin_stories.router)
api_router.include_router(admin_categories.router)
api_router.include_router(admin_audit_logs.router)
api_router.include_router(admin_analytics.router)
api_router.include_router(admin_ai_studio.router)
api_router.include_router(admin_moderation.router)
api_router.include_router(admin_community.router)
