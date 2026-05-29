from datetime import datetime, timezone
from io import StringIO, BytesIO
import csv

from app.core.database import db


def _model_dump(payload):
    if hasattr(payload, "model_dump"):
        return payload.model_dump()
    if hasattr(payload, "dict"):
        return payload.dict()
    return dict(payload)


def _day_start(dt=None):
    dt = dt or datetime.now(timezone.utc)
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def _clean(data: dict):
    return {k: v for k, v in data.items() if v is not None and v != ""}


def _status_text(value):
    if value is None:
        return ""
    return getattr(value, "value", str(value))


async def create_attendance_session(payload):
    data = _model_dump(payload)

    department_id = data.get("department_id") or data.get("departmentId")
    class_id = data.get("class_id") or data.get("classId")
    section_id = data.get("section_id") or data.get("sectionId")
    camera_id = data.get("camera_id") or data.get("cameraId")

    create_data = {
        "departmentId": department_id,
        "classId": class_id,
        "sectionId": section_id,
        "cameraId": camera_id,
        "date": data.get("date") or _day_start(),
        "startTime": data.get("start_time") or data.get("startTime") or datetime.now(timezone.utc),
        "endTime": data.get("end_time") or data.get("endTime"),
        "status": data.get("status") or "ACTIVE",
    }

    create_data = _clean(create_data)

    return await db.attendancesession.create(data=create_data)


async def list_attendance_sessions():
    return await db.attendancesession.find_many(
        include={
            "department": True,
            "courseClass": True,
            "section": True,
            "camera": True,
        },
        order={"createdAt": "desc"},
    )


async def student_mark_attendance(payload):
    data = _model_dump(payload)

    student_id = data.get("student_id") or data.get("studentId")
    session_id = data.get("session_id") or data.get("sessionId")
    camera_id = data.get("camera_id") or data.get("cameraId")

    today = _day_start()
    now = datetime.now(timezone.utc)

    existing = await db.attendancerecord.find_first(
        where={
            "studentId": student_id,
            "date": today,
            "sessionId": session_id,
        }
    )

    record_data = {
        "studentId": student_id,
        "sessionId": session_id,
        "cameraId": camera_id,
        "date": today,
        "checkInTime": now,
        "status": data.get("status") or "PRESENT",
        "source": data.get("source") or "FACE_RECOGNITION",
        "recognitionConfidence": data.get("recognition_confidence")
        or data.get("recognitionConfidence")
        or 95,
        "livenessScore": data.get("liveness_score")
        or data.get("livenessScore")
        or 95,
    }

    record_data = _clean(record_data)

    if existing:
        return await db.attendancerecord.update(
            where={"id": existing.id},
            data=record_data,
        )

    return await db.attendancerecord.create(data=record_data)


async def list_attendance_records(
    skip: int = 0,
    limit: int = 100,
    student_id: str | None = None,
    session_id: str | None = None,
    status: str | None = None,
    start_date=None,
    end_date=None,
    date_from=None,
    date_to=None,
    **kwargs,
):
    # route may send start_date/end_date, older code may send date_from/date_to
    date_from = date_from or start_date
    date_to = date_to or end_date

    where = {}

    if student_id:
        where["studentId"] = student_id

    if session_id:
        where["sessionId"] = session_id

    if status:
        where["status"] = status

    if date_from or date_to:
        where["date"] = {}
        if date_from:
            where["date"]["gte"] = date_from
        if date_to:
            where["date"]["lte"] = date_to

    records = await db.attendancerecord.find_many(
        where=where,
        skip=skip,
        take=limit,
        order={"date": "desc"},
        include={
            "student": {
                "include": {
                    "department": True,
                    "courseClass": True,
                    "section": True,
                    "user": True,
                }
            },
            "session": True,
        },
    )

    total = await db.attendancerecord.count(where=where)

    items = []
    for r in records:
        student = getattr(r, "student", None)
        session = getattr(r, "session", None)

        items.append({
            "id": r.id,
            "student_id": getattr(r, "studentId", None),
            "student_name": getattr(student, "name", None) or "",
            "roll_no": getattr(student, "rollNo", None) or "",
            "department": getattr(getattr(student, "department", None), "name", None) or "",
            "class": getattr(getattr(student, "courseClass", None), "name", None) or "",
            "section": getattr(getattr(student, "section", None), "name", None) or "",
            "session_id": getattr(r, "sessionId", None),
            "session_name": getattr(session, "name", None) or "",
            "status": str(getattr(r, "status", "")),
            "source": str(getattr(r, "source", "")),
            "recognition_confidence": getattr(r, "recognitionConfidence", None),
            "liveness_score": getattr(r, "livenessScore", None),
            "marked_at": getattr(r, "checkInTime", None) or getattr(r, "date", None),
            "created_at": getattr(r, "createdAt", None),
        })

    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


async def manual_correction(record_id: str, payload):
    data = _model_dump(payload)

    update_data = {
        "status": data.get("status"),
        "source": data.get("source") or "MANUAL",
        "recognitionConfidence": data.get("recognition_confidence")
        or data.get("recognitionConfidence"),
        "livenessScore": data.get("liveness_score")
        or data.get("livenessScore"),
    }

    update_data = _clean(update_data)

    return await db.attendancerecord.update(
        where={"id": record_id},
        data=update_data,
    )


async def export_attendance_csv():
    records = await list_attendance_records()

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Roll No",
        "Student",
        "Department",
        "Class",
        "Section",
        "Date",
        "Check In",
        "Status",
        "Camera",
        "Confidence",
        "Liveness",
        "Source",
    ])

    for r in records:
        student = r.student
        writer.writerow([
            getattr(student, "rollNo", "") if student else "",
            getattr(student, "name", "") if student else "",
            getattr(student.department, "name", "") if student and student.department else "",
            getattr(student.courseClass, "name", "") if student and student.courseClass else "",
            getattr(student.section, "name", "") if student and student.section else "",
            r.date.isoformat() if r.date else "",
            r.checkInTime.isoformat() if r.checkInTime else "",
            _status_text(r.status),
            getattr(r.camera, "name", "") if r.camera else "",
            r.recognitionConfidence or "",
            r.livenessScore or "",
            _status_text(r.source),
        ])

    return output.getvalue()


async def export_attendance_excel():
    # Temporary safe fallback. Frontend can still download this text as file.
    return await export_attendance_csv()


async def export_attendance_pdf():
    # Temporary safe fallback. Frontend can still download this text as file.
    return await export_attendance_csv()
