from datetime import datetime, timezone

from fastapi import HTTPException

from app.core.database import db


async def create_alert(payload):
    return await db.alert.create(
        data={
            "type": payload.type,
            "severity": payload.severity,
            "title": payload.title,
            "message": payload.message,
            "relatedCameraId": payload.related_camera_id,
            "relatedStudentId": payload.related_student_id,
            "assignedToUserId": payload.assigned_to_user_id,
            "metadata": payload.metadata,
            "status": "OPEN",
        }
    )


async def list_alerts(
    status: str | None = None,
    severity: str | None = None,
    type: str | None = None,
):
    where = {}

    if status:
        where["status"] = status

    if severity:
        where["severity"] = severity

    if type:
        where["type"] = type

    return await db.alert.find_many(
        where=where,
        order={"createdAt": "desc"},
        include={
            "relatedCamera": True,
            "relatedStudent": True,
            "assignedTo": True,
            "resolvedBy": True,
            "evidence": True,
        },
    )


async def update_alert(alert_id: str, payload, current_user_id: str):
    alert = await db.alert.find_unique(where={"id": alert_id})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    data = {}

    if payload.status is not None:
        data["status"] = payload.status

        if payload.status in ["RESOLVED", "DISMISSED"]:
            data["resolvedByUserId"] = payload.resolved_by_user_id or current_user_id
            data["resolvedAt"] = datetime.now(timezone.utc)

    if payload.assigned_to_user_id is not None:
        data["assignedToUserId"] = payload.assigned_to_user_id

    if payload.metadata is not None:
        data["metadata"] = payload.metadata

    return await db.alert.update(
        where={"id": alert_id},
        data=data,
    )


async def get_alert(alert_id: str):
    alert = await db.alert.find_unique(
        where={"id": alert_id},
        include={
            "relatedCamera": True,
            "relatedStudent": True,
            "assignedTo": True,
            "resolvedBy": True,
            "evidence": True,
        },
    )

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    return alert