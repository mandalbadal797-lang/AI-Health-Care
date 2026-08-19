import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


async def get_admin_token(ac: AsyncClient) -> str:
    """Helper to log in as admin and return JWT access token."""
    login_res = await ac.post(
        "/api/v1/auth/login",
        json={"email": "admin@mindcampus.edu", "password": "AdminPass123!"},
    )
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    return create_access_token({"sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "admin"})


@pytest.mark.asyncio
async def test_admin_analytics_overview():
    """Test administrator can fetch privacy-conscious KPI overview metrics."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.get("/api/v1/admin/analytics/overview?period=30d", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "total_views" in data
        assert "unique_viewers" in data
        assert "total_saves" in data
        assert "total_completions" in data
        assert "completion_rate" in data
        assert "helpful_rate" in data
        assert "average_rating" in data


@pytest.mark.asyncio
async def test_admin_content_performance_table():
    """Test administrator can fetch sortable content performance table."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.get("/api/v1/admin/analytics/content?sort=views&limit=10", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "total" in data
        assert "items" in data
        assert isinstance(data["items"], list)


@pytest.mark.asyncio
async def test_admin_analytics_trends():
    """Test time-series analytics trend arrays for views, saves, completions, and feedback."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.get("/api/v1/admin/analytics/trends?period=30d", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "dates" in data
        assert "views" in data
        assert "saves" in data
        assert "completions" in data
        assert "feedback" in data
        assert len(data["dates"]) == 30


@pytest.mark.asyncio
async def test_admin_analytics_insights():
    """Test rule-based content improvement operational observations."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        res = await ac.get("/api/v1/admin/analytics/insights", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "insights" in data
        assert isinstance(data["insights"], list)


@pytest.mark.asyncio
async def test_student_analytics_access_forbidden():
    """Test non-admin student token receives HTTP 403 Forbidden when requesting analytics."""
    student_token = create_access_token({"sub": "student-uuid-1234", "role": "student"})
    headers = {"Authorization": f"Bearer {student_token}"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/admin/analytics/overview", headers=headers)
        assert res.status_code == 403
