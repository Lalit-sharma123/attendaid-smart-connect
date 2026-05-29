from datetime import datetime, timezone

from fastapi import HTTPException

from app.core.database import db


async def create_camera(payload):
    return await db.camera.create(
        data={
            "name": payload.name,
            "location": payload.location,
            "rtspUrlEncrypted": payload.rtsp_url_encrypted,
            "maskedRtspUrl": payload.masked_rtsp_url,
            "assignedClassId": payload.assigned_class_id,
            "assignedSectionId": payload.assigned_section_id,
            "modelProfileId": payload.model_profile_id,
            "enabled": payload.enabled,
            "status": "OFFLINE",
        }
    )


async def list_cameras(status: str | None = None, enabled: bool | None = None):
    where = {}

    if status:
        where["status"] = status

    if enabled is not None:
        where["enabled"] = enabled

    return await db.camera.find_many(
        where=where,
        order={"createdAt": "desc"},
        include={
            "assignedClass": True,
            "assignedSection": True,
            "heartbeats": {
                "take": 5,
                "orderBy": {
                    "createdAt": "desc"
                }
            },
        },
    )


async def get_camera(camera_id: str):
    camera = await db.camera.find_unique(
        where={"id": camera_id},
        include={
            "assignedClass": True,
            "assignedSection": True,
            "heartbeats": {
                "take": 20,
                "orderBy": {
                    "createdAt": "desc"
                }
            },
            "recognitionEvents": {
                "take": 20,
                "orderBy": {
                    "createdAt": "desc"
                }
            },
            "alerts": {
                "take": 20,
                "orderBy": {
                    "createdAt": "desc"
                }
            },
        },
    )

    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    return camera


async def update_camera(camera_id: str, payload):
    camera = await db.camera.find_unique(where={"id": camera_id})
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    data = {}

    mapping = {
        "name": "name",
        "location": "location",
        "rtsp_url_encrypted": "rtspUrlEncrypted",
        "masked_rtsp_url": "maskedRtspUrl",
        "status": "status",
        "fps": "fps",
        "latency_ms": "latencyMs",
        "assigned_class_id": "assignedClassId",
        "assigned_section_id": "assignedSectionId",
        "model_profile_id": "modelProfileId",
        "health_score": "healthScore",
        "enabled": "enabled",
    }

    for input_key, db_key in mapping.items():
        value = getattr(payload, input_key)
        if value is not None:
            data[db_key] = value

    return await db.camera.update(
        where={"id": camera_id},
        data=data,
    )


async def delete_camera(camera_id: str):
    camera = await db.camera.find_unique(where={"id": camera_id})
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    await db.camera.update(
        where={"id": camera_id},
        data={
            "enabled": False,
            "status": "OFFLINE",
        },
    )

    return {"message": "Camera disabled"}


async def create_camera_heartbeat(camera_id: str, payload):
    camera = await db.camera.find_unique(where={"id": camera_id})
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    heartbeat = await db.cameraheartbeat.create(
        data={
            "cameraId": camera_id,
            "status": payload.status,
            "fps": payload.fps,
            "latencyMs": payload.latency_ms,
            "cpuUsage": payload.cpu_usage,
            "gpuUsage": payload.gpu_usage,
            "ramUsage": payload.ram_usage,
            "metadata": payload.metadata,
        }
    )

    health_score = 100.0

    if payload.status != "ONLINE":
        health_score -= 50

    if payload.latency_ms and payload.latency_ms > 1000:
        health_score -= 20

    if payload.fps and payload.fps < 10:
        health_score -= 20

    health_score = max(0, health_score)

    await db.camera.update(
        where={"id": camera_id},
        data={
            "status": payload.status,
            "fps": payload.fps,
            "latencyMs": payload.latency_ms,
            "healthScore": health_score,
            "lastHeartbeatAt": datetime.now(timezone.utc),
        },
    )

    if payload.status in ["OFFLINE", "ERROR", "DEGRADED"]:
        await db.alert.create(
            data={
                "type": "CAMERA_OFFLINE" if payload.status == "OFFLINE" else "CAMERA_DEGRADED",
                "severity": "HIGH" if payload.status in ["OFFLINE", "ERROR"] else "MEDIUM",
                "title": f"Camera {payload.status}",
                "message": f"Camera {camera.name} is {payload.status}",
                "relatedCameraId": camera_id,
                "status": "OPEN",
                "metadata": {
                    "heartbeat_id": heartbeat.id
                },
            }
        )

    return heartbeat


async def list_camera_heartbeats(camera_id: str):
    return await db.cameraheartbeat.find_many(
        where={"cameraId": camera_id},
        order={"createdAt": "desc"},
        take=100,
    )


async def create_recognition_event(payload):
    event = await db.recognitionevent.create(
        data={
            "cameraId": payload.camera_id,
            "studentId": payload.student_id,
            "trackingId": payload.tracking_id,
            "eventType": payload.event_type,
            "recognitionConfidence": payload.recognition_confidence,
            "livenessScore": payload.liveness_score,
            "spoofScore": payload.spoof_score,
            "antiSpoofStatus": payload.anti_spoof_status,
            "attendanceStatus": payload.attendance_status,
            "snapshotUrl": payload.snapshot_url,
            "modelLatencyMs": payload.model_latency_ms,
            "modelName": payload.model_name,
            "modelVersion": payload.model_version,
            "metadata": payload.metadata,
        },
        include={
            "camera": True,
            "student": True,
        },
    )

    if payload.event_type == "UNKNOWN_FACE":
        await db.unknownface.create(
            data={
                "cameraId": payload.camera_id,
                "snapshotUrl": payload.snapshot_url,
                "confidence": payload.recognition_confidence,
                "firstSeenAt": datetime.now(timezone.utc),
                "lastSeenAt": datetime.now(timezone.utc),
                "metadata": payload.metadata,
            }
        )

        await db.alert.create(
            data={
                "type": "UNKNOWN_FACE",
                "severity": "MEDIUM",
                "title": "Unknown face detected",
                "message": "Unknown face detected by camera",
                "relatedCameraId": payload.camera_id,
                "status": "OPEN",
                "metadata": {
                    "event_id": event.id
                },
            }
        )

    if payload.event_type in ["SPOOF_ATTEMPT", "LIVENESS_FAILED"]:
        spoof = await db.spoofattempt.create(
            data={
                "cameraId": payload.camera_id,
                "studentId": payload.student_id,
                "eventId": event.id,
                "spoofType": "UNKNOWN",
                "livenessScore": payload.liveness_score,
                "spoofScore": payload.spoof_score,
                "snapshotUrl": payload.snapshot_url,
                "severity": "HIGH",
                "metadata": payload.metadata,
            }
        )

        await db.alert.create(
            data={
                "type": "SPOOF_ATTEMPT",
                "severity": "HIGH",
                "title": "Spoof attempt detected",
                "message": "Possible spoof/liveness failure detected",
                "relatedCameraId": payload.camera_id,
                "relatedStudentId": payload.student_id,
                "status": "OPEN",
                "metadata": {
                    "event_id": event.id,
                    "spoof_id": spoof.id,
                },
            }
        )

    return event


async def list_recognition_events(
    camera_id: str | None = None,
    student_id: str | None = None,
    event_type: str | None = None,
    take: int = 50,
):
    where = {}

    if camera_id:
        where["cameraId"] = camera_id

    if student_id:
        where["studentId"] = student_id

    if event_type:
        where["eventType"] = event_type

    return await db.recognitionevent.find_many(
        where=where,
        take=take,
        order={"createdAt": "desc"},
        include={
            "camera": True,
            "student": True,
        },
    )


async def list_unknown_faces():
    return await db.unknownface.find_many(
        order={"lastSeenAt": "desc"},
        take=100,
        include={"camera": True},
    )


async def list_spoof_attempts():
    return await db.spoofattempt.find_many(
        order={"createdAt": "desc"},
        take=100,
        include={
            "camera": True,
            "student": True,
            "event": True,
        },
    )