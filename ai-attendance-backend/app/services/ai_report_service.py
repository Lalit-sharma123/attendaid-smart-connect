from __future__ import annotations
import os
import json
from datetime import datetime, timezone,timedelta
from typing import Any
from app.core.config import get_settings
import httpx

from app.core.database import db
from app.core.config import get_settings


OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://111.118.189.124:11435/api/generate",
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "gpt-oss:120b",
)





def _safe_number(value: Any, default: float = 0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except Exception:
        return default


# async def _call_ollama(prompt: str) -> str:
#     """
#     Calls Ollama /api/generate.
#     Returns plain model response text.
#     """
#     payload = {
#         "model": OLLAMA_MODEL,
#         "prompt": prompt,
#         "stream": False,
#         "options": {
#             "temperature": 0.2,
#             "top_p": 0.9,
#         },
#     }

#     async with httpx.AsyncClient(timeout=120) as client:
#         response = await client.post(OLLAMA_URL, json=payload)
#         response.raise_for_status()
#         data = response.json()

#     return data.get("response", "").strip()

async def _call_ollama(prompt: str) -> str:
    settings = get_settings()

    async with httpx.AsyncClient(timeout=90) as client:
        response = await client.post(
            settings.OLLAMA_URL,
            json={
                "model": settings.OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
        )

    response.raise_for_status()
    data = response.json()
    return data.get("response", "")

def _extract_json(text: str) -> dict[str, Any]:
    """
    Ollama sometimes returns markdown or explanation.
    This tries to extract JSON safely.
    """
    if not text:
        return {}

    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(cleaned[start : end + 1])
        except Exception:
            return {}

    return {}


async def collect_dashboard_ai_context() -> dict[str, Any]:
    """
    Collect real data from DB for AI insights.
    This avoids sending huge DB rows to the model.
    """

    today = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    total_students = await db.student.count()
    active_students = await db.student.count(where={"status": "ACTIVE"})

    total_cameras = await db.camera.count()
    online_cameras = await db.camera.count(where={"status": "ONLINE"})
    offline_cameras = await db.camera.count(where={"status": "OFFLINE"})

    total_alerts = await db.alert.count()
    open_alerts = await db.alert.count(where={"status": "OPEN"})

    face_enrolled = await db.faceenrollment.count(where={"status": "ENROLLED"})

    today_records = await db.attendancerecord.find_many(
        where={"date": today},
        include={
            "student": {
                "include": {
                    "department": True,
                    "courseClass": True,
                    "section": True,
                }
            }
        },
    )

    present_today = len([r for r in today_records if r.status == "PRESENT"])
    late_today = len([r for r in today_records if r.status == "LATE"])
    absent_today = max(active_students - present_today - late_today, 0)

    attendance_percent = (
        round(((present_today + late_today) / active_students) * 100, 2)
        if active_students
        else 0
    )

    low_confidence_records = [
        {
            "studentId": r.studentId,
            "status": r.status,
            "recognitionConfidence": _safe_number(
                getattr(r, "recognitionConfidence", None)
            ),
            "livenessScore": _safe_number(getattr(r, "livenessScore", None)),
        }
        for r in today_records
        if _safe_number(getattr(r, "recognitionConfidence", None), 100) < 70
    ]

    department_map: dict[str, dict[str, Any]] = {}

    for record in today_records:
        student = getattr(record, "student", None)
        department = getattr(student, "department", None) if student else None
        department_name = getattr(department, "name", None) or "Unknown"

        if department_name not in department_map:
            department_map[department_name] = {
                "department": department_name,
                "present": 0,
                "late": 0,
                "absent": 0,
                "totalRecords": 0,
            }

        department_map[department_name]["totalRecords"] += 1

        if record.status == "PRESENT":
            department_map[department_name]["present"] += 1
        elif record.status == "LATE":
            department_map[department_name]["late"] += 1
        elif record.status == "ABSENT":
            department_map[department_name]["absent"] += 1

    recent_alerts = await db.alert.find_many(
        take=10,
        order={"createdAt": "desc"},
    )

    alert_items = [
        {
            "title": getattr(a, "title", ""),
            "severity": getattr(a, "severity", ""),
            "status": getattr(a, "status", ""),
            "description": getattr(a, "description", ""),
        }
        for a in recent_alerts
    ]

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "students": {
            "total": total_students,
            "active": active_students,
        },
        "attendanceToday": {
            "present": present_today,
            "late": late_today,
            "absent": absent_today,
            "attendancePercent": attendance_percent,
            "totalRecords": len(today_records),
        },
        "faceEnrollment": {
            "enrolled": face_enrolled,
            "pending": max(active_students - face_enrolled, 0),
        },
        "cameras": {
            "total": total_cameras,
            "online": online_cameras,
            "offline": offline_cameras,
        },
        "alerts": {
            "total": total_alerts,
            "open": open_alerts,
            "recent": alert_items,
        },
        "departmentAttendance": list(department_map.values()),
        "riskSignals": {
            "lowConfidenceCount": len(low_confidence_records),
            "lowConfidenceSamples": low_confidence_records[:5],
        },
    }


async def generate_dashboard_ai_insights() -> dict[str, Any]:
    context = await collect_dashboard_ai_context()

    prompt = f"""
You are an AI assistant for a college smart attendance dashboard.

Use ONLY the real JSON data below. Do not invent numbers.

Return ONLY valid JSON. No markdown.

JSON data:
{json.dumps(context, indent=2)}

Create dashboard insights for admin UI.

Required JSON format:
{{
  "summary": "short 2 sentence executive summary",
  "healthScore": number between 0 and 100,
  "insights": [
    {{
      "title": "short title",
      "description": "clear insight using real data",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "category": "ATTENDANCE" | "CAMERA" | "FACE_ENROLLMENT" | "SECURITY" | "SYSTEM"
    }}
  ],
  "recommendations": [
    {{
      "title": "short action",
      "description": "what admin should do next",
      "priority": "LOW" | "MEDIUM" | "HIGH"
    }}
  ],
  "report": {{
    "title": "AI Attendance Report",
    "overview": "one paragraph overview",
    "attendanceAnalysis": "one paragraph",
    "cameraAnalysis": "one paragraph",
    "faceEnrollmentAnalysis": "one paragraph",
    "securityAnalysis": "one paragraph",
    "nextActions": ["action 1", "action 2", "action 3"]
  }}
}}
"""

    try:
        raw = await _call_ollama(prompt)
        parsed = _extract_json(raw)

        if parsed:
            return {
                "ok": True,
                "source": "ollama",
                "model": OLLAMA_MODEL,
                "data": parsed,
                "context": context,
            }

        return {
            "ok": False,
            "source": "fallback",
            "model": OLLAMA_MODEL,
            "data": _fallback_insights(context),
            "context": context,
            "error": "AI returned invalid JSON",
            "raw": raw,
        }

    except Exception as error:
        return {
            "ok": False,
            "source": "fallback",
            "model": OLLAMA_MODEL,
            "data": _fallback_insights(context),
            "context": context,
            "error": str(error),
        }


def _fallback_insights(context: dict[str, Any]) -> dict[str, Any]:
    attendance = context["attendanceToday"]
    cameras = context["cameras"]
    face = context["faceEnrollment"]
    alerts = context["alerts"]

    attendance_percent = attendance["attendancePercent"]

    insights = []

    if attendance_percent < 75:
        insights.append(
            {
                "title": "Attendance below target",
                "description": f"Today's attendance is {attendance_percent}%, which needs admin attention.",
                "severity": "HIGH",
                "category": "ATTENDANCE",
            }
        )
    else:
        insights.append(
            {
                "title": "Attendance is stable",
                "description": f"Today's attendance is {attendance_percent}%.",
                "severity": "LOW",
                "category": "ATTENDANCE",
            }
        )

    if cameras["offline"] > 0:
        insights.append(
            {
                "title": "Offline cameras detected",
                "description": f"{cameras['offline']} camera(s) are offline.",
                "severity": "HIGH",
                "category": "CAMERA",
            }
        )

    if face["pending"] > 0:
        insights.append(
            {
                "title": "Pending face enrollments",
                "description": f"{face['pending']} active student(s) still need face enrollment.",
                "severity": "MEDIUM",
                "category": "FACE_ENROLLMENT",
            }
        )

    if alerts["open"] > 0:
        insights.append(
            {
                "title": "Open alerts require review",
                "description": f"There are {alerts['open']} open alert(s).",
                "severity": "MEDIUM",
                "category": "SYSTEM",
            }
        )

    health_score = 100
    health_score -= max(0, 75 - attendance_percent)
    health_score -= cameras["offline"] * 10
    health_score -= alerts["open"] * 3
    health_score = max(0, min(100, round(health_score)))

    return {
        "summary": f"Today's attendance is {attendance_percent}% with {attendance['present']} present and {attendance['late']} late. The system has {cameras['online']} online cameras and {alerts['open']} open alerts.",
        "healthScore": health_score,
        "insights": insights,
        "recommendations": [
            {
                "title": "Review low attendance groups",
                "description": "Check departments or classes with weak attendance and follow up with coordinators.",
                "priority": "HIGH" if attendance_percent < 75 else "MEDIUM",
            },
            {
                "title": "Resolve camera issues",
                "description": "Verify offline cameras and reconnect them before peak attendance hours.",
                "priority": "HIGH" if cameras["offline"] > 0 else "LOW",
            },
            {
                "title": "Complete face enrollment",
                "description": "Ask admins to enroll pending students to improve recognition coverage.",
                "priority": "MEDIUM" if face["pending"] > 0 else "LOW",
            },
        ],
        "report": {
            "title": "AI Attendance Report",
            "overview": f"Attendance today is {attendance_percent}% across active students.",
            "attendanceAnalysis": f"Present: {attendance['present']}, late: {attendance['late']}, absent estimate: {attendance['absent']}.",
            "cameraAnalysis": f"{cameras['online']} cameras are online and {cameras['offline']} are offline.",
            "faceEnrollmentAnalysis": f"{face['enrolled']} students are enrolled and {face['pending']} are pending.",
            "securityAnalysis": f"There are {alerts['open']} open alerts requiring review.",
            "nextActions": [
                "Review departments with low attendance.",
                "Fix offline cameras.",
                "Complete pending face enrollments.",
            ],
        },
    }