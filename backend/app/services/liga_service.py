from fastapi import HTTPException
from fastapi import status

from sqlalchemy.orm import Session

from app.models.liga import Liga
from app.models.liga_miembro import LigaMiembro
from app.models.usuario import Usuario

from app.schemas.liga_schema import LigaCreate

def obtener_ligas_usuario(db: Session, usuario_actual: Usuario):

    resultados = db.query(Liga, LigaMiembro.rol_liga).join(
        LigaMiembro,
        Liga.id_liga == LigaMiembro.id_liga
    ).filter(
        LigaMiembro.id_usuario == usuario_actual.id_usuario
    ).all()

    response = []

    for liga, rol_liga in resultados:

        total_participantes = db.query(LigaMiembro).filter(
            LigaMiembro.id_liga == liga.id_liga,
            LigaMiembro.estado_membresia == "activo"
        ).count()

        response.append({
            "id_liga": liga.id_liga,
            "nombre": liga.nombre,
            "tipo_liga": liga.tipo_liga,
            "precio_participacion": liga.precio_participacion,
            "estado": liga.estado,
            "rol_liga": rol_liga,
            "total_participantes": total_participantes
        })

    return response

def obtener_liga_por_id(db: Session, id_liga: int, usuario_actual: Usuario):

    liga_data = db.query(Liga, LigaMiembro.rol_liga).join(
        LigaMiembro,
        Liga.id_liga == LigaMiembro.id_liga
    ).filter(
        Liga.id_liga == id_liga,
        LigaMiembro.id_usuario == usuario_actual.id_usuario
    ).first()

    if not liga_data:
        raise HTTPException(
            status_code=404,
            detail="Liga no encontrada"
        )

    liga, rol_usuario = liga_data

    total_participantes = db.query(LigaMiembro).filter(
        LigaMiembro.id_liga == id_liga,
        LigaMiembro.estado_membresia == "activo"
    ).count()

    return {
        "id_liga": liga.id_liga,
        "nombre": liga.nombre,
        "tipo_liga": liga.tipo_liga,
        "precio_participacion": liga.precio_participacion,
        "estado": liga.estado,
        "fecha_creacion": liga.fecha_creacion,
        "rol_liga": rol_usuario,
        "total_participantes": total_participantes
    }

def crear_liga(
    db: Session,
    data: LigaCreate,
    usuario_actual: Usuario
):
    liga_existente = (
        db.query(Liga)
        .filter(Liga.nombre == data.nombre)
        .first()
    )
    if liga_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una liga con ese nombre"
        )
    nueva_liga = Liga(
        nombre=data.nombre,
        tipo_liga=data.tipo_liga,
        precio_participacion=data.precio_participacion,
        id_creador_usuario=usuario_actual.id_usuario,
        id_admin_usuario=usuario_actual.id_usuario
    )
    db.add(nueva_liga)
    db.flush()
    miembro = LigaMiembro(
        id_liga=nueva_liga.id_liga,
        id_usuario=usuario_actual.id_usuario,
        nombre_equipo=data.nombre_equipo,
        rol_liga="admin"
    )
    db.add(miembro)
    db.commit()
    db.refresh(nueva_liga)
    return nueva_liga