from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter(prefix="/admin/audit-logs", tags=["Admin Audit Logs"])


@router.get("")
async def list_audit_logs(
    page: int = 1,
    limit: int = 20,
    action_filter: Optional[str] = None,
    content_type_filter: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List administrative audit logs with pagination and filtering."""
    stmt = select(AuditLog)
    count_stmt = select(func.count(AuditLog.id))

    if action_filter and action_filter.strip():
        stmt = stmt.where(AuditLog.action == action_filter.strip())
        count_stmt = count_stmt.where(AuditLog.action == action_filter.strip())

    if content_type_filter and content_type_filter.strip():
        stmt = stmt.where(AuditLog.content_type == content_type_filter.strip())
        count_stmt = count_stmt.where(AuditLog.content_type == content_type_filter.strip())

    total_res = await db.execute(count_stmt)
    total = total_res.scalar() or 0

    skip = (page - 1) * limit
    stmt = stmt.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    items = []
    for log in logs:
        user_stmt = select(User).where(User.id == log.user_id)
        user_res = await db.execute(user_stmt)
        u = user_res.scalar_one_or_none()

        items.append({
            "id": str(log.id),
            "admin_name": u.full_name if u else "Platform System",
            "admin_email": u.email if u else "system@mindcampus.edu",
            "action": log.action,
            "content_type": log.content_type,
            "content_id": log.content_id,
            "details": log.details,
            "created_at": log.created_at.isoformat(),
        })

    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1,
    }
