from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth_schema import MensajeResponse
from app.schemas.invitacion_schema import (
    EnviarInvitacionRequest,
    InvitacionResponse,
    ValidarInvitacionResponse,
    AceptarInvitacionRequest
)
from app.services.invitacion_service import (
    enviar_invitacion_liga,
    validar_invitacion,
    aceptar_invitacion
)

router = APIRouter(
    prefix="/api/invitaciones",
    tags=["Invitaciones"]
)


@router.post("/enviar", response_model=InvitacionResponse)
def enviar_invitacion(
    data: EnviarInvitacionRequest,
    db: Session = Depends(get_db)
):
    return enviar_invitacion_liga(db, data)


@router.get("/validar/{token}", response_model=ValidarInvitacionResponse)
def validar(
    token: str,
    db: Session = Depends(get_db)
):
    return validar_invitacion(db, token)


@router.post("/aceptar", response_model=MensajeResponse)
def aceptar(
    data: AceptarInvitacionRequest,
    db: Session = Depends(get_db)
):
    return aceptar_invitacion(
        db=db,
        token=data.token,
        id_usuario=data.id_usuario,
        nombre_equipo=data.nombre_equipo
    )