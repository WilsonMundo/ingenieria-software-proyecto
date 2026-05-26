from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base

from app.api.controllers.auth_controller import router as auth_router
from app.api.controllers.invitacion_controller import router as invitacion_router
from app.api.controllers.usuario_controller import router as usuario_router

from app.api.controllers.vaticinio import router as vaticinios_router

from app.modules.mundial.router import mundial_router
from app.api.controllers.premio_controller import router as premio_router
from app.api.controllers.admin_controller import router as admin_router

app = FastAPI(
    title="WorldBet League API",
  # title="Liga Mundial API",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200"
]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins,
    allow_origins=["http://localhost:4200"],  # En producción: URL real del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(invitacion_router)
app.include_router(usuario_router)

app.include_router(vaticinios_router)
app.include_router(mundial_router)
app.include_router(premio_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return "API funcionando correctamente"
