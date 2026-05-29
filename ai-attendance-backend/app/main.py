# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.core.config import get_settings
# from app.core.database import connect_db, disconnect_db
# from app.routes.face_enrollment import router as face_enrollment_router
# from app.routes.reports import router as reports_router
# from app.routes.dashboard import router as dashboard_router
# from app.routes.ai import router as ai_router

# from app.routes import (
#     auth,
#     classes,
#     students,
#     dashboard,
#     face,
#     attendance,
#     audit,
#     cameras,
#     monitor,
#     alerts,
#     roles,
#     system_health,
#     ai,
# )

# from app.routes import settings as settings_routes

# settings = get_settings()

# app = FastAPI(title=settings.APP_NAME)

# origins = [
#     origin.strip()
#     for origin in settings.BACKEND_CORS_ORIGINS.split(",")
#     if origin.strip()
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.on_event("startup")
# async def startup() -> None:
#     await connect_db()


# @app.on_event("shutdown")
# async def shutdown() -> None:
#     await disconnect_db()


# @app.get("/")
# async def root():
#     return {"message": "Attendaid Smart Connect API running"}


# app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
# app.include_router(classes.router, prefix="/api/admin", tags=["Departments / Classes / Sections"])
# app.include_router(students.router, prefix="/api/admin/students", tags=["Students"])
# app.include_router(dashboard.router, prefix="/api/admin/dashboard", tags=["Dashboard"])
# app.include_router(face.router, prefix="/api/face", tags=["Face"])
# app.include_router(face_enrollment_router, prefix="/api")
# app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
# app.include_router(reports_router, prefix="/api")
# app.include_router(audit.router, prefix="/api/admin", tags=["Audit Logs"])

# app.include_router(cameras.router, prefix="/api/admin/cameras", tags=["Cameras"])
# app.include_router(monitor.router, prefix="/api/live", tags=["Live Monitor"])
# app.include_router(alerts.router, prefix="/api/admin/alerts", tags=["Alerts"])
# app.include_router(roles.router, prefix="/api/admin/roles", tags=["Roles"])
# app.include_router(settings_routes.router, prefix="/api/admin/settings", tags=["Settings"])
# app.include_router(system_health.router, prefix="/api/admin/system-health", tags=["System Health"])
# app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
# app.include_router(dashboard_router, prefix="/api")
# app.include_router(ai_router, prefix="/api")
# app.include_router(dashboard_router, prefix="/api/admin/dashboard")


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import connect_db, disconnect_db
from app.routes.face_enrollment import router as face_enrollment_router
from app.routes.reports import router as reports_router

from app.routes import (
    auth,
    classes,
    students,
    dashboard,
    face,
    attendance,
    audit,
    cameras,
    monitor,
    alerts,
    roles,
    system_health,
    ai,
)

from app.routes import settings as settings_routes

settings = get_settings()

app = FastAPI(title=settings.APP_NAME)

origins = [
    origin.strip()
    for origin in settings.BACKEND_CORS_ORIGINS.split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup() -> None:
    await connect_db()


@app.on_event("shutdown")
async def shutdown() -> None:
    await disconnect_db()


@app.get("/")
async def root():
    return {"message": "Attendaid Smart Connect API running"}


app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])

# Departments / Classes / Sections
# Gives:
# GET/POST /api/admin/departments
# GET/POST /api/admin/classes
# GET/POST /api/admin/sections
app.include_router(classes.router, prefix="/api/admin", tags=["Departments / Classes / Sections"])

app.include_router(students.router, prefix="/api/admin/students", tags=["Students"])
app.include_router(dashboard.router, prefix="/api/admin/dashboard", tags=["Dashboard"])
app.include_router(face.router, prefix="/api/face", tags=["Face"])
app.include_router(face_enrollment_router, prefix="/api")
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])
app.include_router(reports_router, prefix="/api")
app.include_router(audit.router, prefix="/api/admin", tags=["Audit Logs"])

app.include_router(cameras.router, prefix="/api/admin/cameras", tags=["Cameras"])
app.include_router(monitor.router, prefix="/api/live", tags=["Live Monitor"])
app.include_router(alerts.router, prefix="/api/admin/alerts", tags=["Alerts"])
app.include_router(roles.router, prefix="/api/admin/roles", tags=["Roles"])
app.include_router(settings_routes.router, prefix="/api/admin/settings", tags=["Settings"])
app.include_router(system_health.router, prefix="/api/admin/system-health", tags=["System Health"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])