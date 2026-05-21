from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.resultado_oficial import ResultadoOficial
from app.models.partido import Partido
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/resultados", tags=["Resultados"])

class ResultadoSchema(BaseModel):
    id_resultado: int
    id_partido: int
    goles_local: int
    goles_visitante: int
    fecha_registro: datetime
    bloqueado: bool
    class Config: from_attributes = True

class ResultadoCreate(BaseModel):
    id_partido: int
    goles_local: int
    goles_visitante: int

class ResultadoUpdate(BaseModel):
    goles_local: Optional[int] = None
    goles_visitante: Optional[int] = None
    bloqueado: Optional[bool] = None

@router.get("/", response_model=List[ResultadoSchema])
def listar_resultados(db: Session = Depends(get_db)):
    return db.query(ResultadoOficial).all()

@router.get("/partido/{id_partido}", response_model=ResultadoSchema)
def resultado_por_partido(id_partido: int, db: Session = Depends(get_db)):
    r = db.query(ResultadoOficial).filter(ResultadoOficial.id_partido == id_partido).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    return r

@router.post("/", response_model=ResultadoSchema, status_code=status.HTTP_201_CREATED)
def registrar_resultado(data: ResultadoCreate, db: Session = Depends(get_db)):
    # Verificar que no exista resultado previo
    existente = db.query(ResultadoOficial).filter(ResultadoOficial.id_partido == data.id_partido).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe un resultado para este partido")
    resultado = ResultadoOficial(**data.model_dump())
    db.add(resultado)
    # Actualizar estado del partido a finalizado
    partido = db.query(Partido).filter(Partido.id_partido == data.id_partido).first()
    if partido:
        partido.estado_partido = "finalizado"
    db.commit()
    db.refresh(resultado)
    return resultado

@router.put("/{id_resultado}", response_model=ResultadoSchema)
def actualizar_resultado(id_resultado: int, data: ResultadoUpdate, db: Session = Depends(get_db)):
    r = db.query(ResultadoOficial).filter(ResultadoOficial.id_resultado == id_resultado).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    if r.bloqueado:
        raise HTTPException(status_code=403, detail="Resultado bloqueado, no puede modificarse")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(r, campo, valor)
    db.commit()
    db.refresh(r)
    return r

@router.delete("/{id_resultado}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_resultado(id_resultado: int, db: Session = Depends(get_db)):
    r = db.query(ResultadoOficial).filter(ResultadoOficial.id_resultado == id_resultado).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    if r.bloqueado:
        raise HTTPException(status_code=403, detail="Resultado bloqueado, no puede eliminarse")
    db.delete(r)
    db.commit()
