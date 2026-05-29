from fastapi import APIRouter, Depends, Query

from app.dependencies.auth import admin_required
from app.schemas.camera_schema import (
    CameraCreate,
    CameraUpdate,
    CameraHeartbeatCreate,
    RecognitionEventCreate,
)
from app.services.camera_service import (
    create_camera,
    list_cameras,
    get_camera,
    update_camera,
    delete_camera,
    create_camera_heartbeat,
    list_camera_heartbeats,
    create_recognition_event,
    list_recognition_events,
    list_unknown_faces,
    list_spoof_attempts,
)

router = APIRouter()


@router.post("")
async def add_camera(payload: CameraCreate, current_user=Depends(admin_required)):
    return await create_camera(payload)


@router.get("")
async def get_cameras(
    status: str | None = None,
    enabled: bool | None = None,
    current_user=Depends(admin_required),
):
    return await list_cameras(status=status, enabled=enabled)


@router.get("/{camera_id}")
async def get_one_camera(camera_id: str, current_user=Depends(admin_required)):
    return await get_camera(camera_id)


@router.patch("/{camera_id}")
async def edit_camera(
    camera_id: str,
    payload: CameraUpdate,
    current_user=Depends(admin_required),
):
    return await update_camera(camera_id, payload)


@router.delete("/{camera_id}")
async def remove_camera(camera_id: str, current_user=Depends(admin_required)):
    return await delete_camera(camera_id)


@router.post("/{camera_id}/heartbeat")
async def add_heartbeat(
    camera_id: str,
    payload: CameraHeartbeatCreate,
    current_user=Depends(admin_required),
):
    return await create_camera_heartbeat(camera_id, payload)


@router.get("/{camera_id}/heartbeats")
async def get_heartbeats(camera_id: str, current_user=Depends(admin_required)):
    return await list_camera_heartbeats(camera_id)


@router.post("/recognition-events")
async def add_recognition_event(
    payload: RecognitionEventCreate,
    current_user=Depends(admin_required),
):
    return await create_recognition_event(payload)


@router.get("/recognition-events/list")
async def get_recognition_events(
    camera_id: str | None = None,
    student_id: str | None = None,
    event_type: str | None = None,
    take: int = Query(50, ge=1, le=200),
    current_user=Depends(admin_required),
):
    return await list_recognition_events(
        camera_id=camera_id,
        student_id=student_id,
        event_type=event_type,
        take=take,
    )


@router.get("/unknown-faces/list")
async def get_unknown_faces(current_user=Depends(admin_required)):
    return await list_unknown_faces()


@router.get("/spoof-attempts/list")
async def get_spoof_attempts(current_user=Depends(admin_required)):
    return await list_spoof_attempts()