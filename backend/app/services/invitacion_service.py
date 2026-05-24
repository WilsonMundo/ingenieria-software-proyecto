import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.usuario import Usuario
from app.models.liga import Liga
from app.models.liga_miembro import LigaMiembro
from app.models.invitacion_liga import InvitacionLiga
from app.schemas.invitacion_schema import EnviarInvitacionRequest
from app.services.email_service import enviar_correo


def enviar_invitacion_liga(db: Session, data: EnviarInvitacionRequest):
    liga = db.query(Liga).filter(Liga.id_liga == data.id_liga).first()

    if not liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La liga indicada no existe"
        )

    usuario = db.query(Usuario).filter(
        Usuario.email == data.email_destino
    ).first()

    usuario_registrado = usuario is not None

    invitacion_existente = db.query(InvitacionLiga).filter(
        InvitacionLiga.id_liga == data.id_liga,
        InvitacionLiga.email_destino == data.email_destino,
        InvitacionLiga.estado == "pendiente"
    ).first()

    if invitacion_existente:
        token = invitacion_existente.token
        invitacion = invitacion_existente
    else:
        token = str(uuid.uuid4())

        invitacion = InvitacionLiga(
            id_liga=data.id_liga,
            email_destino=data.email_destino,
            token=token,
            estado="pendiente"
        )

        db.add(invitacion)
        db.commit()
        db.refresh(invitacion)

    if usuario_registrado:
        enlace = f"{settings.FRONTEND_URL}/login?invitation_token={token}"
    else:
        enlace = f"{settings.FRONTEND_URL}/registro?invitation_token={token}"

    asunto = f"Invitación a la liga {liga.nombre}"

    contenido_html = f"""
    <html>
      <body>
        <h2>Has recibido una invitación</h2>
        <p>Te han invitado a participar en la liga:</p>
        <h3>{liga.nombre}</h3>
        <p>Para aceptar la invitación, ingresa al siguiente enlace:</p>
        <p>
          <a href="{enlace}">
            Aceptar invitación
          </a>
        </p>
        <p>Si no solicitaste esta invitación, puedes ignorar este correo.</p>
      </body>
    </html>
    """

    enviar_correo(
        destinatario=data.email_destino,
        asunto=asunto,
        contenido_html=contenido_html
    )

    return {
        "mensaje": "Invitación enviada correctamente",
        "email_destino": data.email_destino,
        "usuario_registrado": usuario_registrado,
        "token": token,
        "enlace": enlace
    }


def validar_invitacion(db: Session, token: str):
    invitacion = db.query(InvitacionLiga).filter(
        InvitacionLiga.token == token
    ).first()

    if not invitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitación no encontrada"
        )

    usuario = db.query(Usuario).filter(
        Usuario.email == invitacion.email_destino
    ).first()

    return {
        "id_invitacion": invitacion.id_invitacion,
        "id_liga": invitacion.id_liga,
        "email_destino": invitacion.email_destino,
        "estado": invitacion.estado,
        "usuario_registrado": usuario is not None
    }


def aceptar_invitacion(db: Session, token: str, id_usuario: int, nombre_equipo: str | None = None):
    invitacion = db.query(InvitacionLiga).filter(
        InvitacionLiga.token == token
    ).first()

    if not invitacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitación no encontrada"
        )

    if invitacion.estado != "pendiente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La invitación ya no está pendiente"
        )

    usuario = db.query(Usuario).filter(
        Usuario.id_usuario == id_usuario
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if usuario.email != invitacion.email_destino:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La invitación no pertenece a este usuario"
        )

    miembro_existente = db.query(LigaMiembro).filter(
        LigaMiembro.id_liga == invitacion.id_liga,
        LigaMiembro.id_usuario == id_usuario
    ).first()

    if miembro_existente:
        invitacion.estado = "aceptada"
        db.commit()

        return {
            "mensaje": "El usuario ya pertenece a esta liga"
        }

    if not nombre_equipo:
        nombre_equipo = f"Equipo {usuario.id_usuario}"

    nuevo_miembro = LigaMiembro(
        id_liga=invitacion.id_liga,
        id_usuario=id_usuario,
        nombre_equipo=nombre_equipo,
        rol_liga="participante",
        estado_membresia="activo"
    )

    invitacion.estado = "aceptada"

    db.add(nuevo_miembro)
    db.commit()

    return {
        "mensaje": "Invitación aceptada correctamente"
    }