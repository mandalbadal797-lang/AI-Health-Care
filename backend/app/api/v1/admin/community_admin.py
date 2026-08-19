import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_admin
from app.models.user import User
from app.services.community_service import CommunityService

router = APIRouter(prefix="/admin/community", tags=["Admin Community Moderation"])


class ReportActionRequest(BaseModel):
    action: str = Field(..., description="resolve, dismiss")


@router.get("/reports")
async def get_admin_community_reports(
    status: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve paginated community reports for moderation review."""
    res = await CommunityService.get_admin_community_reports(db=db, status=status, page=page, limit=limit)
    return res


@router.post("/reports/{report_id}/action")
async def execute_report_action(
    report_id: uuid.UUID,
    req: ReportActionRequest,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Execute decision on a community report (resolve, dismiss)."""
    try:
        report = await CommunityService.execute_admin_report_action(
            db=db, admin_id=current_user.id, report_id=report_id, action=req.action
        )
        return {
            "message": f"Report action '{req.action}' recorded successfully.",
            "report_id": str(report.id),
            "status": report.status,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
