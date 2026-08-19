import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_published_podcasts():
    """Test retrieving published podcast episodes returns 200 and paginated structure."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/podcasts?page=1&limit=5")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "total_pages" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) <= 5

    # Verify no draft podcast episodes are returned publicly
    for item in data["items"]:
        assert item["publication_status"] == "published"
        assert "audio_url" in item
        assert "duration_formatted" in item


@pytest.mark.asyncio
async def test_podcast_category_filtering():
    """Test filtering podcasts by category slug."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/podcasts?category=academic-stress")

    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["category_slug"] == "academic-stress"


@pytest.mark.asyncio
async def test_podcast_search_query():
    """Test searching podcasts by keyword."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/podcasts?search=anxiety")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("anxiety" in pod["title"].lower() for pod in data["items"])


@pytest.mark.asyncio
async def test_get_podcast_by_slug():
    """Test fetching single published podcast episode detail by slug."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/podcasts/navigating-midterm-anxiety-resetting-mindset")

    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "navigating-midterm-anxiety-resetting-mindset"
    assert "transcript" in data
    assert "audio_url" in data
    assert "related_podcasts" in data
    assert data["publication_status"] == "published"


@pytest.mark.asyncio
async def test_draft_podcast_isolation():
    """Test that requesting an unpublished draft podcast returns 404 Not Found."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/podcasts/draft-internal-audio-production-guidelines")

    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "PODCAST_NOT_FOUND"
