from fastapi import APIRouter, Depends

from app.core.database import db
from app.dependencies.auth import admin_required
from app.schemas.system_health_schema import SystemHealthCreate

router = APIRouter()


@router.post("")
async def create_health_log(
    payload: SystemHealthCreate,
    current_user=Depends(admin_required),
):
    return await db.systemhealthlog.create(
        data={
            "serviceName": payload.service_name,
            "status": payload.status,
            "cpuUsage": payload.cpu_usage,
            "gpuUsage": payload.gpu_usage,
            "ramUsage": payload.ram_usage,
            "diskUsage": payload.disk_usage,
            "latencyMs": payload.latency_ms,
            "queueSize": payload.queue_size,
            "errorRate": payload.error_rate,
            "uptime": payload.uptime,
            "logs": payload.logs,
            "metadata": payload.metadata,
        }
    )


@router.get("")
async def list_health_logs(
    service_name: str | None = None,
    status: str | None = None,
    current_user=Depends(admin_required),
):
    where = {}

    if service_name:
        where["serviceName"] = service_name

    if status:
        where["status"] = status

    return await db.systemhealthlog.find_many(
        where=where,
        order={"createdAt": "desc"},
        take=200,
    )


@router.get("/summary")
async def health_summary(current_user=Depends(admin_required)):
    latest = await db.systemhealthlog.find_many(
        order={"createdAt": "desc"},
        take=50,
    )

    services = {}

    for item in latest:
        if item.serviceName not in services:
            services[item.serviceName] = {
                "service_name": item.serviceName,
                "status": item.status,
                "cpu_usage": item.cpuUsage,
                "gpu_usage": item.gpuUsage,
                "ram_usage": item.ramUsage,
                "disk_usage": item.diskUsage,
                "latency_ms": item.latencyMs,
                "error_rate": item.errorRate,
                "created_at": item.createdAt,
            }

    return list(services.values())