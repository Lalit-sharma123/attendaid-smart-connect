from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, Query, Request, HTTPException
from pydantic import BaseModel

from app.core.database import db
from app.dependencies.auth import admin_required, student_required
from app.schemas.attendance_schema import (
    AttendanceSessionCreate,
    MarkAttendanceRequest,
    ManualCorrectionRequest,
)
from app.services.attendance_service import (
    create_attendance_session,
    list_attendance_sessions,
    student_mark_attendance,
    list_attendance_records,
    manual_correction,
    export_attendance_csv,
    export_attendance_excel,
    export_attendance_pdf,
)

router = APIRouter()


class FaceAttendanceMarkRequest(BaseModel):
    student_id: str
    status: str = "PRESENT"
    source: str = "FACE_RECOGNITION"
    recognition_confidence: float | None = None
    liveness_score: float | None = None
    camera_id: str | None = None
    session_id: str | None = None


@router.post("/sessions")
async def create_session(
    payload: AttendanceSessionCreate,
    current_user=Depends(admin_required),
):
    return await create_attendance_session(payload)


@router.get("/sessions")
async def get_sessions(current_user=Depends(admin_required)):
    return await list_attendance_sessions()


@router.post("/mark")
async def mark_attendance(
    payload: MarkAttendanceRequest,
    current_user=Depends(student_required),
):
    if not current_user.student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return await student_mark_attendance(
        student_id=current_user.student.id,
        session_id=payload.session_id,
    )


@router.post("/face/mark")
async def mark_face_attendance(
    payload: FaceAttendanceMarkRequest,
    request: Request,
    current_user=Depends(admin_required),
):
    """
    Admin / AI camera / face enrollment attendance mark.

    This creates or updates a real AttendanceRecord so your:
    - dashboard
    - attendance records
    - reports
    - analytics charts

    can show real data instead of mock data.
    """

    student = await db.student.find_unique(
        where={"id": payload.student_id},
        include={
            "user": True,
            "department": True,
            "courseClass": True,
            "section": True,
            "faceEnrollment": True,
        },
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if student.status == "DELETED":
        raise HTTPException(
            status_code=400,
            detail="Cannot mark attendance for deleted student",
        )

    now = datetime.now(timezone.utc)

    attendance_date = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    # Your schema has:
    # @@unique([studentId, date, sessionId])
    #
    # For nullable sessionId, Postgres allows multiple NULL values.
    # So we still manually check to avoid duplicate same-day records.
    existing_record = await db.attendancerecord.find_first(
        where={
            "studentId": student.id,
            "date": attendance_date,
            "sessionId": payload.session_id,
        }
    )

    if existing_record:
        updated_record = await db.attendancerecord.update(
            where={"id": existing_record.id},
            data={
                "status": payload.status,
                "source": payload.source,
                "checkInTime": now,
                "recognitionConfidence": payload.recognition_confidence,
                "livenessScore": payload.liveness_score,
                "cameraId": payload.camera_id,
                "verifiedByUserId": current_user.id,
            },
        )

        return {
            "message": "Attendance updated",
            "record": updated_record,
        }

    record = await db.attendancerecord.create(
        data={
            "studentId": student.id,
            "sessionId": payload.session_id,
            "date": attendance_date,
            "checkInTime": now,
            "status": payload.status,
            "recognitionConfidence": payload.recognition_confidence,
            "livenessScore": payload.liveness_score,
            "cameraId": payload.camera_id,
            "verifiedByUserId": current_user.id,
            "source": payload.source,
        }
    )

    # Optional: after face attendance mark, mark face enrollment as enrolled.
    # This uses your existing FaceEnrollment model names from previous output.
    if student.faceEnrollment:
        try:
            await db.faceenrollment.update(
                where={"studentId": student.id},
                data={
                    "status": "ENROLLED",
                    "livenessVerified": True,
                    "enrolledByUserId": current_user.id,
                    "enrolledAt": now,
                },
            )
        except Exception:
            # Do not fail attendance if enrollment update has a schema mismatch.
            pass

    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    try:
        await db.auditlog.create(
            data={
                "actorUserId": current_user.id,
                "action": "FACE_ATTENDANCE_MARKED",
                "entityType": "AttendanceRecord",
                "entityId": record.id,
                "ipAddress": ip,
                "userAgent": user_agent,
                "severity": "INFO",
                "metadata": {
                    "student_id": student.id,
                    "status": payload.status,
                    "source": payload.source,
                    "recognition_confidence": payload.recognition_confidence,
                    "liveness_score": payload.liveness_score,
                    "camera_id": payload.camera_id,
                    "session_id": payload.session_id,
                },
            }
        )
    except Exception:
        # Do not fail attendance if audit log insert fails.
        pass

    return {
        "message": "Attendance marked",
        "record": record,
    }


@router.get("/records")
async def get_records(
    start_date: date | None = None,
    end_date: date | None = None,
    student_id: str | None = None,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    status: str | None = None,
    skip: int = Query(0, ge=0),
    take: int = Query(50, ge=1, le=200),
    current_user=Depends(admin_required),
):
    return await list_attendance_records(
        start_date=start_date,
        end_date=end_date,
        student_id=student_id,
        department_id=department_id,
        class_id=class_id,
        section_id=section_id,
        status=status,
        skip=skip,
        take=take,
    )


@router.patch("/records/{record_id}/correct")
async def correct_record(
    record_id: str,
    payload: ManualCorrectionRequest,
    request: Request,
    current_user=Depends(admin_required),
):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return await manual_correction(
        record_id=record_id,
        status=payload.status,
        reason=payload.reason,
        admin_user_id=current_user.id,
        ip=ip,
        user_agent=user_agent,
    )


@router.get("/export/csv")
async def export_csv(
    start_date: date | None = None,
    end_date: date | None = None,
    student_id: str | None = None,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    status: str | None = None,
    current_user=Depends(admin_required),
):
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "student_id": student_id,
        "department_id": department_id,
        "class_id": class_id,
        "section_id": section_id,
        "status": status,
    }

    return await export_attendance_csv(filters, current_user.id)


@router.get("/export/excel")
async def export_excel(
    start_date: date | None = None,
    end_date: date | None = None,
    student_id: str | None = None,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    status: str | None = None,
    current_user=Depends(admin_required),
):
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "student_id": student_id,
        "department_id": department_id,
        "class_id": class_id,
        "section_id": section_id,
        "status": status,
    }

    return await export_attendance_excel(filters, current_user.id)


@router.get("/export/pdf")
async def export_pdf(
    start_date: date | None = None,
    end_date: date | None = None,
    student_id: str | None = None,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    status: str | None = None,
    current_user=Depends(admin_required),
):
    filters = {
        "start_date": start_date,
        "end_date": end_date,
        "student_id": student_id,
        "department_id": department_id,
        "class_id": class_id,
        "section_id": section_id,
        "status": status,
    }

    return await export_attendance_pdf(filters, current_user.id)