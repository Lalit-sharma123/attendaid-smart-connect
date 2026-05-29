from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    role: str
    phone: str | None = None


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    status: str