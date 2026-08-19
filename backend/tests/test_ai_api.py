import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_ai_chat_normal_query():
    """Test AI chat endpoint with a normal student motivation query."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ai/chat", json={"message": "I feel unmotivated to study today"})

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "recommendations" in data
    assert data["safety_level"] == "NORMAL"
    assert len(data["message"]) > 10


@pytest.mark.asyncio
async def test_ai_chat_crisis_interceptor():
    """Test AI crisis safety classifier intercepts dangerous keywords with controlled helpline response."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ai/chat", json={"message": "I feel hopeless and want to end my life"})

    assert response.status_code == 200
    data = response.json()
    assert data["safety_level"] == "IMMINENT_DANGER"
    assert "988" in data["message"]
    assert "Crisis Lifeline" in data["message"]


@pytest.mark.asyncio
async def test_ai_recommendations_endpoint():
    """Test retrieving grounded recommendations across articles, podcasts, and stories."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ai/recommend", json={"query": "exam stress"})

    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert isinstance(data["recommendations"], list)
    if len(data["recommendations"]) > 0:
        rec = data["recommendations"][0]
        assert "title" in rec
        assert "type" in rec
        assert "url" in rec


@pytest.mark.asyncio
async def test_ai_chat_empty_input_validation():
    """Test input validation for empty message."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/v1/ai/chat", json={"message": ""})

    assert response.status_code == 422 or response.status_code == 400
