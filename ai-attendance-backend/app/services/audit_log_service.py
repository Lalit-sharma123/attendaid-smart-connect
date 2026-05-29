from app.core.database import db


async def create_audit_log(
    *,
    actor_user_id: str | None = None,
    action: str,
    entity_type: str,
    entity_id: str | None = None,
    detail: str | None = None,
    severity: str = "INFO",
    metadata: dict | None = None,
    old_value=None,
    new_value=None,
    ip_address: str | None = None,
    user_agent: str | None = None,
):
    merged_metadata = dict(metadata or {})

    if detail:
        merged_metadata["detail"] = detail

    data = {
        "action": action,
        "entityType": entity_type,
        "entityId": entity_id,
        "severity": severity,
        "metadata": merged_metadata if merged_metadata else None,
        "oldValue": old_value,
        "newValue": new_value,
        "ipAddress": ip_address,
        "userAgent": user_agent,
    }

    if actor_user_id:
        data["actorUserId"] = actor_user_id

    return await db.auditlog.create(data=data)
