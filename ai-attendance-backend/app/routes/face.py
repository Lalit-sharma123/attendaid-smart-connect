from fastapi import APIRouter, Depends, UploadFile, File

from app.dependencies.auth import admin_required
from app.services.face_service import upload_face_sample, get_face_enrollment

router = APIRouter()


@router.post("/students/{student_id}/samples")
async def add_face_sample(
    student_id: str,
    file: UploadFile = File(...),
    current_user=Depends(admin_required),
):
    return await upload_face_sample(student_id, file, current_user.id)


@router.get("/students/{student_id}/enrollment")
async def get_enrollment(student_id: str, current_user=Depends(admin_required)):
    return await get_face_enrollment(student_id)