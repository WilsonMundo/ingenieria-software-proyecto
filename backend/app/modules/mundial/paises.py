from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.pais import Pais

router = APIRouter(prefix="/paises", tags=["Paises"])


class PaisSchema(BaseModel):
    id_pais: int
    nombre: str
    codigo_fifa: str
    confederacion: Optional[str] = None
    id_grupo: Optional[int] = None

    class Config:
        from_attributes = True


class PaisCreate(BaseModel):
    nombre: str
    codigo_fifa: str
    confederacion: Optional[str] = None
    id_grupo: Optional[int] = None


class PaisUpdate(BaseModel):
    nombre: Optional[str] = None
    codigo_fifa: Optional[str] = None
    confederacion: Optional[str] = None
    id_grupo: Optional[int] = None


def normalizar_codigo_fifa(codigo_fifa: str) -> str:
    return codigo_fifa.strip().upper()


def validar_codigo_fifa_disponible(
    db: Session,
    codigo_fifa: str,
    id_pais_actual: int | None = None
):
    existe = db.query(Pais).filter(Pais.codigo_fifa == codigo_fifa).first()

    if existe and existe.id_pais != id_pais_actual:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un pais con ese codigo FIFA"
        )


def manejar_error_integridad():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Ya existe un pais con ese codigo FIFA"
    )


@router.get("", response_model=List[PaisSchema])
def listar_paises(db: Session = Depends(get_db)):
    return db.query(Pais).order_by(Pais.nombre).all()


@router.get("/{id_pais}", response_model=PaisSchema)
def obtener_pais(id_pais: int, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="Pais no encontrado")
    return pais


@router.post("", response_model=PaisSchema, status_code=status.HTTP_201_CREATED)
def crear_pais(data: PaisCreate, db: Session = Depends(get_db)):
    valores = data.model_dump()
    valores["codigo_fifa"] = normalizar_codigo_fifa(valores["codigo_fifa"])
    validar_codigo_fifa_disponible(db, valores["codigo_fifa"])

    pais = Pais(**valores)
    db.add(pais)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        manejar_error_integridad()

    db.refresh(pais)
    return pais


@router.put("/{id_pais}", response_model=PaisSchema)
def actualizar_pais(id_pais: int, data: PaisUpdate, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="Pais no encontrado")

    valores = data.model_dump(exclude_unset=True)
    if "codigo_fifa" in valores and valores["codigo_fifa"] is not None:
        valores["codigo_fifa"] = normalizar_codigo_fifa(valores["codigo_fifa"])
        validar_codigo_fifa_disponible(db, valores["codigo_fifa"], id_pais)

    for key, value in valores.items():
        setattr(pais, key, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        manejar_error_integridad()

    db.refresh(pais)
    return pais


@router.delete("/{id_pais}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pais(id_pais: int, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="Pais no encontrado")
    db.delete(pais)
    db.commit()
