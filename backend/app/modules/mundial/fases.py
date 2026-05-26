from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.fase import Fase
from pydantic import BaseModel

router = APIRouter(prefix="/fases", tags=["Fases"])


# ─── Schemas ─────────────────────────────────────────────────────────────────

class FaseSchema(BaseModel):
    id_fase: int
    nombre: str
    orden_fase: int

    class Config:
        from_attributes = True


class FaseCreate(BaseModel):
    nombre: str
    orden_fase: int


class FaseUpdate(BaseModel):
    nombre: Optional[str] = None
    orden_fase: Optional[int] = None


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/", response_model=List[FaseSchema])
def listar_fases(db: Session = Depends(get_db)):
    return db.query(Fase).order_by(Fase.orden_fase).all()


@router.get("/{id_fase}", response_model=FaseSchema)
def obtener_fase(id_fase: int, db: Session = Depends(get_db)):
    fase = db.query(Fase).filter(Fase.id_fase == id_fase).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    return fase


@router.post("/", response_model=FaseSchema, status_code=status.HTTP_201_CREATED)
def crear_fase(data: FaseCreate, db: Session = Depends(get_db)):
    fase = Fase(**data.model_dump())
    db.add(fase)
    db.commit()
    db.refresh(fase)
    return fase


@router.put("/{id_fase}", response_model=FaseSchema)
def actualizar_fase(id_fase: int, data: FaseUpdate, db: Session = Depends(get_db)):
    fase = db.query(Fase).filter(Fase.id_fase == id_fase).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(fase, key, value)
    db.commit()
    db.refresh(fase)
    return fase


@router.delete("/{id_fase}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_fase(id_fase: int, db: Session = Depends(get_db)):
    fase = db.query(Fase).filter(Fase.id_fase == id_fase).first()
    if not fase:
        raise HTTPException(status_code=404, detail="Fase no encontrada")
    db.delete(fase)
    db.commit()
