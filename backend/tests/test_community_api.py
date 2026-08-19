import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import create_access_token


async def get_admin_token(ac: AsyncClient) -> str:
    """Helper to log in as admin and return JWT access token for database user."""
    login_res = await ac.post(
        "/api/v1/auth/login",
        json={"email": "admin@mindcampus.edu", "password": "AdminPass123!"},
    )
    if login_res.status_code == 200:
        return login_res.json()["access_token"]
    return create_access_token({"sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "role": "admin"})


async def get_secondary_token() -> str:
    """Helper to return secondary user token for IDOR testing."""
    return create_access_token({"sub": "22222222-2222-2222-2222-222222222222", "role": "student"})


@pytest.mark.asyncio
async def test_get_and_create_comments_on_published_content():
    """Test creating and retrieving comments on published content."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Fetch published article
        art_res = await ac.get("/api/v1/articles")
        art_id = art_res.json()["items"][0]["id"]

        # 2. Create Comment
        c_res = await ac.post(
            f"/api/v1/community/content/{art_id}/comments",
            json={"content_type": "article", "body": "Great practical tips for managing exam stress!"},
            headers=headers,
        )
        assert c_res.status_code == 201
        data = c_res.json()
        assert "comment_id" in data
        assert data["status"] == "approved"

        # 3. Get Comments
        list_res = await ac.get(f"/api/v1/community/content/{art_id}/comments?type=article", headers=headers)
        assert list_res.status_code == 200
        comments = list_res.json()["items"]
        assert len(comments) > 0


@pytest.mark.asyncio
async def test_comment_on_draft_blocked():
    """Test commenting on non-existent or unpublished draft content is blocked."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        fake_id = "00000000-0000-0000-0000-000000000000"
        res = await ac.post(
            f"/api/v1/community/content/{fake_id}/comments",
            json={"content_type": "article", "body": "Attempting to comment on draft."},
            headers=headers,
        )
        assert res.status_code == 400
        assert "Commenting disabled" in res.json()["error"]["message"]


@pytest.mark.asyncio
async def test_reply_depth_and_helpful_toggle():
    """Test 2-level reply depth limit and helpful reaction toggle."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        art_res = await ac.get("/api/v1/articles")
        art_id = art_res.json()["items"][0]["id"]

        # 1. Parent Comment
        p_res = await ac.post(
            f"/api/v1/community/content/{art_id}/comments",
            json={"content_type": "article", "body": "Parent comment for threading test."},
            headers=headers,
        )
        p_id = p_res.json()["comment_id"]

        # 2. Helpful Toggle
        h_res = await ac.post(f"/api/v1/community/comments/{p_id}/helpful", headers=headers)
        assert h_res.status_code == 200
        assert h_res.json()["is_helpful"] is True

        # 3. Level 1 Reply
        r1_res = await ac.post(
            f"/api/v1/community/content/{art_id}/comments",
            json={"content_type": "article", "body": "Level 1 reply to parent.", "parent_comment_id": p_id},
            headers=headers,
        )
        assert r1_res.status_code == 201
        r1_id = r1_res.json()["comment_id"]

        # 4. Level 2 Reply Attempt (Should fail due to max 2-level depth limit)
        r2_res = await ac.post(
            f"/api/v1/community/content/{art_id}/comments",
            json={"content_type": "article", "body": "Level 2 reply attempt.", "parent_comment_id": r1_id},
            headers=headers,
        )
        assert r2_res.status_code == 400
        assert "Maximum reply depth" in r2_res.json()["error"]["message"]


@pytest.mark.asyncio
async def test_edit_and_delete_comment_ownership_idor_protection():
    """Test User A cannot edit or delete User B's comment (IDOR Protection)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token_a = await get_admin_token(ac)
        token_b = await get_secondary_token()
        headers_a = {"Authorization": f"Bearer {token_a}"}
        headers_b = {"Authorization": f"Bearer {token_b}"}

        art_res = await ac.get("/api/v1/articles")
        art_id = art_res.json()["items"][0]["id"]

        # 1. User A creates comment
        c_res = await ac.post(
            f"/api/v1/community/content/{art_id}/comments",
            json={"content_type": "article", "body": "User A original comment text."},
            headers=headers_a,
        )
        c_id = c_res.json()["comment_id"]

        # 2. User B attempts edit -> HTTP 401/403
        edit_res = await ac.patch(
            f"/api/v1/community/comments/{c_id}",
            json={"body": "User B attempting unauthorized edit."},
            headers=headers_b,
        )
        assert edit_res.status_code in [401, 403]

        # 3. User B attempts delete -> HTTP 401/403
        del_res = await ac.delete(f"/api/v1/community/comments/{c_id}", headers=headers_b)
        assert del_res.status_code in [401, 403]

        # 4. User A deletes own comment -> Success
        own_del_res = await ac.delete(f"/api/v1/community/comments/{c_id}", headers=headers_a)
        assert own_del_res.status_code == 200


@pytest.mark.asyncio
async def test_submit_community_report_and_admin_queue():
    """Test submitting community report and moderator review queue."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        admin_token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {admin_token}"}

        # 1. Student submits report
        rep_res = await ac.post(
            "/api/v1/community/reports",
            json={
                "target_type": "content",
                "target_id": "art-test-id-1234",
                "content_type": "article",
                "reason": "inappropriate",
                "description": "Contains inaccurate study information.",
            },
            headers=headers,
        )
        assert rep_res.status_code == 201
        report_id = rep_res.json()["report_id"]

        # 2. Admin fetches report queue
        q_res = await ac.get("/api/v1/admin/community/reports", headers=headers)
        assert q_res.status_code == 200
        reports = q_res.json()["items"]
        assert len(reports) > 0

        # 3. Admin resolves report
        act_res = await ac.post(
            f"/api/v1/admin/community/reports/{report_id}/action",
            json={"action": "resolve"},
            headers=headers,
        )
        assert act_res.status_code == 200
        assert act_res.json()["status"] == "resolved"
