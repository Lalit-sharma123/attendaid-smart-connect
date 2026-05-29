from fastapi import APIRouter, Depends, HTTPException

from app.core.database import db
from app.dependencies.auth import admin_required
from app.schemas.setting_schema import SettingUpsert

router = APIRouter()


@router.get("")
async def list_settings(current_user=Depends(admin_required)):
    return await db.appsetting.find_many(order={"createdAt": "desc"})


@router.get("/{key}")
async def get_setting(key: str, current_user=Depends(admin_required)):
    setting = await db.appsetting.find_unique(where={"key": key})

    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    return setting


@router.post("")
async def upsert_setting(payload: SettingUpsert, current_user=Depends(admin_required)):
    return await db.appsetting.upsert(
        where={"key": payload.key},
        data={
            "create": {
                "key": payload.key,
                "value": payload.value,
                "description": payload.description,
                "updatedByUserId": current_user.id,
            },
            "update": {
                "value": payload.value,
                "description": payload.description,
                "updatedByUserId": current_user.id,
            },
        },
    )