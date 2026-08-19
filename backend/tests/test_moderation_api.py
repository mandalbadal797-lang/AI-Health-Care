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
async def test_submit_content_for_review():
    """Test submitting draft content for moderation review runs automated safety checks."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch an article ID
        art_res = await ac.get("/api/v1/articles", headers=headers)
        articles = art_res.json()["items"]
        assert len(articles) > 0
        art_id = articles[0]["id"]

        payload = {"content_id": art_id, "content_type": "article"}
        res = await ac.post("/api/v1/admin/moderation/submit", json=payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert "review_id" in data
        assert data["status"] == "under_review"
        assert "safety_status" in data


@pytest.mark.asyncio
async def test_get_moderation_queue_and_kpis():
    """Test fetching review queue list and moderation KPI metrics."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Queue
        q_res = await ac.get("/api/v1/admin/moderation", headers=headers)
        assert q_res.status_code == 200
        q_data = q_res.json()
        assert "total" in q_data
        assert "items" in q_data

        # 2. KPIs
        k_res = await ac.get("/api/v1/admin/moderation/kpis", headers=headers)
        assert k_res.status_code == 200
        k_data = k_res.json()
        assert "pending_reviews" in k_data
        assert "published" in k_data


@pytest.mark.asyncio
async def test_execute_review_action_approve_and_publish():
    """Test approving a review and publishing the approved item."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Get articles
        art_res = await ac.get("/api/v1/articles", headers=headers)
        art_id = art_res.json()["items"][0]["id"]

        # 2. Submit
        sub_res = await ac.post(
            "/api/v1/admin/moderation/submit",
            json={"content_id": art_id, "content_type": "article"},
            headers=headers,
        )
        review_id = sub_res.json()["review_id"]

        # 3. Approve Action
        act_res = await ac.post(
            f"/api/v1/admin/moderation/{review_id}/action",
            json={"action": "approve", "reviewer_notes": "Passed all quality standards."},
            headers=headers,
        )
        assert act_res.status_code == 200
        assert act_res.json()["status"] == "approved"

        # 4. Publish
        pub_res = await ac.post(
            f"/api/v1/admin/moderation/{art_id}/publish",
            json={"content_type": "article"},
            headers=headers,
        )
        assert pub_res.status_code == 200
        assert pub_res.json()["publication_status"] == "published"


@pytest.mark.asyncio
async def test_publish_unapproved_content_blocked():
    """Test server-side publish protection blocks unapproved content."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        fake_id = "00000000-0000-0000-0000-000000000000"
        res = await ac.post(
            f"/api/v1/admin/moderation/{fake_id}/publish",
            json={"content_type": "article"},
            headers=headers,
        )
        assert res.status_code == 400
        assert "Publishing denied" in str(res.json())


@pytest.mark.asyncio
async def test_student_moderation_access_forbidden():
    """Test non-admin student token receives HTTP 403 Forbidden."""
    student_token = create_access_token({"sub": "student-uuid-1234", "role": "student"})
    headers = {"Authorization": f"Bearer {student_token}"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/admin/moderation", headers=headers)
        assert res.status_code == 403
