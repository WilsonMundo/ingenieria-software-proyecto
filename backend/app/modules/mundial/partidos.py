from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from enum import Enum
from app.database.session import get_db
from app.models.partido import Partido
from pydantic import BaseModel

router = APIRouter(prefix="/partidos", tags=["Partidos"])


# ─── Enum de estado ───────────────────────────────────────────────────────────

class EstadoPartido(str, Enum):
    PROGRAMADO = "programado"
    EN_CURSO = "en_curso"
    FINALIZADO = "finalizado"


# ─── Schemas ─────────────────────────────────────────────────────────────────

class PartidoSchema(BaseModel):
    id_partido: int
    id_torneo: int
    id_fase: int
    id_estadio: int
    id_equipo_local: int
    id_equipo_visitante: int
    fecha_hora_inicio: datetime
    estado_partido: EstadoPartido
    id_grupo: Optional[int] = None

    class Config:
        from_attributes = True


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


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/", response_model=List[PartidoSchema])
def listar_partidos(db: Session = Depends(get_db)):
    return db.query(Partido).order_by(Partido.fecha_hora_inicio).all()


@router.get("/{id_partido}", response_model=PartidoSchema)
def obtener_partido(id_partido: int, db: Session = Depends(get_db)):
    partido = db.query(Partido).filter(Partido.id_partido == id_partido).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return partido


@router.post("/", response_model=PartidoSchema, status_code=status.HTTP_201_CREATED)
def crear_partido(data: PartidoCreate, db: Session = Depends(get_db)):
    if data.id_equipo_local == data.id_equipo_visitante:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El país local y visitante no pueden ser el mismo"
        )
    partido = Partido(**data.model_dump())
    db.add(partido)
    db.commit()
    db.refresh(partido)
    return partido


@router.put("/{id_partido}", response_model=PartidoSchema)
def actualizar_partido(id_partido: int, data: PartidoUpdate, db: Session = Depends(get_db)):
    partido = db.query(Partido).filter(Partido.id_partido == id_partido).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    # Validar que local ≠ visitante si se están actualizando ambos o uno de los dos
    nuevo_local = data.id_equipo_local or partido.id_equipo_local
    nuevo_visitante = data.id_equipo_visitante or partido.id_equipo_visitante
    if nuevo_local == nuevo_visitante:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El país local y visitante no pueden ser el mismo"
        )
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(partido, key, value)
    db.commit()
    db.refresh(partido)
    return partido


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
