import random
from datetime import datetime, timezone, timedelta

from app.core.database import db


def ai_insight_to_alert_type(insight_type: str) -> str:
    value = str(insight_type or "").upper()

    if "SPOOF" in value:
        return "SPOOF_ATTEMPT"
    if "UNKNOWN" in value or "FACE" in value:
        return "UNKNOWN_FACE"
    if "CAMERA" in value and "OFFLINE" in value:
        return "CAMERA_OFFLINE"
    if "CAMERA" in value:
        return "CAMERA_DEGRADED"
    if "ATTENDANCE" in value:
        return "LOW_ATTENDANCE"
    if "LIVENESS" in value:
        return "LIVENESS_FAILED"
    if "RECOGNITION" in value:
        return "FAILED_RECOGNITION"
    if "ALERT" in value:
        return "SYSTEM_ERROR"

    return "SYSTEM_ERROR"


async def create_alert_from_ai_insight(insight):
    alert_type = ai_insight_to_alert_type(insight.type)

    existing = await db.alert.find_first(
        where={
            "type": alert_type,
            "title": insight.title,
            "message": insight.description,
        }
    )

    if existing:
        return existing

    return await db.alert.create(
        data={
            "type": alert_type,
            "severity": insight.severity,
            "title": insight.title,
            "message": insight.description,
            "status": "OPEN",
        }
    )


async def create_ai_insight(payload):
    insight = await db.aiinsight.create(
        data={
            "type": payload.type,
            "title": payload.title,
            "description": payload.description,
            "severity": payload.severity,
            "confidence": payload.confidence,
            "recommendedAction": payload.recommended_action,
            "metadata": payload.metadata,
        }
    )

    await create_alert_from_ai_insight(insight)

    return insight


async def list_ai_insights(severity: str | None = None):
    where = {}

    if severity:
        where["severity"] = severity

    return await db.aiinsight.find_many(
        where=where,
        order={"createdAt": "desc"},
        take=100,
    )


async def generate_basic_ai_recommendations():
    total_students = await db.student.count(where={"status": "ACTIVE"})
    enrolled_faces = await db.faceenrollment.count(where={"status": "ENROLLED"})
    open_alerts = await db.alert.count(where={"status": "OPEN"})
    offline_cameras = await db.camera.count(where={"status": "OFFLINE", "enabled": True})

    recommendations = []

    if total_students > 0:
        pending_faces = total_students - enrolled_faces
        if pending_faces > 0:
            recommendations.append({
                "type": "FACE_ENROLLMENT",
                "severity": "MEDIUM",
                "title": "Pending face enrollments",
                "description": f"{pending_faces} students still need face enrollment.",
                "recommended_action": "Ask admin to complete face enrollment for pending students.",
            })

    if open_alerts > 0:
        recommendations.append({
            "type": "ALERTS",
            "severity": "HIGH",
            "title": "Open alerts need review",
            "description": f"{open_alerts} alerts are still open.",
            "recommended_action": "Review and resolve high severity alerts.",
        })

    if offline_cameras > 0:
        recommendations.append({
            "type": "CAMERA_HEALTH",
            "severity": "HIGH",
            "title": "Offline cameras detected",
            "description": f"{offline_cameras} enabled cameras are offline.",
            "recommended_action": "Check camera network, RTSP URL, and power connection.",
        })

    if not recommendations:
        recommendations.append({
            "type": "SYSTEM_OK",
            "severity": "INFO",
            "title": "System looks healthy",
            "description": "No major issues detected.",
            "recommended_action": "Continue monitoring attendance and camera health.",
        })

    created = []

    for rec in recommendations:
        insight = await db.aiinsight.create(
            data={
                "type": rec["type"],
                "title": rec["title"],
                "description": rec["description"],
                "severity": rec["severity"],
                "confidence": 0.85,
                "recommendedAction": rec["recommended_action"],
                # Prisma Python may fail on Json metadata in your setup, so keep this off for now.
                # "metadata": {
                #     "generated_at": datetime.now(timezone.utc).isoformat()
                # },
            }
        )

        await create_alert_from_ai_insight(insight)

        created.append(insight)

    return created


async def ai_assistant_reply(message: str):
    lower = message.lower()

    if "attendance" in lower:
        total_records = await db.attendancerecord.count()
        return {
            "reply": f"There are {total_records} attendance records in the system. You can view them from Attendance Records.",
            "type": "attendance_help",
        }

    if "camera" in lower:
        total_cameras = await db.camera.count()
        offline = await db.camera.count(where={"status": "OFFLINE"})
        return {
            "reply": f"There are {total_cameras} cameras. {offline} cameras are currently offline.",
            "type": "camera_help",
        }

    if "student" in lower:
        total_students = await db.student.count(where={"status": "ACTIVE"})
        return {
            "reply": f"There are {total_students} active students. You can add, search, filter, update, or delete students from the admin panel.",
            "type": "student_help",
        }

    if "alert" in lower:
        open_alerts = await db.alert.count(where={"status": "OPEN"})
        return {
            "reply": f"There are {open_alerts} open alerts. Please review high severity alerts first.",
            "type": "alert_help",
        }

    return {
        "reply": "I can help with students, attendance, cameras, alerts, face enrollment, and system health.",
        "type": "general_help",
    }


async def mock_real_face_analysis(payload):
    confidence = round(random.uniform(0.70, 0.99), 2)
    liveness = round(random.uniform(0.60, 0.99), 2)
    spoof_score = round(1 - liveness, 2)

    anti_spoof_status = "REAL"
    if spoof_score > 0.45:
        anti_spoof_status = "SPOOF"
    elif spoof_score > 0.30:
        anti_spoof_status = "UNCERTAIN"

    return {
        "student_id": payload.student_id,
        "image_url": payload.image_url,
        "face_detected": True,
        "recognition_confidence": confidence,
        "liveness_score": liveness,
        "spoof_score": spoof_score,
        "anti_spoof_status": anti_spoof_status,
        "model_name": "mock-advanced-face-model",
        "model_version": "v2",
        "recommendation": "Accept" if anti_spoof_status == "REAL" else "Review required",
    }


async def create_low_attendance_risks():
    students = await db.student.find_many(where={"status": "ACTIVE"})
    created = []

    today = datetime.now(timezone.utc)
    start = today - timedelta(days=30)

    for student in students:
        total = await db.attendancerecord.count(
            where={
                "studentId": student.id,
                "date": {
                    "gte": start
                }
            }
        )

        present = await db.attendancerecord.count(
            where={
                "studentId": student.id,
                "date": {
                    "gte": start
                },
                "status": {
                    "in": ["PRESENT", "LATE", "MANUAL_CORRECTED"]
                }
            }
        )

        percentage = 0.0
        if total > 0:
            percentage = round((present / total) * 100, 2)

        if total > 0 and percentage < 75:
            risk_level = "HIGH" if percentage < 50 else "MEDIUM"

            risk = await db.lowattendancerisk.create(
                data={
                    "studentId": student.id,
                    "attendancePercentage": percentage,
                    "riskLevel": risk_level,
                    "reason": "Attendance below threshold in last 30 days",
                    "recommendedAction": "Contact student/guardian and review attendance pattern.",
                }
            )

            created.append(risk)

    return created
