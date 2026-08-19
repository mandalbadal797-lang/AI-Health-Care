import uuid
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_admin_login_success():
    """Test admin authentication endpoint issues valid JWT token for admin credentials."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/login",
            json={"email": "admin@mindcampus.edu", "password": "AdminPass123!"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"


@pytest.mark.asyncio
async def test_unauthorized_admin_access():
    """Test unauthenticated request to admin route returns 401 Unauthorized."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/admin/dashboard")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_student_forbidden_admin_access():
    """Test authenticated student request to admin route returns 403 Forbidden (RBAC enforcement)."""
    student_token = create_access_token({"sub": "22222222-2222-2222-2222-222222222222", "role": "student"})
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {student_token}"},
        )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_dashboard_metrics():
    """Test admin dashboard endpoint returns operational content statistics."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "admin@mindcampus.edu", "password": "AdminPass123!"},
        )
        token = login_res.json()["access_token"]

        response = await ac.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    data = response.json()
    assert "articles" in data
    assert "podcasts" in data
    assert "stories" in data
    assert "pending_moderation_count" in data


@pytest.mark.asyncio
async def test_admin_article_lifecycle():
    """Test full admin blog lifecycle: Create draft -> Publish -> Unpublish -> Archive."""
    unique_slug = f"test-admin-lifecycle-{uuid.uuid4().hex[:8]}"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "admin@mindcampus.edu", "password": "AdminPass123!"},
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create Article Draft
        create_res = await ac.post(
            "/api/v1/admin/articles",
            headers=headers,
            json={
                "title": "Test Admin Lifecycle Article",
                "slug": unique_slug,
                "excerpt": "Test Excerpt",
                "content": "## Section 1\nTest Content",
                "category_id": 1,
                "reading_time_minutes": 4,
                "publication_status": "draft",
            },
        )
        assert create_res.status_code == 200
        article_id = create_res.json()["id"]

        # 2. Publish Article
        pub_res = await ac.patch(f"/api/v1/admin/articles/{article_id}/publish", headers=headers)
        assert pub_res.status_code == 200

        # 3. Unpublish Article
        unpub_res = await ac.patch(f"/api/v1/admin/articles/{article_id}/unpublish", headers=headers)
        assert unpub_res.status_code == 200

        # 4. Archive Article
        del_res = await ac.delete(f"/api/v1/admin/articles/{article_id}", headers=headers)
        assert del_res.status_code == 200
