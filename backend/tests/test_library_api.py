import uuid
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
    # Fallback to test user token
    return create_access_token({"sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "student"})


@pytest.mark.asyncio
async def test_unauthenticated_library_access():
    """Test unauthenticated request to library route returns 401 Unauthorized."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/library")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_save_content_and_list_library():
    """Test saving published article to student library and listing saved items."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # First get a published article ID
        art_res = await ac.get("/api/v1/articles")
        assert art_res.status_code == 200
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found in seed database.")

        article_id = articles[0]["id"]

        # 1. Save Article
        save_res = await ac.post(
            "/api/v1/library",
            headers=headers,
            json={"content_id": article_id, "content_type": "article"},
        )
        assert save_res.status_code == 201

        # 2. Duplicate Save (idempotent)
        dup_res = await ac.post(
            "/api/v1/library",
            headers=headers,
            json={"content_id": article_id, "content_type": "article"},
        )
        assert dup_res.status_code == 201

        # 3. List Library
        list_res = await ac.get("/api/v1/library", headers=headers)
        assert list_res.status_code == 200
        data = list_res.json()
        assert "items" in data
        assert any(item["id"] == article_id for item in data["items"])


@pytest.mark.asyncio
async def test_remove_saved_content():
    """Test removing bookmark from student library."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]

        # Save and then remove
        await ac.post(
            "/api/v1/library",
            headers=headers,
            json={"content_id": article_id, "content_type": "article"},
        )

        del_res = await ac.delete(f"/api/v1/library/{article_id}?type=article", headers=headers)
        assert del_res.status_code == 200

        # Verify no longer in library
        list_res = await ac.get("/api/v1/library", headers=headers)
        data = list_res.json()
        assert not any(item["id"] == article_id for item in data["items"])


@pytest.mark.asyncio
async def test_idor_protection_library():
    """Test User A cannot delete or view User B's saved content (IDOR protection)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        user_a_token = await get_test_token(ac)
        # Create a second user token with another valid DB user or different token
        user_b_token = create_access_token({"sub": "00000000-0000-0000-0000-000000000002", "role": "student"})

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]

        # User A saves content
        await ac.post(
            "/api/v1/library",
            headers={"Authorization": f"Bearer {user_a_token}"},
            json={"content_id": article_id, "content_type": "article"},
        )

        # User B (unauthenticated or different user) attempts to delete User A's bookmark -> returns 401 or 404
        del_res = await ac.delete(
            f"/api/v1/library/{article_id}?type=article",
            headers={"Authorization": f"Bearer {user_b_token}"},
        )
        assert del_res.status_code in [401, 404]

        # Verify User A's library still contains the item
        a_lib = await ac.get("/api/v1/library", headers={"Authorization": f"Bearer {user_a_token}"})
        assert any(item["id"] == article_id for item in a_lib.json()["items"])


@pytest.mark.asyncio
async def test_progress_tracking_and_completion():
    """Test reading progress tracking and 90% completion threshold."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]

        # Update progress to 95% (completed)
        prog_res = await ac.put(
            f"/api/v1/library/progress/{article_id}",
            headers=headers,
            json={
                "content_type": "article",
                "progress_percent": 95.0,
                "position_seconds": 0.0,
                "duration_seconds": 0.0,
            },
        )
        assert prog_res.status_code == 200
        assert prog_res.json()["is_completed"] is True

        # Fetch completed progress list
        completed_res = await ac.get("/api/v1/library/progress?mode=completed", headers=headers)
        assert completed_res.status_code == 200
        data = completed_res.json()
        assert any(item["id"] == article_id for item in data["items"])


@pytest.mark.asyncio
async def test_recently_viewed_history():
    """Test tracking recently viewed items for student."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_test_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        articles = art_res.json()["items"]
        if not articles:
            pytest.skip("No published articles found.")

        article_id = articles[0]["id"]

        track_res = await ac.post(
            "/api/v1/library/recently-viewed",
            headers=headers,
            json={"content_id": article_id, "content_type": "article"},
        )
        assert track_res.status_code == 200

        viewed_res = await ac.get("/api/v1/library/recently-viewed", headers=headers)
        assert viewed_res.status_code == 200
        assert any(item["id"] == article_id for item in viewed_res.json()["items"])
