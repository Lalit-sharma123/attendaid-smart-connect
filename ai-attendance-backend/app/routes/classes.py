# from fastapi import APIRouter, Depends

# from app.dependencies.auth import admin_required
# from app.schemas.class_schema import DepartmentCreate, ClassCreate, SectionCreate
# from app.services.class_service import (
#     create_department,
#     list_departments,
#     create_class,
#     create_section,
# )

# router = APIRouter()


# @router.post("/departments")
# async def add_department(payload: DepartmentCreate, current_user=Depends(admin_required)):
#     return await create_department(payload.name, payload.code)


# @router.get("/departments")
# async def get_departments(current_user=Depends(admin_required)):
#     return await list_departments()


# @router.post("/classes")
# async def add_class(payload: ClassCreate, current_user=Depends(admin_required)):
#     return await create_class(payload.department_id, payload.name)


# @router.post("/sections")
# async def add_section(payload: SectionCreate, current_user=Depends(admin_required)):
#     return await create_section(payload.class_id, payload.name)



from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.database import db
from app.dependencies.auth import admin_required, teacher_admin_required

router = APIRouter()


class DepartmentCreate(BaseModel):
    name: str


class ClassCreate(BaseModel):
    name: str
    department_id: str


class SectionCreate(BaseModel):
    name: str
    class_id: str | None = None
    class_room_id: str | None = None


@router.get("/departments")
async def get_departments(current_user=Depends(teacher_admin_required)):
    departments = await db.department.find_many(
        include={
            "classes": {
                "include": {
                    "sections": True,
                }
            }
        },
        order={
            "name": "asc",
        },
    )

    return [
        {
            "id": dept.id,
            "name": dept.name,
            "classes": [
                {
                    "id": cls.id,
                    "name": cls.name,
                    "sections": [
                        {
                            "id": sec.id,
                            "name": sec.name,
                        }
                        for sec in (cls.sections or [])
                    ],
                }
                for cls in (dept.classes or [])
            ],
        }
        for dept in departments
    ]


@router.post("/departments")
async def create_department(
    payload: DepartmentCreate,
    current_user=Depends(admin_required),
):
    return await db.department.create(
        data={
            "name": payload.name,
        }
    )


@router.get("/classes")
async def get_classes(
    department_id: str | None = None,
    current_user=Depends(teacher_admin_required),
):
    where = {}
    if department_id:
        where["departmentId"] = department_id

    classes = await db.courseclass.find_many(
        where=where,
        include={
            "department": True,
            "sections": True,
        },
        order={
            "name": "asc",
        },
    )

    return [
        {
            "id": cls.id,
            "name": cls.name,
            "department_id": cls.departmentId,
            "department": {
                "id": cls.department.id,
                "name": cls.department.name,
            } if cls.department else None,
            "sections": [
                {
                    "id": sec.id,
                    "name": sec.name,
                }
                for sec in (cls.sections or [])
            ],
        }
        for cls in classes
    ]


@router.post("/classes")
async def create_class(
    payload: ClassCreate,
    current_user=Depends(admin_required),
):
    return await db.courseclass.create(
        data={
            "name": payload.name,
            "departmentId": payload.department_id,
        }
    )


@router.get("/sections")
async def get_sections(
    class_id: str | None = None,
    class_room_id: str | None = None,
    current_user=Depends(teacher_admin_required),
):
    selected_class_id = class_id or class_room_id

    where = {}
    if selected_class_id:
        where["classId"] = selected_class_id

    sections = await db.section.find_many(
        where=where,
        include={
            "courseClass": True,
        },
        order={
            "name": "asc",
        },
    )

    return [
        {
            "id": sec.id,
            "name": sec.name,
            "class_id": sec.classId,
            "class_room_id": sec.classId,
            "class": {
                "id": sec.courseClass.id,
                "name": sec.courseClass.name,
            } if sec.courseClass else None,
        }
        for sec in sections
    ]


@router.post("/sections")
async def create_section(
    payload: SectionCreate,
    current_user=Depends(admin_required),
):
    selected_class_id = payload.class_id or payload.class_room_id

    if not selected_class_id:
        return {
            "error": "class_id is required",
        }

    return await db.section.create(
        data={
            "name": payload.name,
            "classId": selected_class_id,
        }
    )