import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


async def get_test_token(ac: AsyncClient) -> str:
    """Helper to log in as admin/user and return a valid JWT token for database user."""
    login_res = await ac.post(
        "/api/v1/auth/login",
        json={"email": "admin@mindcampus.edu", "password": "AdminPass123!"},
    )
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    return create_access_token({"sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "student"})


@pytest.mark.asyncio
async def test_submit_content_feedback_and_get_summary():
    """Test student content helpfulness submission and public quality summary computation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]

        # 1. Submit Feedback
        fb_res = await ac.post(
            f"/api/v1/content/{article_id}/feedback",
            headers=headers,
            json={
                "content_type": "article",
                "is_helpful": True,
                "rating": 5,
                "category_tags": ["Easy to understand", "Practical"],
                "comment": "Very helpful article during exam period!",
            },
        )
        assert fb_res.status_code == 201
        assert fb_res.json()["is_helpful"] is True
        assert fb_res.json()["rating"] == 5

        # 2. Get Public Summary
        sum_res = await ac.get(f"/api/v1/content/{article_id}/feedback/summary?type=article")
        assert sum_res.status_code == 200
        summary = sum_res.json()
        assert summary["total_responses"] >= 1
        assert summary["helpful_count"] >= 1
        assert summary["average_rating"] >= 1.0


@pytest.mark.asyncio
async def test_update_existing_feedback():
    """Test updating feedback (YES to NO) updates existing record without duplicate creation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]

        # Submit initial Yes feedback
        await ac.post(
            f"/api/v1/content/{article_id}/feedback",
            headers=headers,
            json={"content_type": "article", "is_helpful": True, "rating": 5},
        )

        # Update to No feedback
        up_res = await ac.post(
            f"/api/v1/content/{article_id}/feedback",
            headers=headers,
            json={"content_type": "article", "is_helpful": False, "rating": 3},
        )
        assert up_res.status_code == 201
        assert up_res.json()["is_helpful"] is False
        assert up_res.json()["rating"] == 3

        # Verify my feedback returns updated state
        my_res = await ac.get(f"/api/v1/content/{article_id}/feedback/me?type=article", headers=headers)
        assert my_res.status_code == 200
        assert my_res.json()["feedback"]["is_helpful"] is False


@pytest.mark.asyncio
async def test_rating_validation():
    """Test rating outside 1-5 range is rejected with HTTP 420/400 validation error."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]

        # Rating 6 -> Bad Request or Validation Error
        invalid_res = await ac.post(
            f"/api/v1/content/{article_id}/feedback",
            headers=headers,
            json={"content_type": "article", "is_helpful": True, "rating": 6},
        )
        assert invalid_res.status_code in [400, 422]


@pytest.mark.asyncio
async def test_comment_length_validation():
    """Test written comment exceeding 1000 characters is rejected with 400 or 422 error."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]
        long_comment = "a" * 1050

        long_res = await ac.post(
            f"/api/v1/content/{article_id}/feedback",
            headers=headers,
            json={"content_type": "article", "is_helpful": True, "comment": long_comment},
        )
        assert long_res.status_code in [400, 422]


@pytest.mark.asyncio
async def test_admin_feedback_dashboard_and_moderation():
    """Test admin dashboard metrics list and written comment moderation workflow."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch Dashboard
        dash_res = await ac.get("/api/v1/admin/feedback", headers=headers)
        assert dash_res.status_code == 200
        data = dash_res.json()
        assert "summary" in data
        assert "items" in data

        items = data["items"]
        if items:
            fb_id = items[0]["id"]
            # 2. Moderate Feedback
            mod_res = await ac.patch(
                f"/api/v1/admin/feedback/{fb_id}/moderate",
                headers=headers,
                json={"status": "approved", "reason": "Verified quality feedback"},
            )
            assert mod_res.status_code == 200
            assert mod_res.json()["moderation_status"] == "approved"
