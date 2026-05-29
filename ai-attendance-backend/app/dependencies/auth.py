from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.database import db
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.user.find_unique(
        where={"id": user_id},
        include={
            "role": {
                "include": {
                    "permissions": {
                        "include": {
                            "permission": True
                        }
                    }
                }
            },
            "student": True,
        },
    )

    if not user or user.status != "ACTIVE":
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user


def require_roles(*roles: str) -> Callable:
    async def dependency(current_user=Depends(get_current_user)):
        if current_user.role.name not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role permission",
            )
        return current_user

    return dependency


def require_permissions(*permissions: str) -> Callable:
    async def dependency(current_user=Depends(get_current_user)):
        user_permissions = {
            rp.permission.key
            for rp in current_user.role.permissions
        }

        missing = set(permissions) - user_permissions

        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permissions: {', '.join(missing)}",
            )

        return current_user

    return dependency


admin_required = require_roles("SUPER_ADMIN", "ADMIN")
teacher_admin_required = require_roles("SUPER_ADMIN", "ADMIN", "TEACHER")
student_required = require_roles("STUDENT")