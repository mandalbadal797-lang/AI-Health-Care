import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check_endpoint(async_client: AsyncClient):
    """Test GET /api/v1/health returns success and health data."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200

    payload = response.json()
    assert payload["success"] is True
    assert "data" in payload
    assert payload["data"]["app_name"] == "MindCampus API"
    assert payload["data"]["status"] in ["ok", "degraded"]
    assert "database_connected" in payload["data"]


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    """Test GET / returns root system status."""
    response = await async_client.get("/")
    assert response.status_code == 200

    payload = response.json()
    assert payload["name"] == "MindCampus API"
    assert payload["status"] == "online"
    assert payload["health_check"] == "/api/v1/health"
