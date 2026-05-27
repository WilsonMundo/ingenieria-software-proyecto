from datetime import datetime
from enum import Enum
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, aliased

from app.database.session import get_db
from app.models.estadio import Estadio
from app.models.fase import Fase
from app.models.grupo import Grupo
from app.models.pais import Pais
from app.models.partido import Partido

router = APIRouter(prefix="/partidos", tags=["Partidos"])


class EstadoPartido(str, Enum):
    PROGRAMADO = "programado"
    EN_JUEGO = "en_juego"
    EN_CURSO = "en_curso"
    FINALIZADO = "finalizado"
    SUSPENDIDO = "suspendido"


class PaisResumenSchema(BaseModel):
    id_pais: int
    nombre: str
    codigo_fifa: str
    confederacion: Optional[str] = None
    id_grupo: Optional[int] = None


class EstadioResumenSchema(BaseModel):
    id_estadio: int
    id_sede: int
    nombre: str
    capacidad: Optional[int] = None


class FaseResumenSchema(BaseModel):
    id_fase: int
    id_torneo: int
    nombre: str
    orden_fase: int


class GrupoResumenSchema(BaseModel):
    id_grupo: int
    id_torneo: int
    nombre: str


class PartidoSchema(BaseModel):
    id_partido: int
    id_torneo: int
    id_fase: int
    id_estadio: int
    id_equipo_local: int
    id_equipo_visitante: int
    fecha_hora_inicio: datetime
    estado_partido: str
    id_grupo: Optional[int] = None
    equipo_local: Optional[PaisResumenSchema] = None
    equipo_visitante: Optional[PaisResumenSchema] = None
    estadio: Optional[EstadioResumenSchema] = None
    fase: Optional[FaseResumenSchema] = None
    grupo: Optional[GrupoResumenSchema] = None


class PartidoCreate(BaseModel):
    id_torneo: int
    id_fase: int
    id_estadio: int
    id_equipo_local: int
    id_equipo_visitante: int
    fecha_hora_inicio: datetime
    estado_partido: EstadoPartido = EstadoPartido.PROGRAMADO
    id_grupo: Optional[int] = None


class PartidoUpdate(BaseModel):
    id_torneo: Optional[int] = None
    id_fase: Optional[int] = None
    id_estadio: Optional[int] = None
    id_equipo_local: Optional[int] = None
    id_equipo_visitante: Optional[int] = None
    fecha_hora_inicio: Optional[datetime] = None
    estado_partido: Optional[EstadoPartido] = None
    id_grupo: Optional[int] = None


def pais_resumen(pais: Pais | None) -> dict | None:
    if not pais:
        return None
    return {
        "id_pais": pais.id_pais,
        "nombre": pais.nombre,
        "codigo_fifa": pais.codigo_fifa,
        "confederacion": pais.confederacion,
        "id_grupo": pais.id_grupo,
    }


def estadio_resumen(estadio: Estadio | None) -> dict | None:
    if not estadio:
        return None
    return {
        "id_estadio": estadio.id_estadio,
        "id_sede": estadio.id_sede,
        "nombre": estadio.nombre,
        "capacidad": estadio.capacidad,
    }


def fase_resumen(fase: Fase | None) -> dict | None:
    if not fase:
        return None
    return {
        "id_fase": fase.id_fase,
        "id_torneo": fase.id_torneo,
        "nombre": fase.nombre,
        "orden_fase": fase.orden_fase,
    }


def grupo_resumen(grupo: Grupo | None) -> dict | None:
    if not grupo:
        return None
    return {
        "id_grupo": grupo.id_grupo,
        "id_torneo": grupo.id_torneo,
        "nombre": grupo.nombre,
    }


def partido_resumen(
    partido: Partido,
    equipo_local: Pais | None = None,
    equipo_visitante: Pais | None = None,
    estadio: Estadio | None = None,
    fase: Fase | None = None,
    grupo: Grupo | None = None
) -> dict:
    return {
        "id_partido": partido.id_partido,
        "id_torneo": partido.id_torneo,
        "id_fase": partido.id_fase,
        "id_grupo": partido.id_grupo,
        "id_estadio": partido.id_estadio,
        "id_equipo_local": partido.id_equipo_local,
        "id_equipo_visitante": partido.id_equipo_visitante,
        "fecha_hora_inicio": partido.fecha_hora_inicio,
        "estado_partido": partido.estado_partido,
        "equipo_local": pais_resumen(equipo_local),
        "equipo_visitante": pais_resumen(equipo_visitante),
        "estadio": estadio_resumen(estadio),
        "fase": fase_resumen(fase),
        "grupo": grupo_resumen(grupo),
    }


def buscar_partido_con_relaciones(db: Session, id_partido: int):
    Local = aliased(Pais)
    Visitante = aliased(Pais)
    return (
        db.query(Partido, Local, Visitante, Estadio, Fase, Grupo)
        .join(Local, Local.id_pais == Partido.id_equipo_local)
        .join(Visitante, Visitante.id_pais == Partido.id_equipo_visitante)
        .join(Estadio, Estadio.id_estadio == Partido.id_estadio)
        .join(Fase, Fase.id_fase == Partido.id_fase)
        .outerjoin(Grupo, Grupo.id_grupo == Partido.id_grupo)
        .filter(Partido.id_partido == id_partido)
        .first()
    )


@router.get("", response_model=List[PartidoSchema])
def listar_partidos(db: Session = Depends(get_db)):
    Local = aliased(Pais)
    Visitante = aliased(Pais)
    filas = (
        db.query(Partido, Local, Visitante, Estadio, Fase, Grupo)
        .join(Local, Local.id_pais == Partido.id_equipo_local)
        .join(Visitante, Visitante.id_pais == Partido.id_equipo_visitante)
        .join(Estadio, Estadio.id_estadio == Partido.id_estadio)
        .join(Fase, Fase.id_fase == Partido.id_fase)
        .outerjoin(Grupo, Grupo.id_grupo == Partido.id_grupo)
        .order_by(Partido.fecha_hora_inicio)
        .all()
    )

    return [
        partido_resumen(partido, equipo_local, equipo_visitante, estadio, fase, grupo)
        for partido, equipo_local, equipo_visitante, estadio, fase, grupo in filas
    ]


@router.get("/{id_partido}", response_model=PartidoSchema)
def obtener_partido(id_partido: int, db: Session = Depends(get_db)):
    fila = buscar_partido_con_relaciones(db, id_partido)
    if not fila:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    partido, equipo_local, equipo_visitante, estadio, fase, grupo = fila
    return partido_resumen(partido, equipo_local, equipo_visitante, estadio, fase, grupo)


@router.post("", response_model=PartidoSchema, status_code=status.HTTP_201_CREATED)
def crear_partido(data: PartidoCreate, db: Session = Depends(get_db)):
    if data.id_equipo_local == data.id_equipo_visitante:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El pais local y visitante no pueden ser el mismo"
        )

    partido = Partido(**data.model_dump())
    db.add(partido)
    db.commit()
    db.refresh(partido)

    return obtener_partido(partido.id_partido, db)


@router.put("/{id_partido}", response_model=PartidoSchema)
def actualizar_partido(id_partido: int, data: PartidoUpdate, db: Session = Depends(get_db)):
    partido = db.query(Partido).filter(Partido.id_partido == id_partido).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    nuevo_local = data.id_equipo_local or partido.id_equipo_local
    nuevo_visitante = data.id_equipo_visitante or partido.id_equipo_visitante
    if nuevo_local == nuevo_visitante:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El pais local y visitante no pueden ser el mismo"
        )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(partido, key, value)

    db.commit()
    db.refresh(partido)

    return obtener_partido(partido.id_partido, db)


@router.delete("/{id_partido}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_partido(id_partido: int, db: Session = Depends(get_db)):
    partido = db.query(Partido).filter(Partido.id_partido == id_partido).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    if partido.estado_partido != EstadoPartido.PROGRAMADO:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Solo se pueden eliminar partidos con estado PROGRAMADO"
        )

    db.delete(partido)
    db.commit()
