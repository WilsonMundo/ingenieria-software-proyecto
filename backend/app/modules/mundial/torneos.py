from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.torneo import Torneo
from pydantic import BaseModel

router = APIRouter(prefix="/torneos", tags=["Torneos"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class TorneoSchema(BaseModel):
    id_torneo: int
    nombre: str
    anio: int
    estado: str

    class Config:
        from_attributes = True


class TorneoCreate(BaseModel):
    nombre: str
    anio: int
    estado: str


class TorneoUpdate(BaseModel):
    nombre: Optional[str] = None
    anio: Optional[int] = None
    estado: Optional[str] = None


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/", response_model=List[TorneoSchema])
def listar_torneos(db: Session = Depends(get_db)):
    return db.query(Torneo).all()


@router.get("/{id_torneo}", response_model=TorneoSchema)
def obtener_torneo(id_torneo: int, db: Session = Depends(get_db)):
    torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return torneo


@router.post("/", response_model=TorneoSchema, status_code=status.HTTP_201_CREATED)
def crear_torneo(data: TorneoCreate, db: Session = Depends(get_db)):
    torneo = Torneo(**data.model_dump())
    db.add(torneo)
    db.commit()
    db.refresh(torneo)
    return torneo


@router.put("/{id_torneo}", response_model=TorneoSchema)
def actualizar_torneo(id_torneo: int, data: TorneoUpdate, db: Session = Depends(get_db)):
    torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(torneo, key, value)
    db.commit()
    db.refresh(torneo)
    return torneo


@router.delete("/{id_torneo}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_torneo(id_torneo: int, db: Session = Depends(get_db)):
    torneo = db.query(Torneo).filter(Torneo.id_torneo == id_torneo).first()
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    db.delete(torneo)
    db.commit()
