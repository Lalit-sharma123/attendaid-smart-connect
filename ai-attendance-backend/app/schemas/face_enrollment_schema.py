from pydantic import BaseModel
from typing import Optional


class FaceTaskCaptureRequest(BaseModel):
    student_id: str
    task: str
    image_base64: str


class SaveFaceEnrollmentRequest(BaseModel):
    student_id: str
    embedding: list[float]
    face_quality: Optional[float] = None
    liveness_score: Optional[float] = None


class FaceAttendanceMarkRequest(BaseModel):
    student_id: str
    image_base64: Optional[str] = None
    camera_id: Optional[str] = None
    session_id: Optional[str] = None
    recognition_confidence: Optional[float] = None
    liveness_score: Optional[float] = None
