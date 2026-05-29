from pydantic import BaseModel, EmailStr


class StudentCreate(BaseModel):
    email: EmailStr
    password: str
    roll_no: str
    name: str
    department_id: str | None = None
    class_id: str | None = None
    section_id: str | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address: str | None = None


class StudentUpdate(BaseModel):
    name: str | None = None
    department_id: str | None = None
    class_id: str | None = None
    section_id: str | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address: str | None = None
    status: str | None = None
    consent_status: str | None = None


class StudentSearchParams(BaseModel):
    search: str | None = None
    department_id: str | None = None
    class_id: str | None = None
    section_id: str | None = None
    status: str | None = None