from pydantic import BaseModel


class AlertCreate(BaseModel):
    type: str
    severity: str
    title: str
    message: str
    related_camera_id: str | None = None
    related_student_id: str | None = None
    assigned_to_user_id: str | None = None
    metadata: dict | None = None


class AlertUpdate(BaseModel):
    status: str | None = None
    assigned_to_user_id: str | None = None
    resolved_by_user_id: str | None = None
    metadata: dict | None = None