import asyncio
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.routes.api import router as api_router
from app.simulation.simulator import simulator

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background task for digital twin simulation loop
async def simulation_loop():
    while True:
        try:
            if simulator.is_running:
                simulator.step()
                state = simulator.get_telemetry_state()
                # Broadcast every step to connected WebSockets
                if manager.active_connections:
                    payload = state.model_dump_json()
                    await manager.broadcast(payload)
            await asyncio.sleep(0.5)
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            await asyncio.sleep(1.0)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    task = asyncio.create_task(simulation_loop())
    yield
    # Shutdown
    task.cancel()

app = FastAPI(
    title="EventFlow AI — Mega-Event Orchestration Engine",
    description="AI-powered Mega-Event Hospitality & Mobility Orchestration Platform (PS 8)",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "EventFlow AI Core Engine",
        "active_connections": len(manager.active_connections),
        "is_simulating": simulator.is_running
    }

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state immediately
        initial_state = simulator.get_telemetry_state().model_dump_json()
        await websocket.send_text(initial_state)
        
        while True:
            # Keep alive and receive any client-side commands
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
