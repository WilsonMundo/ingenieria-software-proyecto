from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import and_, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.grupo import Grupo
from app.models.pais import Pais
from app.models.pais_grupo import PaisGrupo

router = APIRouter(prefix="/paises", tags=["Paises"])


class GrupoResumenSchema(BaseModel):
    id_grupo: int
    id_torneo: int
    nombre: str


class PaisSchema(BaseModel):
    id_pais: int
    nombre: str
    codigo_fifa: str
    confederacion: Optional[str] = None
    id_grupo: Optional[int] = None
    grupo: Optional[GrupoResumenSchema] = None


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


def grupo_resumen(grupo: Grupo | None) -> dict | None:
    if not grupo:
        return None
    return {
        "id_grupo": grupo.id_grupo,
        "id_torneo": grupo.id_torneo,
        "nombre": grupo.nombre,
    }


def pais_resumen(pais: Pais, grupo: Grupo | None = None) -> dict:
    return {
        "id_pais": pais.id_pais,
        "nombre": pais.nombre,
        "codigo_fifa": pais.codigo_fifa,
        "confederacion": pais.confederacion,
        "id_grupo": pais.id_grupo,
        "grupo": grupo_resumen(grupo),
    }


def obtener_pais_con_grupo(db: Session, id_pais: int):
    return (
        db.query(Pais, Grupo)
        .outerjoin(Grupo, Grupo.id_grupo == Pais.id_grupo)
        .filter(Pais.id_pais == id_pais)
        .first()
    )


def sincronizar_pais_grupo(db: Session, pais: Pais):
    db.query(PaisGrupo).filter(PaisGrupo.id_pais == pais.id_pais).delete()

    if pais.id_grupo is not None:
        db.add(PaisGrupo(id_pais=pais.id_pais, id_grupo=pais.id_grupo))


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


def validar_grupo(db: Session, id_grupo: int | None):
    if id_grupo is None:
        return

    grupo = db.query(Grupo).filter(Grupo.id_grupo == id_grupo).first()
    if not grupo:
        raise HTTPException(status_code=404, detail="Grupo no encontrado")


def manejar_error_integridad():
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Ya existe un pais con ese codigo FIFA"
    )


@router.get("", response_model=List[PaisSchema])
def listar_paises(grupo: Optional[int] = None, db: Session = Depends(get_db)):
    if grupo is not None:
        grupo_model = db.query(Grupo).filter(Grupo.id_grupo == grupo).first()
        if not grupo_model:
            return []

        paises = (
            db.query(Pais)
            .outerjoin(
                PaisGrupo,
                and_(
                    PaisGrupo.id_pais == Pais.id_pais,
                    PaisGrupo.id_grupo == grupo
                )
            )
            .filter(or_(PaisGrupo.id_grupo == grupo, Pais.id_grupo == grupo))
            .order_by(Pais.nombre)
            .all()
        )
        return [pais_resumen(pais, grupo_model) for pais in paises]
    else:
        filas = (
            db.query(Pais, Grupo)
            .outerjoin(Grupo, Grupo.id_grupo == Pais.id_grupo)
            .order_by(Pais.nombre)
            .all()
        )
    return [pais_resumen(pais, grupo) for pais, grupo in filas]


@router.get("/{id_pais}", response_model=PaisSchema)
def obtener_pais(id_pais: int, db: Session = Depends(get_db)):
    fila = obtener_pais_con_grupo(db, id_pais)
    if not fila:
        raise HTTPException(status_code=404, detail="Pais no encontrado")
    pais, grupo = fila
    return pais_resumen(pais, grupo)


@router.post("", response_model=PaisSchema, status_code=status.HTTP_201_CREATED)
def crear_pais(data: PaisCreate, db: Session = Depends(get_db)):
    valores = data.model_dump()
    valores["codigo_fifa"] = normalizar_codigo_fifa(valores["codigo_fifa"])
    validar_codigo_fifa_disponible(db, valores["codigo_fifa"])
    validar_grupo(db, valores.get("id_grupo"))

    pais = Pais(**valores)
    db.add(pais)

    try:
        db.flush()
        sincronizar_pais_grupo(db, pais)
        db.commit()
    except IntegrityError:
        db.rollback()
        manejar_error_integridad()

    db.refresh(pais)
    fila = obtener_pais_con_grupo(db, pais.id_pais)
    pais, grupo = fila
    return pais_resumen(pais, grupo)


@router.put("/{id_pais}", response_model=PaisSchema)
def actualizar_pais(id_pais: int, data: PaisUpdate, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="Pais no encontrado")

    valores = data.model_dump(exclude_unset=True)
    if "codigo_fifa" in valores and valores["codigo_fifa"] is not None:
        valores["codigo_fifa"] = normalizar_codigo_fifa(valores["codigo_fifa"])
        validar_codigo_fifa_disponible(db, valores["codigo_fifa"], id_pais)

    if "id_grupo" in valores:
        validar_grupo(db, valores["id_grupo"])

    for key, value in valores.items():
        setattr(pais, key, value)

    try:
        db.flush()
        if "id_grupo" in valores:
            sincronizar_pais_grupo(db, pais)
        db.commit()
    except IntegrityError:
        db.rollback()
        manejar_error_integridad()

    db.refresh(pais)
    fila = obtener_pais_con_grupo(db, pais.id_pais)
    pais, grupo = fila
    return pais_resumen(pais, grupo)


@router.delete("/{id_pais}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pais(id_pais: int, db: Session = Depends(get_db)):
    pais = db.query(Pais).filter(Pais.id_pais == id_pais).first()
    if not pais:
        raise HTTPException(status_code=404, detail="Pais no encontrado")
    db.delete(pais)
    db.commit()
