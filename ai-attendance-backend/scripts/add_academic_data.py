import asyncio

from app.core.database import db


ACADEMIC_DATA = [
    {
        "department": "Computer Science Engineering",
        "department_code": "CSE",
        "classes": [
            "BCA",
            "B.Tech CSE",
            "MCA",
        ],
        "sections": ["A", "B", "C"],
    },
    {
        "department": "Information Technology",
        "department_code": "IT",
        "classes": [
            "B.Tech IT",
            "M.Tech IT",
        ],
        "sections": ["A", "B"],
    },
    {
        "department": "Electronics and Communication",
        "department_code": "ECE",
        "classes": [
            "B.Tech ECE",
            "M.Tech ECE",
        ],
        "sections": ["A", "B"],
    },
    {
        "department": "Mechanical Engineering",
        "department_code": "ME",
        "classes": [
            "B.Tech ME",
            "M.Tech ME",
        ],
        "sections": ["A", "B"],
    },
    {
        "department": "Business Administration",
        "department_code": "BA",
        "classes": [
            "BBA",
            "MBA",
        ],
        "sections": ["A", "B"],
    },
]


async def get_or_create_department(name: str, code: str):
    existing = await db.department.find_first(
        where={
            "OR": [
                {"code": code},
                {"name": name},
            ]
        }
    )

    if existing:
        return existing

    return await db.department.create(
        data={
            "name": name,
            "code": code,
        }
    )


async def get_or_create_class(name: str, department_id: str):
    existing = await db.courseclass.find_first(
        where={
            "departmentId": department_id,
            "name": name,
        }
    )

    if existing:
        return existing

    return await db.courseclass.create(
        data={
            "departmentId": department_id,
            "name": name,
        }
    )


async def get_or_create_section(name: str, class_id: str):
    existing = await db.section.find_first(
        where={
            "classId": class_id,
            "name": name,
        }
    )

    if existing:
        return existing

    return await db.section.create(
        data={
            "classId": class_id,
            "name": name,
        }
    )


async def main():
    await db.connect()

    try:
        for item in ACADEMIC_DATA:
            department = await get_or_create_department(
                item["department"],
                item["department_code"],
            )

            for class_name in item["classes"]:
                course_class = await get_or_create_class(
                    class_name,
                    department.id,
                )

                for section_name in item["sections"]:
                    await get_or_create_section(
                        section_name,
                        course_class.id,
                    )

        print("Academic data added successfully.")

    finally:
        await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
