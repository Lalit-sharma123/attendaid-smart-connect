import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.database import db

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)


manager = ConnectionManager()


@router.websocket("/monitor")
async def live_monitor(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            latest_events = await db.recognitionevent.find_many(
                take=10,
                order={"createdAt": "desc"},
                include={
                    "camera": True,
                    "student": True,
                },
            )

            cameras = await db.camera.find_many(
                where={"enabled": True},
                order={"createdAt": "desc"},
                take=20,
            )

            alerts = await db.alert.find_many(
                where={"status": "OPEN"},
                order={"createdAt": "desc"},
                take=10,
            )

            await websocket.send_json(
                {
                    "type": "live_monitor_update",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "cameras": [
                        {
                            "id": c.id,
                            "name": c.name,
                            "location": c.location,
                            "status": c.status,
                            "fps": c.fps,
                            "latency_ms": c.latencyMs,
                            "health_score": c.healthScore,
                            "last_heartbeat_at": c.lastHeartbeatAt.isoformat() if c.lastHeartbeatAt else None,
                        }
                        for c in cameras
                    ],
                    "events": [
                        {
                            "id": e.id,
                            "event_type": e.eventType,
                            "camera": e.camera.name if e.camera else None,
                            "student": e.student.name if e.student else None,
                            "confidence": e.recognitionConfidence,
                            "liveness_score": e.livenessScore,
                            "snapshot_url": e.snapshotUrl,
                            "created_at": e.createdAt.isoformat(),
                        }
                        for e in latest_events
                    ],
                    "alerts": [
                        {
                            "id": a.id,
                            "type": a.type,
                            "severity": a.severity,
                            "title": a.title,
                            "message": a.message,
                            "created_at": a.createdAt.isoformat(),
                        }
                        for a in alerts
                    ],
                }
            )

            await asyncio.sleep(3)

    except WebSocketDisconnect:
        manager.disconnect(websocket)