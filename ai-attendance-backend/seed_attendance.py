import asyncio
from datetime import datetime, timezone, timedelta
from app.core.database import db

async def main():
    await db.connect()

    students = await db.student.find_many(take=20)
    cameras = await db.camera.find_many(take=5)
    sessions = await db.attendancesession.find_many(take=1)

    if not students:
        print("No students found. Add students first.")
        await db.disconnect()
        return

    camera_id = cameras[0].id if cameras else None
    session_id = sessions[0].id if sessions else None

    created = 0
    skipped = 0
    now = datetime.now(timezone.utc)

    # Use same date for today's attendance
    today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)

    for i, student in enumerate(students):
        if i % 7 == 0:
            status = "ABSENT"
            check_in_time = None
        elif i % 5 == 0:
            status = "LATE"
            check_in_time = today.replace(hour=9, minute=25) + timedelta(minutes=i)
        else:
            status = "PRESENT"
            check_in_time = today.replace(hour=9, minute=0) + timedelta(minutes=i)

        data = {
            "studentId": student.id,
            "sessionId": session_id,
            "date": today,
            "checkInTime": check_in_time,
            "status": status,
            "recognitionConfidence": 94.0 - (i % 10),
            "livenessScore": 91.0 - (i % 8),
            "source": "FACE_RECOGNITION",
        }

        if camera_id:
            data["cameraId"] = camera_id

        try:
            await db.attendancerecord.create(data=data)
            created += 1
        except Exception as e:
            # Most common reason: unique constraint studentId + date + sessionId already exists
            skipped += 1
            print(f"Skipped {student.rollNo} ({student.name}): {e}")

    print(f"Created {created} attendance records, skipped {skipped}")
    await db.disconnect()

asyncio.run(main())
