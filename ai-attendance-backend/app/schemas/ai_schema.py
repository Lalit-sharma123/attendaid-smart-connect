from pydantic import BaseModel


class AiInsightCreate(BaseModel):
    type: str
    title: str
    description: str
    severity: str = "INFO"
    confidence: float | None = None
    recommended_action: str | None = None
    metadata: dict | None = None


class AiAssistantRequest(BaseModel):
    message: str


class AiFaceAnalyzeRequest(BaseModel):
    student_id: str | None = None
    image_url: str | None = None