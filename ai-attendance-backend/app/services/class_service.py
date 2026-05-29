from fastapi import HTTPException

from app.core.database import db


async def create_department(name: str, code: str):
    existing = await db.department.find_unique(where={"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Department code already exists")

    return await db.department.create(data={"name": name, "code": code})


async def list_departments():
    return await db.department.find_many(
        include={
            "classes": {
                "include": {
                    "sections": True
                }
            }
        },
        order={"createdAt": "desc"},
    )


async def create_class(department_id: str, name: str):
    department = await db.department.find_unique(where={"id": department_id})
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")

    return await db.courseclass.create(
        data={
            "departmentId": department_id,
            "name": name,
        }
    )


async def create_section(class_id: str, name: str):
    course_class = await db.courseclass.find_unique(where={"id": class_id})
    if not course_class:
        raise HTTPException(status_code=404, detail="Class not found")

    return await db.section.create(
        data={
            "classId": class_id,
            "name": name,
        }
    )