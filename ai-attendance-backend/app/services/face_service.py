import random
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.core.config import get_settings
from app.core.database import db

settings = get_settings()


async def mock_face_ai_process(file_path: str) -> dict:
    quality = round(random.uniform(0.72, 0.98), 2)
    liveness = quality >= 0.75

    return {
        "face_detected": True,
        "quality_score": quality,
        "blur_score": round(random.uniform(0.70, 0.98), 2),
        "lighting_score": round(random.uniform(0.70, 0.98), 2),
        "angle_score": round(random.uniform(0.70, 0.98), 2),
        "liveness_verified": liveness,
        "embedding": [round(random.uniform(-1, 1), 6) for _ in range(128)],
        "feedback_message": "Face sample accepted" if liveness else "Poor quality sample",
    }


async def upload_face_sample(student_id: str, file: UploadFile, admin_user_id: str | None = None):
    student = await db.student.find_unique(
        where={"id": student_id},
        include={"faceEnrollment": True},
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    enrollment = student.faceEnrollment

    if not enrollment:
        enrollment = await db.faceenrollment.create(
            data={
                "studentId": student_id,
                "status": "IN_PROGRESS",
            }
        )
    else:
        await db.faceenrollment.update(
            where={"id": enrollment.id},
            data={"status": "IN_PROGRESS"},
        )

    upload_dir = Path(settings.UPLOAD_DIR) / "face_samples"
    upload_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "sample.jpg").suffix or ".jpg"
    filename = f"{student_id}_{uuid4().hex}{extension}"
    file_path = upload_dir / filename

    content = await file.read()
    file_path.write_bytes(content)

    image_url = f"/{file_path.as_posix()}"

    ai_result = await mock_face_ai_process(str(file_path))

    sample = await db.facesample.create(
        data={
            "enrollmentId": enrollment.id,
            "imageUrl": image_url,
            "qualityScore": ai_result["quality_score"],
            "blurScore": ai_result["blur_score"],
            "lightingScore": ai_result["lighting_score"],
            "angleScore": ai_result["angle_score"],
            "faceDetected": ai_result["face_detected"],
            "feedbackMessage": ai_result["feedback_message"],
            "metadata": {
                "original_filename": file.filename,
                "content_type": file.content_type,
            },
        }
    )

    if ai_result["face_detected"] and ai_result["liveness_verified"]:
        await db.faceembedding.create(
            data={
                "enrollmentId": enrollment.id,
                "vector": ai_result["embedding"],
                "modelName": "mock-face-ai",
                "modelVersion": "v1",
                "encrypted": False,
                "isActive": True,
            }
        )

        enrollment = await db.faceenrollment.update(
            where={"id": enrollment.id},
            data={
                "status": "ENROLLED",
                "qualityScore": ai_result["quality_score"],
                "livenessVerified": True,
                "embeddingVersion": "mock-v1",
                "enrolledByUserId": admin_user_id,
                "enrolledAt": datetime.now(timezone.utc),
            },
            include={"samples": True, "embeddings": True},
        )
    else:
        enrollment = await db.faceenrollment.update(
            where={"id": enrollment.id},
            data={
                "status": "FAILED",
                "qualityScore": ai_result["quality_score"],
                "livenessVerified": False,
            },
            include={"samples": True, "embeddings": True},
        )

    return {
        "sample": sample,
        "enrollment": enrollment,
        "ai_result": ai_result,
    }


async def get_face_enrollment(student_id: str):
    enrollment = await db.faceenrollment.find_unique(
        where={"studentId": student_id},
        include={
            "samples": True,
            "embeddings": True,
        },
    )

    if not enrollment:
        raise HTTPException(status_code=404, detail="Face enrollment not found")

    return enrollment