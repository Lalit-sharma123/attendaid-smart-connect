# from fastapi import APIRouter, Depends

# from app.dependencies.auth import admin_required
# from app.services.dashboard_service import admin_dashboard_summary

# router = APIRouter()


# @router.get("/summary")
# async def summary(current_user=Depends(admin_required)):
#     return await admin_dashboard_summary()


from fastapi import APIRouter, Depends

from app.dependencies.auth import admin_required
from app.services.dashboard_service import (
    admin_dashboard_summary,
    admin_dashboard_stats,
)

router = APIRouter()


@router.get("/summary")
async def summary(current_user=Depends(admin_required)):
    return await admin_dashboard_summary()


@router.get("/stats")
async def dashboard_stats(current_user=Depends(admin_required)):
    return await admin_dashboard_stats()


