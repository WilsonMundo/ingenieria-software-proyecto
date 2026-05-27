from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.estadio import Estadio
from app.models.sede import Sede

router = APIRouter(prefix="/estadios", tags=["Estadios"])


class SedeResumenSchema(BaseModel):
    id_sede: int
    nombre: str
    ciudad: str
    pais_sede: str


class EstadioSchema(BaseModel):
    id_estadio: int
    nombre: str
    capacidad: Optional[int] = None
    id_sede: int
    sede: Optional[SedeResumenSchema] = None


class EstadioCreate(BaseModel):
    nombre: str
    capacidad: Optional[int] = None
    id_sede: int


class EstadioUpdate(BaseModel):
    nombre: Optional[str] = None
    capacidad: Optional[int] = None
    id_sede: Optional[int] = None


def sede_resumen(sede: Sede | None) -> dict | None:
    if not sede:
        return None
    return {
        "id_sede": sede.id_sede,
        "nombre": sede.nombre,
        "ciudad": sede.ciudad,
        "pais_sede": sede.pais_sede,
    }


def estadio_resumen(estadio: Estadio, sede: Sede | None = None) -> dict:
    return {
        "id_estadio": estadio.id_estadio,
        "nombre": estadio.nombre,
        "capacidad": estadio.capacidad,
        "id_sede": estadio.id_sede,
        "sede": sede_resumen(sede),
    }


def obtener_estadio_con_sede(db: Session, id_estadio: int):
    return (
        db.query(Estadio, Sede)
        .join(Sede, Sede.id_sede == Estadio.id_sede)
        .filter(Estadio.id_estadio == id_estadio)
        .first()
    )


@router.get("", response_model=List[EstadioSchema])
def listar_estadios(db: Session = Depends(get_db)):
    filas = (
        db.query(Estadio, Sede)
        .join(Sede, Sede.id_sede == Estadio.id_sede)
        .order_by(Estadio.id_estadio)
        .all()
    )
    return [estadio_resumen(estadio, sede) for estadio, sede in filas]


@router.get("/{id_estadio}", response_model=EstadioSchema)
def obtener_estadio(id_estadio: int, db: Session = Depends(get_db)):
    fila = obtener_estadio_con_sede(db, id_estadio)
    if not fila:
        raise HTTPException(status_code=404, detail="Estadio no encontrado")
    estadio, sede = fila
    return estadio_resumen(estadio, sede)


@router.post("", response_model=EstadioSchema, status_code=status.HTTP_201_CREATED)
def crear_estadio(data: EstadioCreate, db: Session = Depends(get_db)):
    sede = db.query(Sede).filter(Sede.id_sede == data.id_sede).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")

    estadio = Estadio(**data.model_dump())
    db.add(estadio)
    db.commit()
    db.refresh(estadio)
    return estadio_resumen(estadio, sede)


@router.put("/{id_estadio}", response_model=EstadioSchema)
def actualizar_estadio(id_estadio: int, data: EstadioUpdate, db: Session = Depends(get_db)):
    estadio = db.query(Estadio).filter(Estadio.id_estadio == id_estadio).first()
    if not estadio:
        raise HTTPException(status_code=404, detail="Estadio no encontrado")

    valores = data.model_dump(exclude_unset=True)
    if "id_sede" in valores and valores["id_sede"] is not None:
        sede = db.query(Sede).filter(Sede.id_sede == valores["id_sede"]).first()
        if not sede:
            raise HTTPException(status_code=404, detail="Sede no encontrada")

    for key, value in valores.items():
        setattr(estadio, key, value)

    db.commit()
    db.refresh(estadio)

    fila = obtener_estadio_con_sede(db, estadio.id_estadio)
    if not fila:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    estadio, sede = fila
    return estadio_resumen(estadio, sede)


@router.delete("/{id_estadio}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_estadio(id_estadio: int, db: Session = Depends(get_db)):
    estadio = db.query(Estadio).filter(Estadio.id_estadio == id_estadio).first()
    if not estadio:
        raise HTTPException(status_code=404, detail="Estadio no encontrado")
    db.delete(estadio)
    db.commit()
