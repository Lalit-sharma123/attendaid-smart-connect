from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.database import db
from app.dependencies.auth import admin_required

router = APIRouter()


class AssignPermissionRequest(BaseModel):
    permission_key: str


@router.get("")
async def list_roles(current_user=Depends(admin_required)):
    return await db.role.find_many(
        include={
            "permissions": {
                "include": {
                    "permission": True
                }
            },
            "users": True,
        },
        order={"createdAt": "asc"},
    )


@router.get("/permissions")
async def list_permissions(current_user=Depends(admin_required)):
    return await db.permission.find_many(order={"createdAt": "asc"})


@router.post("/{role_id}/permissions")
async def assign_permission_to_role(
    role_id: str,
    payload: AssignPermissionRequest,
    current_user=Depends(admin_required),
):
    role = await db.role.find_unique(where={"id": role_id})
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    permission = await db.permission.find_unique(where={"key": payload.permission_key})
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")

    existing = await db.rolepermission.find_first(
        where={
            "roleId": role_id,
            "permissionId": permission.id,
        }
    )

    if existing:
        return existing

    return await db.rolepermission.create(
        data={
            "roleId": role_id,
            "permissionId": permission.id,
        }
    )


@router.delete("/{role_id}/permissions/{permission_id}")
async def remove_permission_from_role(
    role_id: str,
    permission_id: str,
    current_user=Depends(admin_required),
):
    existing = await db.rolepermission.find_first(
        where={
            "roleId": role_id,
            "permissionId": permission_id,
        }
    )

    if not existing:
        raise HTTPException(status_code=404, detail="Role permission not found")

    await db.rolepermission.delete(where={"id": existing.id})

    return {"message": "Permission removed"}