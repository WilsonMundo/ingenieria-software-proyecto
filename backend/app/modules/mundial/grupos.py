from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.grupo import Grupo
from pydantic import BaseModel

router = APIRouter(prefix="/grupos", tags=["Grupos"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class GrupoSchema(BaseModel):
    id_grupo: int
    nombre: str
    id_torneo: int

    class Config:
        from_attributes = True


class GrupoCreate(BaseModel):
    nombre: str
    id_torneo: int


class GrupoUpdate(BaseModel):
    nombre: Optional[str] = None
    id_torneo: Optional[int] = None


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/", response_model=List[GrupoSchema])
def listar_grupos(db: Session = Depends(get_db)):
    return db.query(Grupo).order_by(Grupo.nombre).all()


@router.get("/{id_grupo}", response_model=GrupoSchema)
def obtener_grupo(id_grupo: int, db: Session = Depends(get_db)):
    grupo = db.query(Grupo).filter(Grupo.id_grupo == id_grupo).first()
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    return grupo


@router.post("/", response_model=GrupoSchema, status_code=status.HTTP_201_CREATED)
def crear_grupo(data: GrupoCreate, db: Session = Depends(get_db)):
    grupo = Grupo(**data.model_dump())
    db.add(grupo)
    db.commit()
    db.refresh(grupo)
    return grupo


@router.put("/{id_grupo}", response_model=GrupoSchema)
def actualizar_grupo(id_grupo: int, data: GrupoUpdate, db: Session = Depends(get_db)):
    grupo = db.query(Grupo).filter(Grupo.id_grupo == id_grupo).first()
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(grupo, key, value)
    db.commit()
    db.refresh(grupo)
    return grupo


@router.delete("/{id_grupo}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_grupo(id_grupo: int, db: Session = Depends(get_db)):
    grupo = db.query(Grupo).filter(Grupo.id_grupo == id_grupo).first()
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")
    db.delete(grupo)
    db.commit()
