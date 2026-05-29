import asyncio
from passlib.context import CryptContext
from app.core.database import db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

EMAIL = "amehra@uni.edu"
NEW_PASSWORD = "Admin@123"

async def main():
    await db.connect()
    try:
        user = await db.user.find_unique(where={"email": EMAIL})
        if not user:
            print(f"User not found: {EMAIL}")
            return

        await db.user.update(
            where={"id": user.id},
            data={
                "passwordHash": pwd_context.hash(NEW_PASSWORD),
                "status": "ACTIVE",
            },
        )

        print(f"Password reset OK: {EMAIL} / {NEW_PASSWORD}")
    finally:
        await db.disconnect()

asyncio.run(main())
