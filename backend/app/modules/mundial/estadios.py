from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.estadio import Estadio
from pydantic import BaseModel

router = APIRouter(prefix="/estadios", tags=["Estadios"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class EstadioSchema(BaseModel):
    id_estadio: int
    nombre: str
    capacidad: int
    id_sede: int

    class Config:
        from_attributes = True


class EstadioCreate(BaseModel):
    nombre: str
    capacidad: int
    id_sede: int


class EstadioUpdate(BaseModel):
    nombre: Optional[str] = None
    capacidad: Optional[int] = None
    id_sede: Optional[int] = None


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/", response_model=List[EstadioSchema])
def listar_estadios(db: Session = Depends(get_db)):
    return db.query(Estadio).all()


@router.get("/{id_estadio}", response_model=EstadioSchema)
def obtener_estadio(id_estadio: int, db: Session = Depends(get_db)):
    estadio = db.query(Estadio).filter(Estadio.id_estadio == id_estadio).first()
    if not estadio:
        raise HTTPException(status_code=404, detail="Estadio no encontrado")
    return estadio


@router.post("/", response_model=EstadioSchema, status_code=status.HTTP_201_CREATED)
def crear_estadio(data: EstadioCreate, db: Session = Depends(get_db)):
    estadio = Estadio(**data.model_dump())
    db.add(estadio)
    db.commit()
    db.refresh(estadio)
    return estadio


@router.put("/{id_estadio}", response_model=EstadioSchema)
def actualizar_estadio(id_estadio: int, data: EstadioUpdate, db: Session = Depends(get_db)):
    estadio = db.query(Estadio).filter(Estadio.id_estadio == id_estadio).first()
    if not estadio:
        raise HTTPException(status_code=404, detail="Estadio no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(estadio, key, value)
    db.commit()
    db.refresh(estadio)
    return estadio


@router.delete("/{id_estadio}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_estadio(id_estadio: int, db: Session = Depends(get_db)):
    estadio = db.query(Estadio).filter(Estadio.id_estadio == id_estadio).first()
    if not estadio:
        raise HTTPException(status_code=404, detail="Estadio no encontrado")
    db.delete(estadio)
    db.commit()
