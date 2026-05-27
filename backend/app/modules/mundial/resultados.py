from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.partido import Partido
from app.models.resultado_oficial import ResultadoOficial

router = APIRouter(prefix="/resultados", tags=["Resultados"])


class ResultadoSchema(BaseModel):
    id_resultado: int
    id_partido: int
    goles_local: int
    goles_visitante: int
    fecha_registro: datetime
    bloqueado: bool

    class Config:
        from_attributes = True


class ResultadoCreate(BaseModel):
    id_partido: int
    goles_local: int
    goles_visitante: int


class ResultadoUpdate(BaseModel):
    goles_local: Optional[int] = None
    goles_visitante: Optional[int] = None
    bloqueado: Optional[bool] = None


def validar_goles(goles_local: int | None, goles_visitante: int | None):
    if goles_local is not None and goles_local < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Los goles del local no pueden ser negativos"
        )
    if goles_visitante is not None and goles_visitante < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Los goles del visitante no pueden ser negativos"
        )


def obtener_partido(db: Session, id_partido: int) -> Partido:
    partido = db.query(Partido).filter(Partido.id_partido == id_partido).first()
    if not partido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partido no encontrado"
        )
    return partido


def marcar_partido_finalizado(partido: Partido):
    partido.estado_partido = "finalizado"


def error_resultado_bloqueado():
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Resultado bloqueado, no puede modificarse"
    )


def manejar_error_integridad():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No se pudo guardar el resultado oficial"
    )


@router.get("", response_model=List[ResultadoSchema])
def listar_resultados(db: Session = Depends(get_db)):
    return db.query(ResultadoOficial).all()


@router.get("/partido/{id_partido}", response_model=ResultadoSchema)
def resultado_por_partido(id_partido: int, db: Session = Depends(get_db)):
    resultado = (
        db.query(ResultadoOficial)
        .filter(ResultadoOficial.id_partido == id_partido)
        .first()
    )
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    return resultado


@router.post("", response_model=ResultadoSchema, status_code=status.HTTP_201_CREATED)
def registrar_resultado(data: ResultadoCreate, db: Session = Depends(get_db)):
    validar_goles(data.goles_local, data.goles_visitante)
    partido = obtener_partido(db, data.id_partido)

    existente = (
        db.query(ResultadoOficial)
        .filter(ResultadoOficial.id_partido == data.id_partido)
        .first()
    )

    if existente:
        if existente.bloqueado:
            error_resultado_bloqueado()

        existente.goles_local = data.goles_local
        existente.goles_visitante = data.goles_visitante
        marcar_partido_finalizado(partido)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            manejar_error_integridad()

        db.refresh(existente)
        return existente

    resultado = ResultadoOficial(**data.model_dump())
    db.add(resultado)
    marcar_partido_finalizado(partido)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        manejar_error_integridad()

    db.refresh(resultado)
    return resultado


@router.put("/{id_resultado}", response_model=ResultadoSchema)
def actualizar_resultado(
    id_resultado: int,
    data: ResultadoUpdate,
    db: Session = Depends(get_db)
):
    resultado = (
        db.query(ResultadoOficial)
        .filter(ResultadoOficial.id_resultado == id_resultado)
        .first()
    )
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    if resultado.bloqueado:
        error_resultado_bloqueado()

    valores = data.model_dump(exclude_none=True)
    validar_goles(valores.get("goles_local"), valores.get("goles_visitante"))

    for campo, valor in valores.items():
        setattr(resultado, campo, valor)

    partido = obtener_partido(db, resultado.id_partido)
    marcar_partido_finalizado(partido)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        manejar_error_integridad()

    db.refresh(resultado)
    return resultado


@router.delete("/{id_resultado}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_resultado(id_resultado: int, db: Session = Depends(get_db)):
    resultado = (
        db.query(ResultadoOficial)
        .filter(ResultadoOficial.id_resultado == id_resultado)
        .first()
    )
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    if resultado.bloqueado:
        error_resultado_bloqueado()

    db.delete(resultado)
    db.commit()
