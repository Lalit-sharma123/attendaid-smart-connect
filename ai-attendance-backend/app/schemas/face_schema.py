from pydantic import BaseModel


class FaceMockResult(BaseModel):
    face_detected: bool
    quality_score: float
    blur_score: float
    lighting_score: float
    angle_score: float
    liveness_verified: bool
    embedding: list[float]
    feedback_message: str