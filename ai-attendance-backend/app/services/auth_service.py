from datetime import datetime, timedelta, timezone
import random

from fastapi import HTTPException

from app.core.database import db
from app.core.security import verify_password, hash_password, create_access_token
from app.core.email import send_email
import hashlib


def _now():
    return datetime.now(timezone.utc)


async def _get_role(role_name: str):
    role = await db.role.find_unique(where={"name": role_name})
    if not role:
        raise HTTPException(status_code=400, detail=f"{role_name} role not found")
    return role


async def _get_user_permissions(role_id: str):
    rows = await db.rolepermission.find_many(
        where={"roleId": role_id},
        include={"permission": True},
    )

    permissions = []
    for row in rows:
        if row.permission:
            permissions.append(row.permission.key)

    return permissions


async def login_user(email: str, password: str, ip: str | None = None, user_agent: str | None = None):
    user = await db.user.find_unique(
        where={"email": email},
        include={"role": True, "student": True},
    )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if str(user.status) != "ACTIVE":
        raise HTTPException(status_code=403, detail="Account is not active")

    if not verify_password(password, user.passwordHash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    permissions = await _get_user_permissions(user.roleId)

    student_id = user.student.id if user.student else None
    role_name = str(user.role.name) if user.role else None

    token = create_access_token(
        subject=user.id,
        extra={
            "email": user.email,
            "role": role_name,
            "permissions": permissions,
            "student_id": student_id,
        },
    )

    await db.user.update(
        where={"id": user.id},
        data={"lastLoginAt": _now()},
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": role_name,
            "permissions": permissions,
            "student_id": student_id,
        },
    }


async def create_user(email: str, password: str, role_name: str, phone: str | None = None):
    existing = await db.user.find_unique(where={"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    role = await _get_role(role_name)

    user = await db.user.create(
        data={
            "email": email,
            "phone": phone,
            "passwordHash": hash_password(password),
            "roleId": role.id,
            "status": "ACTIVE",
        },
        include={"role": True},
    )

    return {
        "id": user.id,
        "email": user.email,
        "role": str(user.role.name) if user.role else role_name,
        "status": str(user.status),
    }


async def create_admin_account(email: str, password: str, phone: str | None = None):
    return await create_user(email=email, password=password, role_name="ADMIN", phone=phone)


async def create_student_account(
    email: str,
    password: str,
    roll_no: str,
    name: str,
    department_id: str | None = None,
    class_id: str | None = None,
    section_id: str | None = None,
    phone: str | None = None,
):
    existing_user = await db.user.find_unique(where={"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    existing_student = await db.student.find_unique(where={"rollNo": roll_no})
    if existing_student:
        raise HTTPException(status_code=400, detail="Roll number already exists")

    role = await _get_role("STUDENT")

    user = await db.user.create(
        data={
            "email": email,
            "phone": phone,
            "passwordHash": hash_password(password),
            "roleId": role.id,
            "status": "ACTIVE",
        }
    )

    student_data = {
        "user": {
            "connect": {
                "id": user.id,
            }
        },
        "rollNo": roll_no,
        "name": name,
        "status": "ACTIVE",
    }

    if department_id:
        student_data["department"] = {
            "connect": {
                "id": department_id,
            }
        }

    if class_id:
        student_data["courseClass"] = {
            "connect": {
                "id": class_id,
            }
        }

    if section_id:
        student_data["section"] = {
            "connect": {
                "id": section_id,
            }
        }

    student = await db.student.create(
        data=student_data,
        include={
            "user": True,
            "department": True,
            "courseClass": True,
            "section": True,
        },
    )

    return {
        "id": student.id,
        "user_id": user.id,
        "email": user.email,
        "roll_no": student.rollNo,
        "name": student.name,
        "department": student.department.name if student.department else None,
        "class": student.courseClass.name if student.courseClass else None,
        "section": student.section.name if student.section else None,
    }




def _hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode("utf-8")).hexdigest()

async def send_password_reset_otp(email: str):
    user = await db.user.find_unique(where={"email": email})

    # Do not reveal if email exists
    if not user:
        return {"message": "If this email exists, OTP has been sent"}

    otp = str(random.randint(100000, 999999))
    expires_at = _now() + timedelta(minutes=10)

    # mark old tokens used for same user
    old_tokens = await db.passwordresettoken.find_many(
        where={
            "userId": user.id,
            "usedAt": None,
        }
    )

    for t in old_tokens:
        await db.passwordresettoken.update(
            where={"id": t.id},
            data={"usedAt": _now()},
        )

    await db.passwordresettoken.create(
        data={
            "userId": user.id,
            "tokenHash": _hash_otp(otp),
            "expiresAt": expires_at,
        }
    )

    send_email(
        to_email=user.email,
        subject="SmartAttend Password Reset OTP",
        body=f"Your SmartAttend password reset OTP is: {otp}\n\nThis OTP expires in 10 minutes.",
    )

    return {"message": "If this email exists, OTP has been sent"}


async def verify_password_reset_otp(email: str, otp: str):
    user = await db.user.find_unique(where={"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    token = await db.passwordresettoken.find_first(
        where={
            "userId": user.id,
            "tokenHash": _hash_otp(otp),
            "usedAt": None,
            "expiresAt": {"gt": _now()},
        },
        order={"createdAt": "desc"},
    )

    if not token:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    return {"message": "OTP verified"}


async def reset_password_with_otp(email: str, otp: str, new_password: str):
    user = await db.user.find_unique(where={"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    token = await db.passwordresettoken.find_first(
        where={
            "userId": user.id,
            "tokenHash": _hash_otp(otp),
            "usedAt": None,
            "expiresAt": {"gt": _now()},
        },
        order={"createdAt": "desc"},
    )

    if not token:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    await db.user.update(
        where={"id": user.id},
        data={
            "passwordHash": hash_password(new_password),
            "status": "ACTIVE",
        },
    )

    await db.passwordresettoken.update(
        where={"id": token.id},
        data={"usedAt": _now()},
    )

    return {"message": "Password reset successfully"}
