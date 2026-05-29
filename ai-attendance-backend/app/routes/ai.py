from fastapi import APIRouter, Depends
from app.schemas.ai_assistant_schema import AiAssistantChatRequest
from app.services.ai_assistant_service import ai_assistant_chat
from app.dependencies.auth import admin_required, teacher_admin_required
from app.schemas.ai_schema import (
    AiInsightCreate,
    AiAssistantRequest,
    AiFaceAnalyzeRequest,
)
from app.services.ai_service import (
    create_ai_insight,
    list_ai_insights,
    generate_basic_ai_recommendations,
    ai_assistant_reply,
    mock_real_face_analysis,
    create_low_attendance_risks,
)
from app.services.ai_report_service import generate_dashboard_ai_insights


from pydantic import BaseModel
from app.services.face_model_service import analyze_face_image


router = APIRouter()


@router.post("/insights")
async def add_insight(payload: AiInsightCreate, current_user=Depends(admin_required)):
    return await create_ai_insight(payload)


@router.get("/insights")
async def get_insights(
    severity: str | None = None,
    current_user=Depends(teacher_admin_required),
):
    return await list_ai_insights(severity=severity)


@router.post("/recommendations/generate")
async def generate_recommendations(current_user=Depends(admin_required)):
    return await generate_basic_ai_recommendations()


@router.post("/assistant")
async def assistant(
    payload: AiAssistantRequest,
    current_user=Depends(teacher_admin_required),
):
    return await ai_assistant_reply(payload.message)


@router.post("/face/analyze")
async def analyze_face(
    payload: AiFaceAnalyzeRequest,
    current_user=Depends(admin_required),
):
    return await mock_real_face_analysis(payload)


@router.post("/attendance/low-risk/generate")
async def generate_low_attendance_risk(current_user=Depends(admin_required)):
    return await create_low_attendance_risks()


@router.get("/dashboard-insights")
async def dashboard_ai_insights(current_user=Depends(admin_required)):
    return await generate_dashboard_ai_insights()


@router.post("/assistant/chat")
async def assistant_chat(
    payload: AiAssistantChatRequest,
    current_user=Depends(admin_required),
):
    return await ai_assistant_chat(payload.message, current_user)




class FaceAnalyzeRequest(BaseModel):
    image_base64: str


@router.post("/face/analyze")
async def face_analyze(payload: FaceAnalyzeRequest, current_user=Depends(admin_required)):
    return analyze_face_image(payload.image_base64)