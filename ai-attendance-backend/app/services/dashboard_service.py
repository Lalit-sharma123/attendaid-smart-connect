
# from datetime import datetime, timezone, timedelta
# from collections import defaultdict

# from app.core.database import db


# def _pct(value: float) -> int:
#     return int(round(value or 0))


# def _day_start(dt: datetime) -> datetime:
#     return dt.replace(hour=0, minute=0, second=0, microsecond=0)


# def _status(value) -> str:
#     if value is None:
#         return ""
#     return getattr(value, "value", str(value)).upper()


# async def admin_dashboard_summary():
#     stats = await get_dashboard_stats(db)

#     return {
#         "totalStudents": stats["total_students"],
#         "presentToday": stats["present_today"],
#         "lateToday": stats["late_today"],
#         "absentToday": stats["absent_today"],
#         "attendanceRate": stats["attendance_rate"],
#         "attendancePercent": stats["attendance_rate"],
#         "totalCameras": sum(item["value"] for item in stats["cameraHealth"]),
#         "onlineCameras": next(
#             (item["value"] for item in stats["cameraHealth"] if item["name"] == "Healthy"),
#             0,
#         ),
#         "offlineCameras": next(
#             (item["value"] for item in stats["cameraHealth"] if item["name"] == "Offline"),
#             0,
#         ),
#         "spoofAttempts": sum(item["count"] for item in stats["spoofAttempts"]),
#     }


# async def admin_dashboard_stats():
#     return await get_dashboard_stats(db)


# async def get_dashboard_stats(db):
#     now = datetime.now(timezone.utc)
#     today = _day_start(now)
#     week_start = today - timedelta(days=6)

#     students = await db.student.find_many(
#         include={
#             "department": True,
#             "courseClass": True,
#             "section": True,
#         }
#     )

#     total_students = len(students)

#     attendance_records = await db.attendancerecord.find_many(
#         where={
#             "date": {
#                 "gte": week_start,
#                 "lte": today,
#             }
#         },
#         include={
#             "student": {
#                 "include": {
#                     "department": True,
#                     "courseClass": True,
#                     "section": True,
#                 }
#             },
#             "camera": True,
#         },
#         order={
#             "checkInTime": "desc",
#         },
#     )

#     cameras = await db.camera.find_many()

#     # -----------------------------
#     # Summary cards
#     # -----------------------------
#     today_records = [
#         r for r in attendance_records
#         if r.date and _day_start(r.date) == today
#     ]

#     present_today = len([
#         r for r in today_records
#         if _status(r.status) == "PRESENT"
#     ])

#     late_today = len([
#         r for r in today_records
#         if _status(r.status) == "LATE"
#     ])

#     absent_today = max(total_students - present_today - late_today, 0)

#     attendance_rate = (
#         ((present_today + late_today) / total_students) * 100
#         if total_students else 0
#     )

#     # -----------------------------
#     # Daily Attendance % chart
#     # Frontend type expects: day + attendance
#     # -----------------------------
#     daily_attendance = []

#     for i in range(7):
#         day = week_start + timedelta(days=i)
#         label = day.strftime("%a")

#         day_records = [
#             r for r in attendance_records
#             if r.date and _day_start(r.date) == day
#         ]

#         present_or_late = len([
#             r for r in day_records
#             if _status(r.status) in ["PRESENT", "LATE"]
#         ])

#         value = (
#             (present_or_late / total_students) * 100
#             if total_students else 0
#         )

#         daily_attendance.append({
#             "day": label,
#             "attendance": _pct(value),
#             "predicted": min(100, _pct(value) + 2),
#             "value": _pct(value),
#         })

#     # -----------------------------
#     # Department-wise Attendance
#     # -----------------------------
#     department_total = defaultdict(int)
#     department_present = defaultdict(int)

#     for student in students:
#         dept = student.department.name if student.department else "Unknown"
#         department_total[dept] += 1

#     for record in today_records:
#         student = record.student
#         if not student:
#             continue

#         dept = student.department.name if student.department else "Unknown"

#         if _status(record.status) in ["PRESENT", "LATE"]:
#             department_present[dept] += 1

#     department_attendance = []

#     for dept, count in department_total.items():
#         value = (
#             (department_present[dept] / count) * 100
#             if count else 0
#         )

#         department_attendance.append({
#             "department": dept,
#             "value": _pct(value),
#         })

#     # -----------------------------
#     # Camera Health donut
#     # -----------------------------
#     healthy = 0
#     degraded = 0
#     offline = 0

#     for camera in cameras:
#         status = _status(getattr(camera, "status", ""))

#         if status in ["ONLINE", "HEALTHY", "ACTIVE"]:
#             healthy += 1
#         elif status in ["DEGRADED", "WARNING"]:
#             degraded += 1
#         elif status in ["OFFLINE", "INACTIVE"]:
#             offline += 1
#         else:
#             degraded += 1

#     camera_health = [
#         {"name": "Healthy", "value": healthy},
#         {"name": "Degraded", "value": degraded},
#         {"name": "Offline", "value": offline},
#     ]

#     # -----------------------------
#     # Spoof Attempts Today
#     # Red bar chart
#     # -----------------------------
#     spoof_attempts = []

#     for hour in [8, 9, 10, 11, 12, 13, 14, 15]:
#         hour_start = today.replace(hour=hour)
#         hour_end = hour_start + timedelta(hours=1)

#         count = 0

#         try:
#             alerts = await db.alert.find_many(
#                 where={
#                     "createdAt": {
#                         "gte": hour_start,
#                         "lt": hour_end,
#                     },
#                 }
#             )

#             count = len([
#                 a for a in alerts
#                 if "SPOOF" in _status(getattr(a, "type", None))
#                 or "SPOOF" in _status(getattr(a, "severity", None))
#                 or "SPOOF" in str(getattr(a, "title", "") or "").upper()
#                 or "SPOOF" in str(getattr(a, "message", "") or "").upper()
#             ])
#         except Exception:
#             count = 0

#         spoof_attempts.append({
#             "time": hour_start.strftime("%H:%M"),
#             "count": count,
#         })

#     # -----------------------------
#     # Class-wise Attendance Heatmap
#     # Frontend type expects: section + values
#     # Also returns className + periods for compatibility
#     # -----------------------------
#     class_names = []

#     for student in students:
#         class_name = student.section.name if student.section else None
#         if class_name and class_name not in class_names:
#             class_names.append(class_name)

#     periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]

#     class_heatmap = []

#     for class_name in class_names[:6]:
#         row_periods = []
#         row_values = []

#         class_students = [
#             s for s in students
#             if s.section and s.section.name == class_name
#         ]

#         class_total = len(class_students)

#         for index, period in enumerate(periods):
#             start_hour = 8 + index
#             period_start = today.replace(hour=start_hour)
#             period_end = period_start + timedelta(hours=1)

#             period_records = [
#                 r for r in today_records
#                 if r.checkInTime
#                 and period_start <= r.checkInTime < period_end
#                 and r.student
#                 and r.student.section
#                 and r.student.section.name == class_name
#                 and _status(r.status) in ["PRESENT", "LATE"]
#             ]

#             value = (
#                 (len(period_records) / class_total) * 100
#                 if class_total else 0
#             )

#             pct_value = _pct(value)

#             row_periods.append({
#                 "period": period,
#                 "value": pct_value,
#             })

#             row_values.append(pct_value)

#         class_heatmap.append({
#             "section": class_name,
#             "values": row_values,
#             "className": class_name,
#             "periods": row_periods,
#         })

#     # -----------------------------
#     # Recent Attendance Activity
#     # -----------------------------
#     recent_activity = []

#     for record in attendance_records[:10]:
#         student = record.student

#         recent_activity.append({
#             "rollNo": getattr(student, "rollNo", None)
#             or getattr(student, "roll_no", None)
#             or "-",
#             "student": student.name if student else "Unknown",
#             "time": record.checkInTime.strftime("%I:%M %p") if record.checkInTime else "-",
#             "camera": record.camera.name if record.camera else "Library Camera",
#             "confidence": int(round(record.recognitionConfidence or 0)),
#             "liveness": int(round(record.livenessScore or 0)),
#             "status": str(getattr(record.status, "value", record.status)).title(),
#         })

#     # -----------------------------
#     # Camera Activity
#     # -----------------------------
#     camera_group = defaultdict(lambda: {
#         "detections": 0,
#         "confidence_sum": 0,
#         "liveness_sum": 0,
#     })

#     for record in today_records:
#         camera_name = record.camera.name if record.camera else "Library Camera"
#         camera_group[camera_name]["detections"] += 1
#         camera_group[camera_name]["confidence_sum"] += record.recognitionConfidence or 0
#         camera_group[camera_name]["liveness_sum"] += record.livenessScore or 0

#     camera_activity = []

#     for camera_name, item in camera_group.items():
#         detections = item["detections"]

#         camera_activity.append({
#             "camera": camera_name,
#             "detections": detections,
#             "avgConfidence": round(item["confidence_sum"] / detections, 1)
#             if detections else 0,
#             "avgLiveness": round(item["liveness_sum"] / detections, 1)
#             if detections else 0,
#         })

#     return {
#         "total_students": total_students,
#         "present_today": present_today,
#         "late_today": late_today,
#         "absent_today": absent_today,
#         "attendance_rate": round(attendance_rate, 1),

#         "dailyAttendance": daily_attendance,
#         "departmentAttendance": department_attendance,
#         "cameraHealth": camera_health,
#         "spoofAttempts": spoof_attempts,
#         "classHeatmap": class_heatmap,
#         "recentActivity": recent_activity,
#         "cameraActivity": camera_activity,

#         # optional AI placeholder, so frontend does not break
#         "aiInsights": [],
#     }




from datetime import datetime, timezone, timedelta
from collections import defaultdict

from app.core.database import db


def _pct(value: float) -> int:
    return int(round(value or 0))


def _normalize_dt(dt: datetime | None) -> datetime | None:
    if not dt:
        return None

    # Prisma/Postgres can return naive datetime.
    # Make comparison safe.
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)

    return dt.astimezone(timezone.utc)


def _day_start(dt: datetime) -> datetime:
    dt = _normalize_dt(dt) or datetime.now(timezone.utc)
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)


def _status(value) -> str:
    if value is None:
        return ""
    return getattr(value, "value", str(value)).upper()


def _safe_name(obj, fallback="-"):
    if not obj:
        return fallback
    return getattr(obj, "name", fallback) or fallback


def _is_active_student(student) -> bool:
    status = _status(getattr(student, "status", None))
    return status not in ["DELETED", "INACTIVE", "BLOCKED"]


def _record_date(record):
    return _normalize_dt(getattr(record, "date", None))


def _record_checkin(record):
    return _normalize_dt(getattr(record, "checkInTime", None))


async def admin_dashboard_summary():
    stats = await get_dashboard_stats(db)

    total_cameras = sum(item["value"] for item in stats["cameraHealth"])
    healthy_cameras = next(
        (item["value"] for item in stats["cameraHealth"] if item["name"] == "Healthy"),
        0,
    )
    degraded_cameras = next(
        (item["value"] for item in stats["cameraHealth"] if item["name"] == "Degraded"),
        0,
    )
    offline_cameras = next(
        (item["value"] for item in stats["cameraHealth"] if item["name"] == "Offline"),
        0,
    )

    avg_confidence = 0
    if stats["recentActivity"]:
        avg_confidence = round(
            sum(r["confidence"] for r in stats["recentActivity"]) / len(stats["recentActivity"]),
            1,
        )

    return {
        # camelCase for frontend cards
        "totalStudents": stats["total_students"],
        "presentToday": stats["present_today"],
        "absentToday": stats["absent_today"],
        "lateToday": stats["late_today"],
        "attendanceRate": stats["attendance_rate"],
        "attendancePercent": stats["attendance_rate"],
        "avgAttendance": stats["attendance_rate"],

        "totalCameras": total_cameras,
        "activeCameras": healthy_cameras,
        "onlineCameras": healthy_cameras,
        "degradedCameras": degraded_cameras,
        "offlineCameras": offline_cameras,

        "spoofAttempts": sum(item["count"] for item in stats["spoofAttempts"]),
        "unknownFaces": stats.get("unknown_faces", 0),
        "aiConfidence": avg_confidence,
        "avgConfidence": avg_confidence,
        "systemUptime": 99.8,

        # snake_case also returned for compatibility
        "total_students": stats["total_students"],
        "present_today": stats["present_today"],
        "absent_today": stats["absent_today"],
        "late_today": stats["late_today"],
        "attendance_rate": stats["attendance_rate"],
    }


async def admin_dashboard_stats():
    return await get_dashboard_stats(db)


async def get_dashboard_stats(db):
    now = datetime.now(timezone.utc)
    today = _day_start(now)
    tomorrow = today + timedelta(days=1)
    week_start = today - timedelta(days=6)

    students_all = await db.student.find_many(
        include={
            "department": True,
            "courseClass": True,
            "section": True,
            "faceEnrollment": True,
        }
    )

    students = [s for s in students_all if _is_active_student(s)]
    total_students = len(students)

    attendance_records = await db.attendancerecord.find_many(
        where={
            "date": {
                "gte": week_start,
                "lt": tomorrow,
            }
        },
        include={
            "student": {
                "include": {
                    "department": True,
                    "courseClass": True,
                    "section": True,
                }
            },
            "camera": True,
        },
        order={
            "checkInTime": "desc",
        },
    )

    cameras = await db.camera.find_many()

    today_records = [
        r for r in attendance_records
        if _record_date(r) and today <= _record_date(r) < tomorrow
    ]

    present_today = len([
        r for r in today_records
        if _status(r.status) == "PRESENT"
    ])

    late_today = len([
        r for r in today_records
        if _status(r.status) == "LATE"
    ])

    absent_today = max(total_students - present_today - late_today, 0)

    attendance_rate = (
        ((present_today + late_today) / total_students) * 100
        if total_students else 0
    )

    # -----------------------------
    # Daily Attendance % chart
    # EXACT frontend shape: day, attendance, predicted
    # -----------------------------
    daily_attendance = []

    for i in range(7):
        day = week_start + timedelta(days=i)
        label = day.strftime("%a")

        day_end = day + timedelta(days=1)

        day_records = [
            r for r in attendance_records
            if _record_date(r) and day <= _record_date(r) < day_end
        ]

        present_or_late = len([
            r for r in day_records
            if _status(r.status) in ["PRESENT", "LATE"]
        ])

        value = (
            (present_or_late / total_students) * 100
            if total_students else 0
        )

        attendance_value = _pct(value)

        daily_attendance.append({
            "day": label,
            "attendance": attendance_value,
            "predicted": min(100, attendance_value + 2),
            "value": attendance_value,
        })

    # -----------------------------
    # Department-wise Attendance
    # EXACT frontend shape: department, value
    # -----------------------------
    department_total = defaultdict(int)
    department_present = defaultdict(int)

    for student in students:
        dept = _safe_name(student.department, "Unknown")
        department_total[dept] += 1

    for record in today_records:
        student = record.student
        if not student:
            continue

        dept = _safe_name(student.department, "Unknown")

        if _status(record.status) in ["PRESENT", "LATE"]:
            department_present[dept] += 1

    department_attendance = []

    for dept, count in department_total.items():
        value = (
            (department_present[dept] / count) * 100
            if count else 0
        )

        department_attendance.append({
            "department": dept,
            "value": _pct(value),
        })

    # -----------------------------
    # Camera Health donut
    # EXACT frontend shape: name, value
    # -----------------------------
    healthy = 0
    degraded = 0
    offline = 0

    for camera in cameras:
        status = _status(getattr(camera, "status", ""))

        if status in ["ONLINE", "HEALTHY", "ACTIVE"]:
            healthy += 1
        elif status in ["DEGRADED", "WARNING", "MAINTENANCE"]:
            degraded += 1
        elif status in ["OFFLINE", "INACTIVE"]:
            offline += 1
        else:
            degraded += 1

    camera_health = [
        {"name": "Healthy", "value": healthy},
        {"name": "Degraded", "value": degraded},
        {"name": "Offline", "value": offline},
    ]

    # -----------------------------
    # Spoof Attempts Today
    # EXACT frontend shape: time, count
    # -----------------------------
    spoof_attempts = []

    for hour in [8, 9, 10, 11, 12, 13, 14, 15]:
        hour_start = today.replace(hour=hour)
        hour_end = hour_start + timedelta(hours=1)

        count = 0

        # alerts table
        try:
            alerts = await db.alert.find_many(
                where={
                    "createdAt": {
                        "gte": hour_start,
                        "lt": hour_end,
                    },
                }
            )

            count += len([
                a for a in alerts
                if "SPOOF" in _status(getattr(a, "type", None))
                or "SPOOF" in _status(getattr(a, "severity", None))
                or "SPOOF" in str(getattr(a, "title", "") or "").upper()
                or "SPOOF" in str(getattr(a, "message", "") or "").upper()
            ])
        except Exception:
            pass

        # low liveness / low confidence attendance records
        count += len([
            r for r in today_records
            if _record_checkin(r)
            and hour_start <= _record_checkin(r) < hour_end
            and (
                (r.livenessScore is not None and r.livenessScore < 50)
                or (r.recognitionConfidence is not None and r.recognitionConfidence < 50)
                or "SPOOF" in _status(r.status)
            )
        ])

        spoof_attempts.append({
            "time": hour_start.strftime("%H:%M"),
            "count": count,
        })

    # -----------------------------
    # Class-wise Attendance Heatmap
    # EXACT frontend shape: section, values
    # Also includes className/periods for compatibility
    # -----------------------------
    # class_names = []

    # for student in students:
    #     section_name = _safe_name(student.section, None)
    #     if section_name and section_name not in class_names:
    #         class_names.append(section_name)

    # periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]

    # class_heatmap = []

    # for section_name in class_names[:6]:
    #     row_values = []
    #     row_periods = []

    #     section_students = [
    #         s for s in students
    #         if s.section and s.section.name == section_name
    #     ]

    #     section_total = len(section_students)

    #     for index, period in enumerate(periods):
    #         start_hour = 8 + index
    #         period_start = today.replace(hour=start_hour)
    #         period_end = period_start + timedelta(hours=1)

    #         period_records = [
    #             r for r in today_records
    #             if r.checkInTime
    #             and period_start <= r.checkInTime < period_end
    #             and r.student
    #             and r.student.section
    #             and r.student.section.name == section_name
    #             and _status(r.status) in ["PRESENT", "LATE"]
    #         ]

    #         value = (
    #             (len(period_records) / section_total) * 100
    #             if section_total else 0
    #         )

    #         pct_value = _pct(value)

    #         row_values.append(pct_value)
    #         row_periods.append({
    #             "period": period,
    #             "value": pct_value,
    #         })

    #     class_heatmap.append({
    #         "section": section_name,
    #         "values": row_values,
    #         "className": section_name,
    #         "periods": row_periods,
    #     })



    class_names = []

    for student in students:
        section_name = _safe_name(student.section, "Unassigned")
        if section_name and section_name not in class_names:
            class_names.append(section_name)

    if not class_names and total_students > 0:
        class_names = ["Unassigned"]

    periods = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"]

    class_heatmap = []

    for section_name in class_names[:6]:
        row_values = []
        row_periods = []

        section_students = [
            s for s in students
            if _safe_name(s.section, "Unassigned") == section_name
        ]

        section_total = len(section_students)

        for index, period in enumerate(periods):
            start_hour = 8 + index
            period_start = today.replace(hour=start_hour)
            period_end = period_start + timedelta(hours=1)

            period_records = [
                r for r in today_records
                if _record_checkin(r)
                and period_start <= _record_checkin(r) < period_end
                and r.student
                and _safe_name(r.student.section, "Unassigned") == section_name
                and _status(r.status) in ["PRESENT", "LATE"]
            ]

            value = (
                (len(period_records) / section_total) * 100
                if section_total else 0
            )

            pct_value = _pct(value)

            row_values.append(pct_value)
            row_periods.append({
                "period": period,
                "value": pct_value,
            })

        class_heatmap.append({
            "section": section_name,
            "values": row_values,
            "className": section_name,
            "periods": row_periods,
        })

    # -----------------------------
    # Recent Attendance Activity
    # -----------------------------
    recent_activity = []

    for record in attendance_records[:10]:
        student = record.student

        recent_activity.append({
            "rollNo": getattr(student, "rollNo", None)
            or getattr(student, "roll_no", None)
            or "-",
            "student": student.name if student else "Unknown",
            "time": record.checkInTime.strftime("%I:%M %p") if record.checkInTime else "-",
            "camera": record.camera.name if record.camera else "Library Camera",
            "confidence": int(round(record.recognitionConfidence or 0)),
            "liveness": int(round(record.livenessScore or 0)),
            "status": str(getattr(record.status, "value", record.status)).title(),
        })

    # -----------------------------
    # Camera Activity
    # -----------------------------
    camera_group = defaultdict(lambda: {
        "detections": 0,
        "confidence_sum": 0,
        "liveness_sum": 0,
    })

    for record in today_records:
        camera_name = record.camera.name if record.camera else "Library Camera"
        camera_group[camera_name]["detections"] += 1
        camera_group[camera_name]["confidence_sum"] += record.recognitionConfidence or 0
        camera_group[camera_name]["liveness_sum"] += record.livenessScore or 0

    camera_activity = []

    for camera_name, item in camera_group.items():
        detections = item["detections"]

        camera_activity.append({
            "camera": camera_name,
            "detections": detections,
            "avgConfidence": round(item["confidence_sum"] / detections, 1)
            if detections else 0,
            "avgLiveness": round(item["liveness_sum"] / detections, 1)
            if detections else 0,
        })

    # -----------------------------
    # AI insights placeholder from real data
    # -----------------------------
    ai_insights = []

    if attendance_rate < 75:
        ai_insights.append({
            "type": "warning",
            "message": f"Attendance is low today at {round(attendance_rate, 1)}%.",
        })
    else:
        ai_insights.append({
            "type": "success",
            "message": f"Attendance is stable today at {round(attendance_rate, 1)}%.",
        })

    if absent_today > 0:
        ai_insights.append({
            "type": "risk",
            "message": f"{absent_today} student(s) are absent today.",
        })

    if sum(item["count"] for item in spoof_attempts) > 0:
        ai_insights.append({
            "type": "security",
            "message": "Spoof or low-liveness attempts detected today.",
        })

    return {
        # snake_case summary
        "total_students": total_students,
        "present_today": present_today,
        "late_today": late_today,
        "absent_today": absent_today,
        "attendance_rate": round(attendance_rate, 1),
        "unknown_faces": 0,

        # camelCase summary compatibility
        "totalStudents": total_students,
        "presentToday": present_today,
        "lateToday": late_today,
        "absentToday": absent_today,
        "attendanceRate": round(attendance_rate, 1),
        "attendancePercent": round(attendance_rate, 1),
        "avgAttendance": round(attendance_rate, 1),

        # charts
        "dailyAttendance": daily_attendance,
        "weeklyTrend": daily_attendance,
        "departmentAttendance": department_attendance,
        "cameraHealth": camera_health,
        "spoofAttempts": spoof_attempts,
        "classHeatmap": class_heatmap,
        "recentActivity": recent_activity,
        "cameraActivity": camera_activity,
        "aiInsights": ai_insights,
    }