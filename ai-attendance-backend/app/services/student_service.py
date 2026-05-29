from fastapi import HTTPException

from app.core.database import db
from app.core.security import hash_password


async def create_student(payload):
    role = await db.role.find_unique(where={"name": "STUDENT"})
    if not role:
        raise HTTPException(status_code=400, detail="STUDENT role not seeded")

    existing_user = await db.user.find_unique(where={"email": payload.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    existing_roll = await db.student.find_unique(where={"rollNo": payload.roll_no})
    if existing_roll:
        raise HTTPException(status_code=400, detail="Roll number already exists")

    user = await db.user.create(
        data={
            "email": payload.email,
            "passwordHash": hash_password(payload.password),
            "roleId": role.id,
            "status": "ACTIVE",
        }
    )

    student = await db.student.create(
        data={
            "userId": user.id,
            "rollNo": payload.roll_no,
            "name": payload.name,
            "departmentId": payload.department_id,
            "classId": payload.class_id,
            "sectionId": payload.section_id,
            "contactEmail": payload.contact_email,
            "contactPhone": payload.contact_phone,
            "address": payload.address,
            "status": "ACTIVE",
            "consentStatus": "PENDING",
        },
        include={
            "user": True,
            "department": True,
            "courseClass": True,
            "section": True,
        },
    )

    await db.faceenrollment.create(
        data={
            "studentId": student.id,
            "status": "NOT_ENROLLED",
        }
    )

    return student


async def list_students(
    search: str | None = None,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    status: str | None = None,
    skip: int = 0,
    take: int = 20,
):
    where = {}

    if department_id:
        where["departmentId"] = department_id
    if class_id:
        where["classId"] = class_id
    if section_id:
        where["sectionId"] = section_id
    if status:
        where["status"] = status

    if search:
        where["OR"] = [
            {"name": {"contains": search, "mode": "insensitive"}},
            {"rollNo": {"contains": search, "mode": "insensitive"}},
            {"contactEmail": {"contains": search, "mode": "insensitive"}},
        ]

    students = await db.student.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"createdAt": "desc"},
        include={
            "user": True,
            "department": True,
            "courseClass": True,
            "section": True,
            "faceEnrollment": True,
        },
    )

    total = await db.student.count(where=where)

    return {
        "items": students,
        "total": total,
        "skip": skip,
        "take": take,
    }


async def get_student(student_id: str):
    student = await db.student.find_unique(
        where={"id": student_id},
        include={
            "user": True,
            "department": True,
            "courseClass": True,
            "section": True,
            "faceEnrollment": {
                "include": {
                    "samples": True,
                    "embeddings": True,
                }
            },
        },
    )

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student


async def update_student(student_id: str, payload):
    existing = await db.student.find_unique(where={"id": student_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Student not found")

    data = {}

    mapping = {
        "name": "name",
        "department_id": "departmentId",
        "class_id": "classId",
        "section_id": "sectionId",
        "contact_email": "contactEmail",
        "contact_phone": "contactPhone",
        "address": "address",
        "status": "status",
        "consent_status": "consentStatus",
    }

    for input_key, db_key in mapping.items():
        value = getattr(payload, input_key)
        if value is not None:
            data[db_key] = value

    return await db.student.update(
        where={"id": student_id},
        data=data,
        include={
            "department": True,
            "courseClass": True,
            "section": True,
        },
    )


async def delete_student(student_id: str):
    student = await db.student.find_unique(where={"id": student_id})

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    user_id = student.userId

    # Permanently delete student from DB.
    # Attendance records should cascade because schema has:
    # AttendanceRecord.student onDelete: Cascade
    await db.student.delete(where={"id": student_id})

    # Permanently delete linked login account also
    if user_id:
        try:
            await db.user.delete(where={"id": user_id})
        except Exception:
            # If user is already deleted or protected by another relation, ignore here
            pass

    return {"message": "Student permanently deleted"}
