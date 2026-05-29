from pydantic import BaseModel


class SettingUpsert(BaseModel):
    key: str
    value: dict
    description: str | None = None