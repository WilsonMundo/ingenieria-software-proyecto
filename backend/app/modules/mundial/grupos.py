from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.grupo import Grupo
from app.models.torneo import Torneo

router = APIRouter(prefix="/grupos", tags=["Grupos"])


class TorneoResumenSchema(BaseModel):
    id_torneo: int
    nombre: str
    anio: int
    estado: str

    class Config:
        from_attributes = True


class GrupoSchema(BaseModel):
    id_grupo: int
    nombre: str
    id_torneo: int
    torneo: Optional[TorneoResumenSchema] = None

    class Config:
        from_attributes = True


class GrupoCreate(BaseModel):
    nombre: str
    id_torneo: int


class GrupoUpdate(BaseModel):
    nombre: Optional[str] = None
    id_torneo: Optional[int] = None


def torneo_resumen(torneo: Optional[Torneo]):
    if not torneo:
        return None
    return {
        "id_torneo": torneo.id_torneo,
        "nombre": torneo.nombre,
        "anio": torneo.anio,
        "estado": torneo.estado,
    }


def grupo_resumen(grupo: Grupo, torneo: Optional[Torneo] = None):
    return {
        "id_grupo": grupo.id_grupo,
        "nombre": grupo.nombre,
        "id_torneo": grupo.id_torneo,
        "torneo": torneo_resumen(torneo),
    }


def obtener_grupo_con_torneo(db: Session, id_grupo: int):
    return (
        db.query(Grupo, Torneo)
        .outerjoin(Torneo, Grupo.id_torneo == Torneo.id_torneo)
        .filter(Grupo.id_grupo == id_grupo)
        .first()
    )


def validar_torneo(db: Session, id_torneo: int):
    torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return torneo


@router.get("", response_model=List[GrupoSchema])
def listar_grupos(db: Session = Depends(get_db)):
    filas = (
        db.query(Grupo, Torneo)
        .outerjoin(Torneo, Grupo.id_torneo == Torneo.id_torneo)
        .order_by(Grupo.nombre)
        .all()
    )
    return [grupo_resumen(grupo, torneo) for grupo, torneo in filas]


@router.get("/{id_grupo}", response_model=GrupoSchema)
def obtener_grupo(id_grupo: int, db: Session = Depends(get_db)):
    fila = obtener_grupo_con_torneo(db, id_grupo)
    if not fila:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    grupo, torneo = fila
    return grupo_resumen(grupo, torneo)


@router.post("", response_model=GrupoSchema, status_code=status.HTTP_201_CREATED)
def crear_grupo(data: GrupoCreate, db: Session = Depends(get_db)):
    validar_torneo(db, data.id_torneo)

    grupo = Grupo(**data.model_dump())
    db.add(grupo)
    db.commit()
    db.refresh(grupo)

    _, torneo = obtener_grupo_con_torneo(db, grupo.id_grupo)
    return grupo_resumen(grupo, torneo)


@router.put("/{id_grupo}", response_model=GrupoSchema)
def actualizar_grupo(id_grupo: int, data: GrupoUpdate, db: Session = Depends(get_db)):
    grupo = db.query(Grupo).filter(Grupo.id_grupo == id_grupo).first()
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")

    cambios = data.model_dump(exclude_unset=True)
    if "id_torneo" in cambios:
        validar_torneo(db, cambios["id_torneo"])

    for key, value in cambios.items():
        setattr(grupo, key, value)

    db.commit()
    db.refresh(grupo)

    _, torneo = obtener_grupo_con_torneo(db, grupo.id_grupo)
    return grupo_resumen(grupo, torneo)


@router.delete("/{id_grupo}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_grupo(id_grupo: int, db: Session = Depends(get_db)):
    grupo = db.query(Grupo).filter(Grupo.id_grupo == id_grupo).first()
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    db.delete(grupo)
    db.commit()
