from datetime import date
from pydantic import BaseModel


class AttendanceSessionCreate(BaseModel):
    name: str
    department_id: str | None = None
    class_id: str | None = None
    section_id: str | None = None
    start_time: str
    end_time: str
    late_after_time: str
    duplicate_prevention_minutes: int = 30
    active: bool = True


class MarkAttendanceRequest(BaseModel):
    session_id: str | None = None


class ManualCorrectionRequest(BaseModel):
    status: str
    reason: str


class AttendanceFilter(BaseModel):
    start_date: date | None = None
    end_date: date | None = None
    student_id: str | None = None
    department_id: str | None = None
    class_id: str | None = None
    section_id: str | None = None
    status: str | None = None