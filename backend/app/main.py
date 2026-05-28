from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base

from app.api.controllers.auth_controller import router as auth_router
from app.api.controllers.invitacion_controller import router as invitacion_router
from app.api.controllers.usuario_controller import router as usuario_router
from app.api.controllers.clasificacion_controller import router as clasificacion_router
from app.api.controllers.liga_controller import router as liga_router
from app.api.controllers.partido_controller import router as partido_router

from app.api.controllers.vaticinio import router as vaticinios_router
from app.api.controllers.vaticinio_controller import router as vaticinios_api_router

from app.modules.mundial.router import mundial_router
from app.api.controllers.premio_controller import router as premio_router
from app.api.controllers.admin_controller import router as admin_router

app = FastAPI(
    title="WorldBet League API",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

origins = [
    settings.FRONTEND_URL.rstrip("/"),
    "http://localhost:4200",
    "http://127.0.0.1:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(invitacion_router)
app.include_router(usuario_router)
app.include_router(clasificacion_router)
app.include_router(liga_router)
app.include_router(partido_router)

app.include_router(vaticinios_router)
app.include_router(vaticinios_api_router)
app.include_router(mundial_router)
app.include_router(premio_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return "API funcionando correctamente"
