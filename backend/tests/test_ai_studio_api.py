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
async def test_generate_content_draft():
    """Test generating a Blog, Podcast, or Story draft."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "content_type": "article",
            "topic": "Managing Exam Stress",
            "audience": "College Students",
            "tone": "Supportive",
            "length": "medium",
        }
        res = await ac.post("/api/v1/admin/ai/content/generate", json=payload, headers=headers)
        assert res.status_code == 201
        data = res.json()
        assert "generation_id" in data
        assert data["content_type"] == "article"
        assert "output" in data
        assert "title" in data["output"]
        assert data["safety_status"] == "pass"


@pytest.mark.asyncio
async def test_improve_content():
    """Test side-by-side content improvement generation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "text": "Students experience cognitive fatigue when confronting insurmountable assignments.",
            "operation": "simplify",
            "content_type": "article",
        }
        res = await ac.post("/api/v1/admin/ai/content/improve", json=payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "generation_id" in data
        assert "output" in data
        assert "improved_text" in data["output"]


@pytest.mark.asyncio
async def test_analyze_content():
    """Test analyzing readability index, word count, and safety flags."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        payload = {
            "text": "This guide provides practical strategies for managing study routines and exam preparation.",
            "content_type": "article",
        }
        res = await ac.post("/api/v1/admin/ai/content/analyze", json=payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "word_count" in data
        assert "estimated_reading_time_minutes" in data
        assert "readability_label" in data
        assert "safety_status" in data


@pytest.mark.asyncio
async def test_generate_content_ideas():
    """Test generating analytics-informed content opportunity ideas."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        payload = {"category_id": 1, "content_type": "all", "include_analytics": True}
        res = await ac.post("/api/v1/admin/ai/content/ideas", json=payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "ideas" in data
        assert isinstance(data["ideas"], list)
        assert len(data["ideas"]) > 0


@pytest.mark.asyncio
async def test_send_draft_to_cms():
    """Test converting approved AI generation into official CMS draft."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        token = await get_admin_token(ac)
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Generate
        gen_res = await ac.post(
            "/api/v1/admin/ai/content/generate",
            json={"content_type": "article", "topic": "Focus Micro-Habits"},
            headers=headers,
        )
        gen_id = gen_res.json()["generation_id"]

        # 2. Send to CMS
        res = await ac.post(f"/api/v1/admin/ai/history/{gen_id}/send-to-cms", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "cms_id" in data
        assert data["publication_status"] == "draft"


@pytest.mark.asyncio
async def test_student_ai_studio_access_forbidden():
    """Test non-admin student token receives HTTP 403 Forbidden."""
    student_token = create_access_token({"sub": "student-uuid-1234", "role": "student"})
    headers = {"Authorization": f"Bearer {student_token}"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/api/v1/admin/ai/history", headers=headers)
        assert res.status_code == 403
