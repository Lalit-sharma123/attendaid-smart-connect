from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from app.core.database import db


def norm(value):
    return str(value or "").strip()


def lower(value):
    return norm(value).lower()


def pretty_enum(value):
    return norm(value).replace("_", " ").title()


def student_name(student):
    parts = [
        getattr(student, "firstName", None),
        getattr(student, "middleName", None),
        getattr(student, "lastName", None),
    ]
    full = " ".join([p for p in parts if p])
    return full or getattr(student, "name", None) or "-"


def student_roll(student):
    return (
        getattr(student, "rollNumber", None)
        or getattr(student, "rollNo", None)
        or getattr(student, "studentCode", None)
        or "-"
    )


def student_class(student):
    return (
        getattr(student, "className", None)
        or getattr(student, "class_", None)
        or getattr(student, "course", None)
        or "-"
    )


def student_department(student):
    return getattr(student, "department", None) or "-"


def compact_record(record):
    return {
        "id": record.id,
        "date": str(record.date),
        "status": str(record.status),
        "check_in": str(getattr(record, "checkInTime", None) or ""),
        "check_out": str(getattr(record, "checkOutTime", None) or ""),
    }


async def attendance_summary_for_student(student_id: str, days: int = 30):
    start = datetime.now(timezone.utc) - timedelta(days=days)

    records = await db.attendancerecord.find_many(
        where={
            "studentId": student_id,
            "date": {"gte": start},
        },
        order={"date": "desc"},
        take=500,
    )

    total = len(records)
    present = len([r for r in records if str(r.status) in ["PRESENT", "LATE", "MANUAL_CORRECTED"]])
    absent = len([r for r in records if str(r.status) == "ABSENT"])
    late = len([r for r in records if str(r.status) == "LATE"])
    percentage = round((present / total) * 100, 2) if total else 0

    return {
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "percentage": percentage,
        "records": [compact_record(r) for r in records[:10]],
    }


async def find_students_by_query(query: str):
    q = norm(query)
    if not q:
        return []

    students = await db.student.find_many(
        where={"status": {"not": "DELETED"}},
        take=1000,
        order={"createdAt": "desc"},
    )

    ql = q.lower()

    # Remove common assistant words so search works with:
    # "show BCA students", "details of roll 1023", "attendance of Aman"
    stop_words = {
        "show", "find", "search", "student", "students", "detail", "details",
        "attendance", "present", "absent", "of", "for", "roll", "rollno",
        "roll", "number", "course", "class", "name", "give", "me", "tell",
        "about", "please", "the", "in"
    }

    tokens = [
        t.strip().lower()
        for t in ql.replace(",", " ").replace(":", " ").replace("-", " ").split()
        if t.strip() and t.strip().lower() not in stop_words
    ]

    matched = []
    for s in students:
        haystack = " ".join(
            [
                lower(student_name(s)),
                lower(student_roll(s)),
                lower(student_class(s)),
                lower(student_department(s)),
                lower(getattr(s, "section", "")),
                lower(getattr(s, "email", "")),
                lower(getattr(s, "phone", "")),
            ]
        )

        if ql in haystack:
            matched.append(s)
            continue

        if tokens and any(t in haystack for t in tokens):
            matched.append(s)

    return matched[:20]


async def get_low_attendance_students(days: int = 30, threshold: float = 75):
    students = await db.student.find_many(
        where={"status": {"not": "DELETED"}},
        take=1000,
    )

    rows = []
    for s in students:
        summary = await attendance_summary_for_student(s.id, days=days)
        if summary["total"] > 0 and summary["percentage"] < threshold:
            rows.append({"student": s, "summary": summary})

    rows.sort(key=lambda x: x["summary"]["percentage"])
    return rows[:10]


async def create_alert_from_assistant(
    *,
    title: str,
    message: str,
    severity: str = "MEDIUM",
    type: str = "SYSTEM_ERROR",
    current_user_id: str | None = None,
):
    alert = await db.alert.create(
        data={
            "type": type,
            "severity": severity,
            "title": title,
            "message": message,
            "status": "OPEN",
            "assignedToUserId": current_user_id,
        }
    )

    try:
        await db.auditlog.create(
            data={
                "actorUserId": current_user_id,
                "action": "AI_CREATED_ALERT",
                "entityType": "ALERT",
                "entityId": alert.id,
                "severity": "INFO",
                "metadata": {"detail": f"AI Assistant created alert: {title}"},
            }
        )
    except Exception:
        pass

    return alert


async def today_attendance_summary():
    today = datetime.now(timezone.utc).date()
    start = datetime(today.year, today.month, today.day, tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    records = await db.attendancerecord.find_many(
        where={
            "date": {
                "gte": start,
                "lt": end,
            }
        },
        take=1000,
    )

    total = len(records)
    present = len([r for r in records if str(r.status) in ["PRESENT", "LATE", "MANUAL_CORRECTED"]])
    absent = len([r for r in records if str(r.status) == "ABSENT"])
    late = len([r for r in records if str(r.status) == "LATE"])
    percentage = round((present / total) * 100, 2) if total else 0

    return {
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "percentage": percentage,
    }


async def alert_summary():
    open_count = await db.alert.count(where={"status": "OPEN"})
    in_progress_count = await db.alert.count(where={"status": "IN_PROGRESS"})
    resolved_count = await db.alert.count(where={"status": "RESOLVED"})
    critical_count = await db.alert.count(where={"severity": "CRITICAL"})
    high_count = await db.alert.count(where={"severity": "HIGH"})

    return {
        "open": open_count,
        "in_progress": in_progress_count,
        "resolved": resolved_count,
        "critical": critical_count,
        "high": high_count,
    }


async def ai_assistant_chat(message: str, current_user):
    msg = norm(message)
    ml = msg.lower()

    if not msg:
        raise HTTPException(status_code=400, detail="Message is required")

    current_user_id = getattr(current_user, "id", None)

    # 1. Create alert command
    if "create alert" in ml or "make alert" in ml or "raise alert" in ml:
        severity = "MEDIUM"
        alert_type = "SYSTEM_ERROR"

        if "spoof" in ml:
            severity = "CRITICAL"
            alert_type = "SPOOF_ATTEMPT"
        elif "unknown face" in ml or "unknown" in ml:
            severity = "HIGH"
            alert_type = "UNKNOWN_FACE"
        elif "camera" in ml and "offline" in ml:
            severity = "HIGH"
            alert_type = "CAMERA_OFFLINE"
        elif "camera" in ml:
            severity = "MEDIUM"
            alert_type = "CAMERA_DEGRADED"
        elif "low attendance" in ml or "attendance" in ml:
            severity = "HIGH"
            alert_type = "LOW_ATTENDANCE"

        title = "AI Generated Alert"
        message_text = (
            msg.replace("create alert", "")
            .replace("make alert", "")
            .replace("raise alert", "")
            .strip()
        )

        if not message_text:
            message_text = "Alert created from AI Assistant request."

        alert = await create_alert_from_assistant(
            title=title,
            message=message_text,
            severity=severity,
            type=alert_type,
            current_user_id=current_user_id,
        )

        return {
            "reply": f"Alert created successfully: {pretty_enum(alert.type)} · {pretty_enum(alert.severity)} · {alert.message}",
            "type": "alert_created",
            "actions": ["view_alerts"],
            "data": {"alert_id": alert.id},
        }

    # 2. Low attendance
    if "low attendance" in ml or "poor attendance" in ml or "less attendance" in ml:
        rows = await get_low_attendance_students(days=30, threshold=75)

        if not rows:
            return {
                "reply": "No low-attendance students found in the last 30 days.",
                "type": "low_attendance",
                "data": [],
            }

        lines = []
        data = []

        for item in rows:
            s = item["student"]
            summary = item["summary"]
            line = (
                f"{student_name(s)} ({student_roll(s)}, {student_class(s)}) - "
                f"{summary['percentage']}% attendance, Present {summary['present']}, Absent {summary['absent']}"
            )
            lines.append(line)
            data.append(
                {
                    "id": s.id,
                    "name": student_name(s),
                    "roll_no": student_roll(s),
                    "class": student_class(s),
                    "department": student_department(s),
                    "attendance": summary,
                }
            )

        return {
            "reply": "Low attendance students:\n" + "\n".join(lines),
            "type": "low_attendance",
            "actions": ["create_alert", "export_report"],
            "data": data,
        }

    # 3. Today's attendance
    if "today" in ml and "attendance" in ml:
        summary = await today_attendance_summary()

        return {
            "reply": (
                f"Today's attendance: Total {summary['total']}, "
                f"Present {summary['present']}, Absent {summary['absent']}, "
                f"Late {summary['late']}, Attendance {summary['percentage']}%."
            ),
            "type": "today_attendance",
            "actions": ["view_attendance", "export_report"],
            "data": summary,
        }

    # 4. Alert / incident summary
    if "alert" in ml or "incident" in ml:
        summary = await alert_summary()

        return {
            "reply": (
                f"Alerts summary: Open {summary['open']}, "
                f"In Progress {summary['in_progress']}, Resolved {summary['resolved']}, "
                f"Critical {summary['critical']}, High {summary['high']}."
            ),
            "type": "alert_summary",
            "actions": ["view_alerts"],
            "data": summary,
        }

    # 5. Student/course/roll/attendance query
    if (
        "student" in ml
        or "roll" in ml
        or "course" in ml
        or "class" in ml
        or "bca" in ml
        or "mba" in ml
        or "attendance" in ml
        or "present" in ml
        or "absent" in ml
    ):
        students = await find_students_by_query(msg)

        if not students:
            return {
                "reply": "I could not find matching students. Try student name, roll number, or course like BCA.",
                "type": "student_search",
                "data": [],
            }

        lines = []
        data = []

        for s in students[:10]:
            summary = await attendance_summary_for_student(s.id, days=30)
            line = (
                f"{student_name(s)} ({student_roll(s)}, {student_class(s)}) - "
                f"Present {summary['present']}, Absent {summary['absent']}, "
                f"Late {summary['late']}, Attendance {summary['percentage']}% in last 30 days."
            )
            lines.append(line)
            data.append(
                {
                    "id": s.id,
                    "name": student_name(s),
                    "roll_no": student_roll(s),
                    "class": student_class(s),
                    "department": student_department(s),
                    "email": getattr(s, "email", None),
                    "phone": getattr(s, "phone", None),
                    "attendance": summary,
                }
            )

        return {
            "reply": "\n".join(lines),
            "type": "student_details",
            "actions": ["view_students", "create_alert"],
            "data": data,
        }

    # 6. Help fallback
    return {
        "reply": (
            "I can help with student details, roll number search, course/class search, "
            "present/absent attendance, low attendance, alert summary, and creating alerts. "
            "Try: 'Show BCA students', 'attendance of roll 1023', "
            "'today attendance', or 'create alert camera offline at Main Gate'."
        ),
        "type": "help",
        "actions": ["student_search", "low_attendance", "create_alert"],
    }
