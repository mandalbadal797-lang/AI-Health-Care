import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_list_published_articles():
    """Test retrieving published articles returns 200 and paginated structure."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/articles?page=1&limit=5")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "total_pages" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) <= 5

    # Verify no draft articles are returned publicly
    for item in data["items"]:
        assert item["publication_status"] == "published"


@pytest.mark.asyncio
async def test_article_category_filtering():
    """Test filtering articles by category slug."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/articles?category=exam-pressure")

    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["category_slug"] == "exam-pressure"


@pytest.mark.asyncio
async def test_article_search_query():
    """Test searching articles by keyword."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/articles?search=calm")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("calm" in art["title"].lower() for art in data["items"])


@pytest.mark.asyncio
async def test_get_article_by_slug():
    """Test fetching single published article detail by slug."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/articles/how-to-stay-calm-during-exam-week")

    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "how-to-stay-calm-during-exam-week"
    assert "content" in data
    assert "category" in data
    assert "related_articles" in data
    assert data["publication_status"] == "published"


@pytest.mark.asyncio
async def test_draft_article_isolation():
    """Test that requesting an unpublished draft article returns 404 Not Found."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/articles/draft-internal-editor-notes")

    assert response.status_code == 404
    data = response.json()
    assert data["error"]["code"] == "ARTICLE_NOT_FOUND"


@pytest.mark.asyncio
async def test_list_categories():
    """Test listing all categories."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/categories")

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 1
    assert "article_count" in data["items"][0]
