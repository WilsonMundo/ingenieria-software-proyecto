from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.fase import Fase
from app.models.torneo import Torneo

router = APIRouter(prefix="/fases", tags=["Fases"])


class TorneoResumenSchema(BaseModel):
    id_torneo: int
    nombre: str
    anio: int
    estado: str

    class Config:
        from_attributes = True


class FaseSchema(BaseModel):
    id_fase: int
    id_torneo: int
    nombre: str
    orden_fase: int
    torneo: Optional[TorneoResumenSchema] = None

    class Config:
        from_attributes = True


class FaseCreate(BaseModel):
    id_torneo: int
    nombre: str
    orden_fase: int


class FaseUpdate(BaseModel):
    id_torneo: Optional[int] = None
    nombre: Optional[str] = None
    orden_fase: Optional[int] = None


def torneo_resumen(torneo: Optional[Torneo]):
    if not torneo:
        return None
    return {
        "id_torneo": torneo.id_torneo,
        "nombre": torneo.nombre,
        "anio": torneo.anio,
        "estado": torneo.estado,
    }


def fase_resumen(fase: Fase, torneo: Optional[Torneo] = None):
    return {
        "id_fase": fase.id_fase,
        "id_torneo": fase.id_torneo,
        "nombre": fase.nombre,
        "orden_fase": fase.orden_fase,
        "torneo": torneo_resumen(torneo),
    }


def obtener_fase_con_torneo(db: Session, id_fase: int):
    return (
        db.query(Fase, Torneo)
        .outerjoin(Torneo, Fase.id_torneo == Torneo.id_torneo)
        .filter(Fase.id_fase == id_fase)
        .first()
    )


def validar_torneo(db: Session, id_torneo: int):
    torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return torneo


@router.get("", response_model=List[FaseSchema])
def listar_fases(db: Session = Depends(get_db)):
    filas = (
        db.query(Fase, Torneo)
        .outerjoin(Torneo, Fase.id_torneo == Torneo.id_torneo)
        .order_by(Fase.orden_fase)
        .all()
    )
    return [fase_resumen(fase, torneo) for fase, torneo in filas]


@router.get("/{id_fase}", response_model=FaseSchema)
def obtener_fase(id_fase: int, db: Session = Depends(get_db)):
    fila = obtener_fase_con_torneo(db, id_fase)
    if not fila:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    fase, torneo = fila
    return fase_resumen(fase, torneo)


@router.post("", response_model=FaseSchema, status_code=status.HTTP_201_CREATED)
def crear_fase(data: FaseCreate, db: Session = Depends(get_db)):
    validar_torneo(db, data.id_torneo)

    fase = Fase(**data.model_dump())
    db.add(fase)
    db.commit()
    db.refresh(fase)

    _, torneo = obtener_fase_con_torneo(db, fase.id_fase)
    return fase_resumen(fase, torneo)


@router.put("/{id_fase}", response_model=FaseSchema)
def actualizar_fase(id_fase: int, data: FaseUpdate, db: Session = Depends(get_db)):
    fase = db.query(Fase).filter(Fase.id_fase == id_fase).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")

    cambios = data.model_dump(exclude_unset=True)
    if "id_torneo" in cambios:
        validar_torneo(db, cambios["id_torneo"])

    for key, value in cambios.items():
        setattr(fase, key, value)

    db.commit()
    db.refresh(fase)

    _, torneo = obtener_fase_con_torneo(db, fase.id_fase)
    return fase_resumen(fase, torneo)


@router.delete("/{id_fase}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_fase(id_fase: int, db: Session = Depends(get_db)):
    fase = db.query(Fase).filter(Fase.id_fase == id_fase).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    db.delete(fase)
    db.commit()
