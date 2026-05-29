from fastapi import APIRouter, Depends

from app.dependencies.auth import admin_required
from app.schemas.alert_schema import AlertCreate, AlertUpdate
from app.services.alert_service import (
    create_alert,
    list_alerts,
    get_alert,
    update_alert,
)

router = APIRouter()


@router.post("")
async def add_alert(payload: AlertCreate, current_user=Depends(admin_required)):
    return await create_alert(payload)


@router.get("")
async def get_alerts(
    status: str | None = None,
    severity: str | None = None,
    type: str | None = None,
    current_user=Depends(admin_required),
):
    return await list_alerts(status=status, severity=severity, type=type)


@router.get("/admins")
async def list_alert_admins(current_user=Depends(admin_required)):
    from app.core.database import db

    users = await db.user.find_many(
        where={"status": "ACTIVE"},
        include={"role": True},
        order={"email": "asc"},
    )

    admins = []
    for user in users:
        role_name = str(user.role.name) if user.role else ""
        if role_name.upper() == "ADMIN":
            admins.append(
                {
                    "id": user.id,
                    "email": user.email,
                    "phone": user.phone,
                    "role": role_name,
                }
            )

    return admins


@router.get("/{alert_id}")
async def get_one_alert(alert_id: str, current_user=Depends(admin_required)):
    return await get_alert(alert_id)


@router.patch("/{alert_id}")
async def edit_alert(
    alert_id: str,
    payload: AlertUpdate,
    current_user=Depends(admin_required),
):
    return await update_alert(alert_id, payload, current_user.id)