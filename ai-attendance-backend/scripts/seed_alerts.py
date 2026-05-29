import asyncio
from app.core.database import db

ALERTS = [
    {
        "type": "SPOOF_ATTEMPT",
        "severity": "CRITICAL",
        "title": "Spoof Attempt",
        "message": "Main Gate · Mobile screen detected, liveness 18%",
        "status": "OPEN",
    },
    {
        "type": "UNKNOWN_FACE",
        "severity": "HIGH",
        "title": "Unknown Face",
        "message": "Lab Block · Unregistered face seen 4 times",
        "status": "IN_PROGRESS",
    },
    {
        "type": "CAMERA_DEGRADED",
        "severity": "MEDIUM",
        "title": "Camera Degraded",
        "message": "Library Entrance · Stream quality degraded",
        "status": "OPEN",
    },
    {
        "type": "CAMERA_OFFLINE",
        "severity": "HIGH",
        "title": "Camera Offline",
        "message": "Back Gate · Camera disconnected from network",
        "status": "OPEN",
    },
    {
        "type": "SPOOF_ATTEMPT",
        "severity": "CRITICAL",
        "title": "Spoof Attempt",
        "message": "Admin Block · Printed photo detected",
        "status": "RESOLVED",
    },
    {
        "type": "UNKNOWN_FACE",
        "severity": "HIGH",
        "title": "Unknown Face",
        "message": "Parking Area · Unknown person detected after hours",
        "status": "RESOLVED",
    },
]


async def main():
    await db.connect()

    await db.incidentevidence.delete_many()
    await db.alert.delete_many()

    for item in ALERTS:
        created = await db.alert.create(data=item)
        print(f"created {created.id} - {created.title}")

    await db.disconnect()


asyncio.run(main())
