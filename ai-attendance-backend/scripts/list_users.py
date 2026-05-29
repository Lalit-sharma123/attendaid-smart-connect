import asyncio
from app.core.database import db

async def main():
    await db.connect()
    try:
        users = await db.user.find_many(
            include={"role": True},
            order={"email": "asc"},
        )

        for u in users:
            role = u.role.name if u.role else "-"
            print(f"{u.email} | status={u.status} | role={role}")
    finally:
        await db.disconnect()

asyncio.run(main())
