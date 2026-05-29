# from datetime import date, datetime, timedelta, timezone
# from collections import defaultdict

# from fastapi import APIRouter, Depends, Query

# from app.dependencies.auth import admin_required
# from app.core.database import db

# router = APIRouter(prefix="/reports", tags=["Reports"])


# def start_of_day(d: date):
#     return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


# def end_of_day(d: date):
#     return start_of_day(d) + timedelta(days=1)


# def percent(part: int, total: int):
#     if total <= 0:
#         return 0
#     return round((part / total) * 100, 2)


# def serialize_record(record):
#     student = record.student
#     department = getattr(student, "department", None) if student else None
#     course_class = getattr(student, "courseClass", None) if student else None
#     section = getattr(student, "section", None) if student else None
#     camera = getattr(record, "camera", None)

#     return {
#         "id": record.id,
#         "date": record.date.isoformat() if record.date else None,
#         "checkInTime": record.checkInTime.isoformat() if record.checkInTime else None,
#         "status": record.status,
#         "source": record.source,
#         "recognitionConfidence": record.recognitionConfidence,
#         "livenessScore": record.livenessScore,
#         "student": {
#             "id": student.id if student else None,
#             "name": student.name if student else "Unknown",
#             "rollNo": student.rollNo if student else None,
#             "department": {
#                 "id": department.id if department else None,
#                 "name": department.name if department else None,
#                 "code": department.code if department else None,
#             },
#             "courseClass": {
#                 "id": course_class.id if course_class else None,
#                 "name": course_class.name if course_class else None,
#             },
#             "section": {
#                 "id": section.id if section else None,
#                 "name": section.name if section else None,
#             },
#         },
#         "camera": {
#             "id": camera.id if camera else None,
#             "name": camera.name if camera else None,
#             "location": camera.location if camera else None,
#         },
#     }


# @router.get("/summary")
# async def reports_summary(
#     report_date: date | None = None,
#     current_user=Depends(admin_required),
# ):
#     target_date = report_date or datetime.now(timezone.utc).date()

#     total_students = await db.student.count()

#     records = await db.attendancerecord.find_many(
#         where={
#             "date": {
#                 "gte": start_of_day(target_date),
#                 "lt": end_of_day(target_date),
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
#     )

#     present = len([r for r in records if str(r.status).upper() == "PRESENT"])
#     late = len([r for r in records if str(r.status).upper() == "LATE"])
#     absent = max(total_students - present - late, 0)
#     spoof = len([r for r in records if "SPOOF" in str(r.status).upper()])

#     return {
#         "date": target_date.isoformat(),
#         "totalStudents": total_students,
#         "totalRecords": len(records),
#         "present": present,
#         "late": late,
#         "absent": absent,
#         "spoofAttempts": spoof,
#         "attendancePercent": percent(present + late, total_students),
#     }


# @router.get("/daily-attendance")
# async def daily_attendance_report(
#     report_date: date | None = None,
#     department_id: str | None = None,
#     class_id: str | None = None,
#     section_id: str | None = None,
#     current_user=Depends(admin_required),
# ):
#     target_date = report_date or datetime.now(timezone.utc).date()

#     where = {
#         "date": {
#             "gte": start_of_day(target_date),
#             "lt": end_of_day(target_date),
#         }
#     }

#     if department_id or class_id or section_id:
#         where["student"] = {}

#         if department_id:
#             where["student"]["departmentId"] = department_id
#         if class_id:
#             where["student"]["courseClassId"] = class_id
#         if section_id:
#             where["student"]["sectionId"] = section_id

#     records = await db.attendancerecord.find_many(
#         where=where,
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
#             "checkInTime": "asc"
#         },
#     )

#     total_students = await db.student.count()
#     present = len([r for r in records if str(r.status).upper() == "PRESENT"])
#     late = len([r for r in records if str(r.status).upper() == "LATE"])
#     absent = max(total_students - present - late, 0)

#     return {
#         "title": "Daily Attendance Report",
#         "date": target_date.isoformat(),
#         "summary": {
#             "total": total_students,
#             "present": present,
#             "late": late,
#             "absent": absent,
#             "attendancePercent": percent(present + late, total_students),
#         },
#         "records": [serialize_record(r) for r in records],
#     }


# @router.get("/monthly-attendance")
# async def monthly_attendance_report(
#     year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
#     month: int = Query(default_factory=lambda: datetime.now(timezone.utc).month),
#     current_user=Depends(admin_required),
# ):
#     start = datetime(year, month, 1, tzinfo=timezone.utc)

#     if month == 12:
#         end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
#     else:
#         end = datetime(year, month + 1, 1, tzinfo=timezone.utc)

#     records = await db.attendancerecord.find_many(
#         where={
#             "date": {
#                 "gte": start,
#                 "lt": end,
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
#     )

#     by_day = defaultdict(lambda: {"present": 0, "late": 0, "absent": 0, "total": 0})

#     for r in records:
#         key = r.date.date().isoformat()
#         by_day[key]["total"] += 1

#         s = str(r.status).upper()
#         if s == "PRESENT":
#             by_day[key]["present"] += 1
#         elif s == "LATE":
#             by_day[key]["late"] += 1
#         elif s == "ABSENT":
#             by_day[key]["absent"] += 1

#     return {
#         "title": "Monthly Attendance Report",
#         "year": year,
#         "month": month,
#         "days": [
#             {
#                 "date": k,
#                 **v,
#                 "attendancePercent": percent(v["present"] + v["late"], v["total"]),
#             }
#             for k, v in sorted(by_day.items())
#         ],
#         "records": [serialize_record(r) for r in records],
#     }


# @router.get("/class-attendance")
# async def class_attendance_report(
#     current_user=Depends(admin_required),
# ):
#     records = await db.attendancerecord.find_many(
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
#     )

#     by_class = defaultdict(lambda: {"present": 0, "late": 0, "absent": 0, "total": 0})

#     for r in records:
#         student = r.student
#         class_name = student.courseClass.name if student and student.courseClass else "Unknown"

#         by_class[class_name]["total"] += 1

#         s = str(r.status).upper()
#         if s == "PRESENT":
#             by_class[class_name]["present"] += 1
#         elif s == "LATE":
#             by_class[class_name]["late"] += 1
#         elif s == "ABSENT":
#             by_class[class_name]["absent"] += 1

#     return {
#         "title": "Class Attendance Report",
#         "classes": [
#             {
#                 "className": k,
#                 **v,
#                 "attendancePercent": percent(v["present"] + v["late"], v["total"]),
#             }
#             for k, v in sorted(by_class.items())
#         ],
#     }


# @router.get("/student-history")
# async def student_attendance_history(
#     student_id: str | None = None,
#     current_user=Depends(admin_required),
# ):
#     where = {}

#     if student_id:
#         where["studentId"] = student_id

#     records = await db.attendancerecord.find_many(
#         where=where,
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
#             "date": "desc"
#         },
#         take=200,
#     )

#     return {
#         "title": "Student Attendance History",
#         "records": [serialize_record(r) for r in records],
#     }


# @router.get("/low-attendance-risk")
# async def low_attendance_risk_report(
#     threshold: float = 75,
#     current_user=Depends(admin_required),
# ):
#     students = await db.student.find_many(
#         include={
#             "department": True,
#             "courseClass": True,
#             "section": True,
#             "attendanceRecords": True,
#         }
#     )

#     risky = []

#     for s in students:
#         total = len(s.attendanceRecords)
#         present = len([
#             r for r in s.attendanceRecords
#             if str(r.status).upper() in ["PRESENT", "LATE"]
#         ])

#         attendance_percent = percent(present, total)

#         if total > 0 and attendance_percent < threshold:
#             risky.append({
#                 "studentId": s.id,
#                 "name": s.name,
#                 "rollNo": s.rollNo,
#                 "department": s.department.name if s.department else None,
#                 "class": s.courseClass.name if s.courseClass else None,
#                 "section": s.section.name if s.section else None,
#                 "attendancePercent": attendance_percent,
#                 "totalRecords": total,
#             })

#     return {
#         "title": "Low Attendance Risk Report",
#         "threshold": threshold,
#         "students": risky,
#     }


# @router.get("/spoof-attempts")
# async def spoof_attempt_report(
#     current_user=Depends(admin_required),
# ):
#     records = await db.attendancerecord.find_many(
#         where={
#             "OR": [
#                 {"status": {"contains": "SPOOF"}},
#                 {"livenessScore": {"lt": 50}},
#             ]
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
#             "date": "desc"
#         },
#         take=200,
#     )

#     return {
#         "title": "Spoof Attempt Report",
#         "records": [serialize_record(r) for r in records],
#     }


# @router.get("/camera-activity")
# async def camera_activity_report(
#     current_user=Depends(admin_required),
# ):
#     records = await db.attendancerecord.find_many(
#         include={
#             "camera": True,
#             "student": {
#                 "include": {
#                     "department": True,
#                     "courseClass": True,
#                     "section": True,
#                 }
#             },
#         }
#     )

#     by_camera = defaultdict(lambda: {"detections": 0, "avgConfidence": 0, "avgLiveness": 0})

#     confidence_sum = defaultdict(float)
#     liveness_sum = defaultdict(float)

#     for r in records:
#         camera_name = r.camera.name if r.camera else "Unknown Camera"

#         by_camera[camera_name]["detections"] += 1
#         confidence_sum[camera_name] += r.recognitionConfidence or 0
#         liveness_sum[camera_name] += r.livenessScore or 0

#     result = []

#     for camera_name, data in by_camera.items():
#         count = data["detections"]

#         result.append({
#             "camera": camera_name,
#             "detections": count,
#             "avgConfidence": round(confidence_sum[camera_name] / count, 2) if count else 0,
#             "avgLiveness": round(liveness_sum[camera_name] / count, 2) if count else 0,
#         })

#     return {
#         "title": "Camera Activity Report",
#         "cameras": result,
#     }




from datetime import date, datetime, timedelta, timezone
from collections import defaultdict

from fastapi import APIRouter, Depends, Query

from app.dependencies.auth import admin_required
from app.core.database import db

router = APIRouter(prefix="/reports", tags=["Reports"])


def start_of_day(d: date):
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc)


def end_of_day(d: date):
    return start_of_day(d) + timedelta(days=1)


def percent(part: int, total: int):
    if total <= 0:
        return 0
    return round((part / total) * 100, 2)


def enum_value(value):
    if value is None:
        return None
    return getattr(value, "value", str(value))


def status_upper(value):
    return str(enum_value(value) or "").upper()


def serialize_record(record):
    student = getattr(record, "student", None)
    department = getattr(student, "department", None) if student else None
    course_class = getattr(student, "courseClass", None) if student else None
    section = getattr(student, "section", None) if student else None
    camera = getattr(record, "camera", None)

    return {
        "id": record.id,
        "date": record.date.isoformat() if record.date else None,
        "checkInTime": record.checkInTime.isoformat() if record.checkInTime else None,
        "status": enum_value(record.status),
        "source": enum_value(record.source),
        "recognitionConfidence": record.recognitionConfidence,
        "livenessScore": record.livenessScore,
        "student": {
            "id": student.id if student else None,
            "name": student.name if student else "Unknown",
            "rollNo": student.rollNo if student else None,
            "department": {
                "id": department.id if department else None,
                "name": department.name if department else None,
                "code": department.code if department else None,
            },
            "courseClass": {
                "id": course_class.id if course_class else None,
                "name": course_class.name if course_class else None,
            },
            "section": {
                "id": section.id if section else None,
                "name": section.name if section else None,
            },
        },
        "camera": {
            "id": camera.id if camera else None,
            "name": camera.name if camera else None,
            "location": camera.location if camera else None,
        },
    }


@router.get("/summary")
async def reports_summary(
    report_date: date | None = None,
    current_user=Depends(admin_required),
):
    target_date = report_date or datetime.now(timezone.utc).date()

    total_students = await db.student.count()

    records = await db.attendancerecord.find_many(
        where={
            "date": {
                "gte": start_of_day(target_date),
                "lt": end_of_day(target_date),
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
    )

    present = len([r for r in records if status_upper(r.status) == "PRESENT"])
    late = len([r for r in records if status_upper(r.status) == "LATE"])
    absent = max(total_students - present - late, 0)
    spoof = len([r for r in records if "SPOOF" in status_upper(r.status)])

    return {
        "date": target_date.isoformat(),
        "totalStudents": total_students,
        "totalRecords": len(records),
        "present": present,
        "late": late,
        "absent": absent,
        "spoofAttempts": spoof,
        "attendancePercent": percent(present + late, total_students),
    }


@router.get("/daily-attendance")
async def daily_attendance_report(
    report_date: date | None = None,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    current_user=Depends(admin_required),
):
    target_date = report_date or datetime.now(timezone.utc).date()

    where = {
        "date": {
            "gte": start_of_day(target_date),
            "lt": end_of_day(target_date),
        }
    }

    if department_id or class_id or section_id:
        where["student"] = {}

        if department_id:
            where["student"]["departmentId"] = department_id

        if class_id:
            where["student"]["courseClassId"] = class_id

        if section_id:
            where["student"]["sectionId"] = section_id

    records = await db.attendancerecord.find_many(
        where=where,
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
            "checkInTime": "asc",
        },
    )

    total_students = await db.student.count()
    present = len([r for r in records if status_upper(r.status) == "PRESENT"])
    late = len([r for r in records if status_upper(r.status) == "LATE"])
    absent = max(total_students - present - late, 0)

    return {
        "title": "Daily Attendance Report",
        "date": target_date.isoformat(),
        "summary": {
            "total": total_students,
            "present": present,
            "late": late,
            "absent": absent,
            "attendancePercent": percent(present + late, total_students),
        },
        "records": [serialize_record(r) for r in records],
    }


@router.get("/monthly-attendance")
async def monthly_attendance_report(
    year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
    month: int = Query(default_factory=lambda: datetime.now(timezone.utc).month),
    current_user=Depends(admin_required),
):
    start = datetime(year, month, 1, tzinfo=timezone.utc)

    if month == 12:
        end = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(year, month + 1, 1, tzinfo=timezone.utc)

    records = await db.attendancerecord.find_many(
        where={
            "date": {
                "gte": start,
                "lt": end,
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
    )

    by_day = defaultdict(lambda: {"present": 0, "late": 0, "absent": 0, "total": 0})

    for r in records:
        key = r.date.date().isoformat()
        by_day[key]["total"] += 1

        s = status_upper(r.status)
        if s == "PRESENT":
            by_day[key]["present"] += 1
        elif s == "LATE":
            by_day[key]["late"] += 1
        elif s == "ABSENT":
            by_day[key]["absent"] += 1

    return {
        "title": "Monthly Attendance Report",
        "year": year,
        "month": month,
        "days": [
            {
                "date": k,
                **v,
                "attendancePercent": percent(v["present"] + v["late"], v["total"]),
            }
            for k, v in sorted(by_day.items())
        ],
        "records": [serialize_record(r) for r in records],
    }


@router.get("/class-attendance")
async def class_attendance_report(
    current_user=Depends(admin_required),
):
    records = await db.attendancerecord.find_many(
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
    )

    by_class = defaultdict(lambda: {"present": 0, "late": 0, "absent": 0, "total": 0})

    for r in records:
        student = getattr(r, "student", None)
        class_name = (
            student.courseClass.name
            if student and getattr(student, "courseClass", None)
            else "Unknown"
        )

        by_class[class_name]["total"] += 1

        s = status_upper(r.status)
        if s == "PRESENT":
            by_class[class_name]["present"] += 1
        elif s == "LATE":
            by_class[class_name]["late"] += 1
        elif s == "ABSENT":
            by_class[class_name]["absent"] += 1

    return {
        "title": "Class Attendance Report",
        "classes": [
            {
                "className": k,
                **v,
                "attendancePercent": percent(v["present"] + v["late"], v["total"]),
            }
            for k, v in sorted(by_class.items())
        ],
    }


@router.get("/student-history")
async def student_attendance_history(
    student_id: str | None = None,
    current_user=Depends(admin_required),
):
    where = {}

    if student_id:
        where["studentId"] = student_id

    records = await db.attendancerecord.find_many(
        where=where,
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
            "date": "desc",
        },
        take=200,
    )

    return {
        "title": "Student Attendance History",
        "records": [serialize_record(r) for r in records],
    }


@router.get("/low-attendance-risk")
async def low_attendance_risk_report(
    threshold: float = 75,
    current_user=Depends(admin_required),
):
    students = await db.student.find_many(
        include={
            "department": True,
            "courseClass": True,
            "section": True,
            "attendanceRecords": True,
        }
    )

    risky = []

    for s in students:
        total = len(s.attendanceRecords)
        present = len(
            [
                r
                for r in s.attendanceRecords
                if status_upper(r.status) in ["PRESENT", "LATE"]
            ]
        )

        attendance_percent = percent(present, total)

        if total > 0 and attendance_percent < threshold:
            risky.append(
                {
                    "studentId": s.id,
                    "name": s.name,
                    "rollNo": s.rollNo,
                    "department": s.department.name if s.department else None,
                    "class": s.courseClass.name if s.courseClass else None,
                    "section": s.section.name if s.section else None,
                    "attendancePercent": attendance_percent,
                    "totalRecords": total,
                }
            )

    return {
        "title": "Low Attendance Risk Report",
        "threshold": threshold,
        "students": risky,
    }


@router.get("/spoof-attempts")
async def spoof_attempt_report(
    current_user=Depends(admin_required),
):
    # Prisma enum fields do not support contains.
    # So we fetch recent records and filter spoof attempts in Python.
    records = await db.attendancerecord.find_many(
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
            "date": "desc",
        },
        take=500,
    )

    spoof_records = []

    for r in records:
        status = status_upper(r.status)
        source = status_upper(getattr(r, "source", None))
        confidence = r.recognitionConfidence or 100
        liveness = r.livenessScore or 100

        is_spoof = (
            "SPOOF" in status
            or "SPOOF" in source
            or "BLOCK" in status
            or "BLOCK" in source
            or confidence < 50
            or liveness < 50
        )

        if is_spoof:
            spoof_records.append(r)

    return {
        "title": "Spoof Attempt Report",
        "records": [serialize_record(r) for r in spoof_records],
    }


@router.get("/camera-activity")
async def camera_activity_report(
    current_user=Depends(admin_required),
):
    records = await db.attendancerecord.find_many(
        include={
            "camera": True,
            "student": {
                "include": {
                    "department": True,
                    "courseClass": True,
                    "section": True,
                }
            },
        }
    )

    by_camera = defaultdict(lambda: {"detections": 0, "avgConfidence": 0, "avgLiveness": 0})

    confidence_sum = defaultdict(float)
    liveness_sum = defaultdict(float)

    for r in records:
        camera_name = r.camera.name if r.camera else "Unknown Camera"

        by_camera[camera_name]["detections"] += 1
        confidence_sum[camera_name] += r.recognitionConfidence or 0
        liveness_sum[camera_name] += r.livenessScore or 0

    result = []

    for camera_name, data in by_camera.items():
        count = data["detections"]

        result.append(
            {
                "camera": camera_name,
                "detections": count,
                "avgConfidence": round(confidence_sum[camera_name] / count, 2)
                if count
                else 0,
                "avgLiveness": round(liveness_sum[camera_name] / count, 2)
                if count
                else 0,
            }
        )

    return {
        "title": "Camera Activity Report",
        "cameras": result,
    }