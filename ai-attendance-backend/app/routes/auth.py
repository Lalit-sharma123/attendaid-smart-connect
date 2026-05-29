from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr

from app.services.auth_service import (
    login_user,
    create_user,
    create_admin_account,
    create_student_account,
    send_password_reset_otp,
    verify_password_reset_otp,
    reset_password_with_otp,
)

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "STUDENT"
    phone: str | None = None


class AdminRegisterRequest(BaseModel):
    email: str
    password: str
    phone: str | None = None


class StudentRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    phone: str | None = None
    name: str
    roll_no: str
    department_id: str | None = None
    class_id: str | None = None
    section_id: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: str


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str


@router.post("/login")
async def login(payload: LoginRequest, request: Request):
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await login_user(payload.email, payload.password, ip, user_agent)


@router.post("/register")
async def register(payload: RegisterRequest):
    return await create_user(
        email=payload.email,
        password=payload.password,
        role_name=payload.role,
        phone=payload.phone,
    )


@router.post("/register/admin")
async def register_admin(payload: AdminRegisterRequest):
    return await create_admin_account(
        email=payload.email,
        password=payload.password,
        phone=payload.phone,
    )


@router.post("/register/student")
async def register_student(payload: StudentRegisterRequest):
    return await create_student_account(
        email=payload.email,
        password=payload.password,
        roll_no=payload.roll_no,
        name=payload.name,
        department_id=payload.department_id,
        class_id=payload.class_id,
        section_id=payload.section_id,
        phone=payload.phone,
    )


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    return await send_password_reset_otp(payload.email)


@router.post("/verify-otp")
async def verify_otp(payload: VerifyOtpRequest):
    return await verify_password_reset_otp(payload.email, payload.otp)


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    return await reset_password_with_otp(
        email=payload.email,
        otp=payload.otp,
        new_password=payload.new_password,
    )
