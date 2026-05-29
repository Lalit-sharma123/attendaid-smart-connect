from pydantic import BaseModel


class CameraCreate(BaseModel):
    name: str
    location: str
    rtsp_url_encrypted: str | None = None
    masked_rtsp_url: str | None = None
    assigned_class_id: str | None = None
    assigned_section_id: str | None = None
    model_profile_id: str | None = None
    enabled: bool = True


class CameraUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    rtsp_url_encrypted: str | None = None
    masked_rtsp_url: str | None = None
    status: str | None = None
    fps: float | None = None
    latency_ms: int | None = None
    assigned_class_id: str | None = None
    assigned_section_id: str | None = None
    model_profile_id: str | None = None
    health_score: float | None = None
    enabled: bool | None = None


class CameraHeartbeatCreate(BaseModel):
    status: str
    fps: float | None = None
    latency_ms: int | None = None
    cpu_usage: float | None = None
    gpu_usage: float | None = None
    ram_usage: float | None = None
    metadata: dict | None = None


class RecognitionEventCreate(BaseModel):
    camera_id: str | None = None
    student_id: str | None = None
    tracking_id: str | None = None
    event_type: str
    recognition_confidence: float | None = None
    liveness_score: float | None = None
    spoof_score: float | None = None
    anti_spoof_status: str = "NOT_CHECKED"
    attendance_status: str | None = None
    snapshot_url: str | None = None
    model_latency_ms: int | None = None
    model_name: str | None = None
    model_version: str | None = None
    metadata: dict | None = None


class UnknownFaceCreate(BaseModel):
    camera_id: str | None = None
    snapshot_url: str | None = None
    cluster_id: str | None = None
    confidence: float | None = None
    metadata: dict | None = None


class SpoofAttemptCreate(BaseModel):
    camera_id: str | None = None
    student_id: str | None = None
    event_id: str | None = None
    spoof_type: str = "UNKNOWN"
    liveness_score: float | None = None
    spoof_score: float | None = None
    snapshot_url: str | None = None
    severity: str = "HIGH"
    metadata: dict | None = None