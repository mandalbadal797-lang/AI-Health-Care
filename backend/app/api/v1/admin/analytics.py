from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/admin/analytics", tags=["Admin Analytics & Insights"])


@router.get("/overview")
async def get_analytics_overview(
    period: str = Query(default="30d", description="7d, 30d, 90d, year, custom"),
    type: str = Query(default="all", description="all, article, podcast, story"),
    category_id: Optional[int] = Query(default=None),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve top-level platform engagement and quality KPI overview cards."""
    kpis = await AnalyticsService.get_overview_kpis(
        db=db, period=period, content_type=type, category_id=category_id
    )
    return kpis


@router.get("/content")
async def get_content_performance(
    type: str = Query(default="all"),
    category_id: Optional[int] = Query(default=None),
    sort: str = Query(default="views", description="views, saves, completion_rate, rating, helpful_rate"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve sortable content performance table combining views, saves, completions, and ratings."""
    data = await AnalyticsService.get_content_performance_table(
        db=db, content_type=type, category_id=category_id, sort=sort, page=page, limit=limit
    )
    return data


@router.get("/categories")
async def get_category_analytics(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve category performance breakdown table."""
    data = await AnalyticsService.get_category_performance(db)
    return {"categories": data}


@router.get("/trends")
async def get_analytics_trends(
    period: str = Query(default="30d"),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve time-series trend arrays for views, saves, completions, and feedback."""
    trends = await AnalyticsService.get_time_series_trends(db=db, period=period)
    return trends


@router.get("/insights")
async def get_content_improvement_insights(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve rule-based operational insights to identify content improvement opportunities."""
    insights = await AnalyticsService.get_intelligent_insights(db)
    return {"insights": insights}
