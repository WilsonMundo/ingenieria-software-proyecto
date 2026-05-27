from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.pais import Pais
from pydantic import BaseModel

router = APIRouter(prefix="/paises", tags=["Países"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

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


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/", response_model=List[PaisSchema])
def listar_paises(db: Session = Depends(get_db)):
    return db.query(Pais).order_by(Pais.nombre).all()


@router.get("/{id_pais}", response_model=PaisSchema)
def obtener_pais(id_pais: int, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="País no encontrado")
    return pais


@router.post("/", response_model=PaisSchema, status_code=status.HTTP_201_CREATED)
def crear_pais(data: PaisCreate, db: Session = Depends(get_db)):
    pais = Pais(**data.model_dump())
    db.add(pais)
    db.commit()
    db.refresh(pais)
    return pais


@router.put("/{id_pais}", response_model=PaisSchema)
def actualizar_pais(id_pais: int, data: PaisUpdate, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="País no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pais, key, value)
    db.commit()
    db.refresh(pais)
    return pais


@router.delete("/{id_pais}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pais(id_pais: int, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="País no encontrado")
    db.delete(pais)
    db.commit()
