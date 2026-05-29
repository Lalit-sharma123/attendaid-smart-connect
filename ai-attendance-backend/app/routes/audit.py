from fastapi import APIRouter, Depends, Query

from app.core.database import db
from app.dependencies.auth import admin_required

router = APIRouter()


@router.get("/audit-logs")
async def get_audit_logs(
    action: str | None = None,
    entity_type: str | None = None,
    severity: str | None = None,
    skip: int = Query(0, ge=0),
    take: int = Query(50, ge=1, le=200),
    current_user=Depends(admin_required),
):
    where = {}

    if action:
        where["action"] = {"contains": action, "mode": "insensitive"}

    if entity_type:
        where["entityType"] = entity_type

    if severity:
        where["severity"] = severity

    logs = await db.auditlog.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"createdAt": "desc"},
        include={"actor": True},
    )

    total = await db.auditlog.count(where=where)

    return {
        "items": logs,
        "total": total,
        "skip": skip,
        "take": take,
    }