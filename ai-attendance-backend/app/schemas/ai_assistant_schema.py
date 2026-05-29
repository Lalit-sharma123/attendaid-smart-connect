from pydantic import BaseModel


class AiAssistantChatRequest(BaseModel):
    message: str


class AiAssistantChatResponse(BaseModel):
    reply: str
    type: str
    actions: list[str] = []
    data: object | None = None
