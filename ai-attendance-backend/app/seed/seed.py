import asyncio

from app.core.database import db
from app.core.security import hash_password


PERMISSIONS = [
    "users:read",
    "users:create",
    "users:update",
    "users:delete",

    "students:read",
    "students:create",
    "students:update",
    "students:delete",

    "classes:read",
    "classes:create",
    "classes:update",
    "classes:delete",

    "attendance:read",
    "attendance:create",
    "attendance:update",
    "attendance:export",

    "face:read",
    "face:enroll",

    "dashboard:read",
    "audit:read",
]


ROLE_PERMISSIONS = {
    "SUPER_ADMIN": PERMISSIONS,
    "ADMIN": [
        "students:read",
        "students:create",
        "students:update",
        "students:delete",
        "classes:read",
        "classes:create",
        "classes:update",
        "attendance:read",
        "attendance:update",
        "attendance:export",
        "face:read",
        "face:enroll",
        "dashboard:read",
        "audit:read",
    ],
    "TEACHER": [
        "students:read",
        "attendance:read",
        "attendance:create",
        "dashboard:read",
    ],
    "STUDENT": [
        "attendance:create",
    ],
    "VIEWER": [
        "students:read",
        "attendance:read",
        "dashboard:read",
    ],
}


async def seed():
    await db.connect()

    permission_records = {}

    for key in PERMISSIONS:
        permission = await db.permission.upsert(
            where={"key": key},
            data={
                "create": {
                    "key": key,
                    "description": key.replace(":", " "),
                },
                "update": {},
            },
        )
        permission_records[key] = permission

    for role_name, permissions in ROLE_PERMISSIONS.items():
        role = await db.role.upsert(
            where={"name": role_name},
            data={
                "create": {
                    "name": role_name,
                    "description": role_name.replace("_", " ").title(),
                },
                "update": {},
            },
        )

        for permission_key in permissions:
            permission = permission_records[permission_key]

            existing = await db.rolepermission.find_first(
                where={
                    "roleId": role.id,
                    "permissionId": permission.id,
                }
            )

            if not existing:
                await db.rolepermission.create(
                    data={
                        "roleId": role.id,
                        "permissionId": permission.id,
                    }
                )

    super_admin_role = await db.role.find_unique(where={"name": "SUPER_ADMIN"})

    existing_admin = await db.user.find_unique(where={"email": "admin@attendaid.com"})

    if not existing_admin:
        await db.user.create(
            data={
                "email": "admin@attendaid.com",
                "passwordHash": hash_password("Admin@123"),
                "roleId": super_admin_role.id,
                "status": "ACTIVE",
            }
        )

    await db.disconnect()

    print("Seed completed")
    print("Admin email: admin@attendaid.com")
    print("Admin password: Admin@123")


if __name__ == "__main__":
    asyncio.run(seed())