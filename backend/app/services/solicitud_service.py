from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.liga import Liga
from app.models.usuario import Usuario
from app.models.liga_miembro import LigaMiembro
from app.models.solicitud_ingreso import SolicitudIngreso

from app.schemas.solicitud_schema import ResolverSolicitudRequest


# CREAR SOLICITUD
def crear_solicitud_ingreso(
    db: Session,
    id_liga: int,
    usuario_actual: Usuario
):
    liga = db.query(Liga).filter(
        Liga.id_liga == id_liga
    ).first()
    if not liga:
        raise HTTPException(
            status_code=404,
            detail="Liga no encontrada"
        )
    # Verificar si ya es miembro activo
    miembro_existente = db.query(LigaMiembro).filter(
        LigaMiembro.id_liga == id_liga,
        LigaMiembro.id_usuario == usuario_actual.id_usuario,
        LigaMiembro.estado_membresia == "activo"
    ).first()
    if miembro_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya perteneces a esta liga"
        )
    # Verificar solicitud pendiente
    solicitud_existente = db.query(SolicitudIngreso).filter(
        SolicitudIngreso.id_liga == id_liga,
        SolicitudIngreso.id_usuario == usuario_actual.id_usuario,
        SolicitudIngreso.estado == "pendiente"
    ).first()
    if solicitud_existente:
        raise HTTPException(
            status_code=400,
            detail="Ya tienes una solicitud pendiente"
        )
    nueva_solicitud = SolicitudIngreso(
        id_liga=id_liga,
        id_usuario=usuario_actual.id_usuario,
        estado="pendiente"
    )
    db.add(nueva_solicitud)
    db.commit()
    db.refresh(nueva_solicitud)
    return {
        "message": "Solicitud enviada correctamente",
        "data": {
            "id_solicitud": nueva_solicitud.id_solicitud,
            "estado": nueva_solicitud.estado
        }
    }


# OBTENER SOLICITUDES
def obtener_solicitudes_pendientes(
    db: Session,
    id_liga: int,
    usuario_actual: Usuario
):
    # Validar admin ACTIVO
    miembro_admin = db.query(LigaMiembro).filter(
        LigaMiembro.id_liga == id_liga,
        LigaMiembro.id_usuario == usuario_actual.id_usuario,
        LigaMiembro.rol_liga == "admin",
        LigaMiembro.estado_membresia == "activo"
    ).first()
    if not miembro_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
    solicitudes = db.query(SolicitudIngreso).filter(
        SolicitudIngreso.id_liga == id_liga,
        SolicitudIngreso.estado == "pendiente"
    ).all()
    resultado = []
    for solicitud in solicitudes:
        usuario = db.query(Usuario).filter(
            Usuario.id_usuario == solicitud.id_usuario
        ).first()
        if not usuario:
            continue
        resultado.append({
            "id_solicitud": solicitud.id_solicitud,
            "id_usuario": solicitud.id_usuario,
            "nombre_usuario": getattr(usuario, "nombre", None) or getattr(usuario, "username", None) or usuario.email,
            "email": usuario.email,
            "estado": solicitud.estado,
            "fecha_solicitud": solicitud.fecha_solicitud
        })
    return resultado


# RESOLVER SOLICITUD
def resolver_solicitud(
    db: Session,
    id_solicitud: int,
    data: ResolverSolicitudRequest,
    usuario_actual: Usuario
):
    solicitud = db.query(SolicitudIngreso).filter(
        SolicitudIngreso.id_solicitud == id_solicitud
    ).first()

    if not solicitud:
        raise HTTPException(
            status_code=404,
            detail="Solicitud no encontrada"
        )

    miembro_admin = db.query(LigaMiembro).filter(
        LigaMiembro.id_liga == solicitud.id_liga,
        LigaMiembro.id_usuario == usuario_actual.id_usuario,
        LigaMiembro.rol_liga == "admin",
        LigaMiembro.estado_membresia == "activo"
    ).first()

    if not miembro_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )

    estado = data.estado.strip().lower()

    if estado in ["aceptada", "aceptado", "approve", "approved"]:
        estado = "aprobada"
    elif estado in ["rechazada", "reject", "rejected"]:
        estado = "rechazada"
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Estado inválido: {data.estado}"
        )

    if solicitud.estado != "pendiente":
        raise HTTPException(
            status_code=400,
            detail="La solicitud ya fue resuelta"
        )

    # actualizar solicitud
    solicitud.estado = estado
    solicitud.fecha_resolucion = datetime.utcnow()

    if estado == "aprobada":

        usuario = db.query(Usuario).filter(
            Usuario.id_usuario == solicitud.id_usuario
        ).first()

        miembro_existente = db.query(LigaMiembro).filter(
            LigaMiembro.id_liga == solicitud.id_liga,
            LigaMiembro.id_usuario == solicitud.id_usuario
        ).first()

        if miembro_existente:
            raise HTTPException(
                status_code=400,
                detail="El usuario ya es miembro de la liga"
            )

        nuevo_miembro = LigaMiembro(
            id_liga=solicitud.id_liga,
            id_usuario=solicitud.id_usuario,
            nombre_equipo=f"Equipo_{solicitud.id_usuario}_{solicitud.id_liga}",
            rol_liga="participante",
            estado_membresia="activo"
        )

        # 🔴 TRY IMPORTANTE AQUÍ
        try:
            db.add(nuevo_miembro)
            db.commit()
        except Exception as e:
            db.rollback()
            print("❌ ERROR INSERT LIGA_MIEMBRO:", str(e))
            raise HTTPException(
                status_code=500,
                detail="Error al insertar miembro en liga"
            )
    else:
        db.commit()

    return {
        "message": f"Solicitud {estado} correctamente"
    }