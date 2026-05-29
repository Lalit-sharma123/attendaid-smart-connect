from pydantic import BaseModel


class SystemHealthCreate(BaseModel):
    service_name: str
    status: str
    cpu_usage: float | None = None
    gpu_usage: float | None = None
    ram_usage: float | None = None
    disk_usage: float | None = None
    latency_ms: int | None = None
    queue_size: int | None = None
    error_rate: float | None = None
    uptime: float | None = None
    logs: str | None = None
    metadata: dict | None = None