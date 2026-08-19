import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_published_stories():
    """Test retrieving published digital stories returns 200 and paginated structure."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories?page=1&limit=5")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "total_pages" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) <= 5

    # Verify no draft stories are returned publicly
    for item in data["items"]:
        assert item["publication_status"] == "published"
        assert "subtitle" in item
        assert "reading_time_minutes" in item


@pytest.mark.asyncio
async def test_story_category_filtering():
    """Test filtering digital stories by category slug."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories?category=failure-resilience")

    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["category_slug"] == "failure-resilience"


@pytest.mark.asyncio
async def test_story_search_query():
    """Test searching digital stories by keyword."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories?search=midterm")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("midterm" in st["title"].lower() or "midterm" in st["subtitle"].lower() for st in data["items"])


@pytest.mark.asyncio
async def test_get_story_by_slug():
    """Test fetching single published digital story detail by slug."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories/failed-first-midterm-found-my-voice")

    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "failed-first-midterm-found-my-voice"
    assert "content" in data
    assert "reflection_question" in data
    assert "key_takeaway" in data
    assert "related_stories" in data
    assert data["publication_status"] == "published"


@pytest.mark.asyncio
async def test_draft_story_isolation():
    """Test that requesting an unpublished draft story returns 404 Not Found."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/stories/draft-internal-story-editorial-review-notes")

    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "STORY_NOT_FOUND"
