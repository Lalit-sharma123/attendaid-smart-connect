from fastapi import APIRouter, Depends, Query

from app.dependencies.auth import admin_required
from app.schemas.student_schema import StudentCreate, StudentUpdate
from app.services.student_service import (
    create_student,
    list_students,
    get_student,
    update_student,
    delete_student,
)
from app.services.student_service import delete_student
router = APIRouter()


@router.post("")
async def add_student(payload: StudentCreate, current_user=Depends(admin_required)):
    return await create_student(payload)


@router.get("")
async def get_students(
    search: str | None = None,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    status: str | None = None,
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
    current_user=Depends(admin_required),
):
    return await list_students(
        search=search,
        department_id=department_id,
        class_id=class_id,
        section_id=section_id,
        status=status,
        skip=skip,
        take=take,
    )


@router.get("/{student_id}")
async def get_one_student(student_id: str, current_user=Depends(admin_required)):
    return await get_student(student_id)


@router.patch("/{student_id}")
async def edit_student(
    student_id: str,
    payload: StudentUpdate,
    current_user=Depends(admin_required),
):
    return await update_student(student_id, payload)


@router.delete("/{student_id}")
async def remove_student(student_id: str, current_user=Depends(admin_required)):
    return await delete_student(student_id)



@router.delete("/{student_id}")
async def delete_student_route(
    student_id: str,
    current_user=Depends(admin_required),
):
    return await delete_student(student_id)