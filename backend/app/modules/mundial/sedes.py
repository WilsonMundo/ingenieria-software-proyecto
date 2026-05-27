from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.modules.sede import Sede
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/sedes", tags=["Sedes"])

class SedeSchema(BaseModel):
    id_sede: int
    nombre: str
    ciudad: str
    pais_sede: str
    class Config: from_attributes = True

class SedeCreate(BaseModel):
    nombre: str
    ciudad: str
    pais_sede: str

class SedeUpdate(BaseModel):
    nombre: Optional[str] = None
    ciudad: Optional[str] = None
    pais_sede: Optional[str] = None

@router.get("/", response_model=List[SedeSchema])
def listar_sedes(db: Session = Depends(get_db)):
    return db.query(Sede).all()

@router.get("/{id_sede}", response_model=SedeSchema)
def obtener_sede(id_sede: int, db: Session = Depends(get_db)):
    sede = db.query(Sede).filter(Sede.id_sede == id_sede).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    return sede

@router.post("/", response_model=SedeSchema, status_code=status.HTTP_201_CREATED)
def crear_sede(data: SedeCreate, db: Session = Depends(get_db)):
    sede = Sede(**data.model_dump())
    db.add(sede)
    db.commit()
    db.refresh(sede)
    return sede

@router.put("/{id_sede}", response_model=SedeSchema)
def actualizar_sede(id_sede: int, data: SedeUpdate, db: Session = Depends(get_db)):
    sede = db.query(Sede).filter(Sede.id_sede == id_sede).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    for campo, valor in data.model_dump(exclude_none=True).items():
        setattr(sede, campo, valor)
    db.commit()
    db.refresh(sede)
    return sede

@router.delete("/{id_sede}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_sede(id_sede: int, db: Session = Depends(get_db)):
    sede = db.query(Sede).filter(Sede.id_sede == id_sede).first()
    if not sede:
        raise HTTPException(status_code=404, detail="Sede no encontrada")
    db.delete(sede)
    db.commit()
