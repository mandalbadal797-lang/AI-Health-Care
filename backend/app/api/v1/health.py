from fastapi import APIRouter
from app.core.config import settings
from app.core.database import check_database_connection
from app.schemas.health import HealthResponse, HealthData

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """Verify operational health status of backend server and database connection."""
    db_ok = await check_database_connection()
    return HealthResponse(
        success=True,
        data=HealthData(
            status="ok" if db_ok else "degraded",
            app_name=settings.APP_NAME,
            environment=settings.APP_ENV,
            version="1.0.0",
            database_connected=db_ok,
        ),
        meta={}
    )
