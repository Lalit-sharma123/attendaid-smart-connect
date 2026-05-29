from pydantic import BaseModel


class DepartmentCreate(BaseModel):
    name: str
    code: str


class ClassCreate(BaseModel):
    department_id: str
    name: str


class SectionCreate(BaseModel):
    class_id: str
    name: str