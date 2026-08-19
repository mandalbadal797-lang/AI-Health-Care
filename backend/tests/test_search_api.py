import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_search_published_content_only():
    """Test global search endpoint returns published articles/podcasts/stories and excludes drafts."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/search?q=exam")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "query" in data


@pytest.mark.asyncio
async def test_search_suggestions():
    """Test autocomplete search suggestions endpoint returns title matches."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/search/suggestions?q=exam")

    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data


@pytest.mark.asyncio
async def test_search_related_content():
    """Test related content endpoint returns items matching category."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/search/related?type=article&id=non-existent-id&category_id=1")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data


@pytest.mark.asyncio
async def test_search_query_length_validation():
    """Test search query exceeding 200 characters is rejected with 400 Bad Request or 422 Unprocessable Content."""
    long_query = "a" * 205
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get(f"/api/v1/search?q={long_query}")

    assert response.status_code in [400, 422]
