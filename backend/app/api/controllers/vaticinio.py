from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone


from app.core.database import get_db 


from app.schemas.Esquema import VaticinioCreate, VaticinioResponse
from app.models.Modelo import Partido, Vaticinio, Puntaje

router = APIRouter(prefix="/vaticinios", tags=["Vaticinios"])

# ---------------------------------------------------------------------
# FUNCIONES AUXILIARES
# ---------------------------------------------------------------------

def validar_cierre_apuesta(fecha_partido: datetime):
    """
    Cierre automático 15 minutos antes del partido (Aware vs Naive safe).
    """
    ahora = datetime.now(fecha_partido.tzinfo) if fecha_partido.tzinfo else datetime.now(timezone.utc)
    
    # Asegurar que ambas fechas sean conscientes del timezone para la comparación
    if fecha_partido.tzinfo is None:
        fecha_partido = fecha_partido.replace(tzinfo=timezone.utc)
        ahora = datetime.now(timezone.utc)

    tiempo_limite = fecha_partido - timedelta(minutes=15)
    
    if ahora > tiempo_limite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Bloqueado: Las predicciones se cierran automáticamente 15 minutos antes del partido."
        )

def calcular_puntaje(goles_l_pred: int, goles_v_pred: int, goles_l_real: int, goles_v_real: int):
    """
    Retorna (puntos, acerto_resultado, acerto_marcador)
    """
    if goles_l_pred == goles_l_real and goles_v_pred == goles_v_real:
        return 3, True, True
        
    ganaba_local_pred = goles_l_pred > goles_v_pred
    ganaba_local_real = goles_l_real > goles_v_real
    
    ganaba_vis_pred = goles_l_pred < goles_v_pred
    ganaba_vis_real = goles_l_real < goles_v_real
    
    empate_pred = goles_l_pred == goles_v_pred
    empate_real = goles_l_real == goles_v_real
    
    if (ganaba_local_pred and ganaba_local_real) or \
       (ganaba_vis_pred and ganaba_vis_real) or \
       (empate_pred and empate_real):
        return 1, True, False
        
    return 0, False, False

# ---------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------

@router.post("/", response_model=VaticinioResponse, status_code=status.HTTP_201_CREATED)
def guardar_vaticinio(vaticinio: VaticinioCreate, db: Session = Depends(get_db)):
    
    # 1. VALIDACIÓN: Evitar duplicados (id_liga_miembro + id_partido)
    vaticinio_existente = db.query(Vaticinio).filter(
        Vaticinio.id_partido == vaticinio.id_partido, 
        Vaticinio.id_liga_miembro == vaticinio.id_liga_miembro
    ).first()
    
    if vaticinio_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Ya has registrado un vaticinio para este partido en esta liga."
        )

    # 2. Verificar existencia del partido
    partido = db.query(Partido).filter(Partido.id_partido == vaticinio.id_partido).first()
    if not partido:
        raise HTTPException(status_code=404, detail="El partido especificado no existe.")
    
    # 3. VALIDACIÓN: Regla de los 15 minutos antes
    validar_cierre_apuesta(partido.fecha_hora_inicio)
    
    # 4. Inserción mediante ORM
    nuevo_vaticinio = Vaticinio(
        id_partido=vaticinio.id_partido,
        id_liga_miembro=vaticinio.id_liga_miembro,
        goles_local_pred=vaticinio.goles_local_pred,
        goles_visitante_pred=vaticinio.goles_visitante_pred
    )
    
    try:
        db.add(nuevo_vaticinio)
        db.commit()
        db.refresh(nuevo_vaticinio)
        return {
            "id_vaticinio": nuevo_vaticinio.id_vaticinio,
            "id_liga_miembro": nuevo_vaticinio.id_liga_miembro,
            "id_partido": nuevo_vaticinio.id_partido,
            "goles_local_pred": nuevo_vaticinio.goles_local_pred,
            "goles_visitante_pred": nuevo_vaticinio.goles_visitante_pred,
            "fecha_registro": nuevo_vaticinio.fecha_registro.isoformat() if nuevo_vaticinio.fecha_registro else None,
            "fecha_modificacion": nuevo_vaticinio.fecha_modificacion.isoformat() if nuevo_vaticinio.fecha_modificacion else None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Error al guardar en la base de datos: {str(e)}"
        )


@router.post("/calcular-puntos/{partido_id}")
def procesar_puntos_partido(partido_id: int, goles_local_real: int, goles_visitante_real: int, db: Session = Depends(get_db)):
    partido = db.query(Partido).filter(Partido.id_partido == partido_id).first()
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado.")
        
    vaticinios = db.query(Vaticinio).filter(Vaticinio.id_partido == partido_id).all()
    
    contador_actualizados = 0
    for v in vaticinios:
        puntos, acerto_res, acerto_mar = calcular_puntaje(
            v.goles_local_pred, 
            v.goles_visitante_pred, 
            goles_local_real, 
            goles_visitante_real
        )
        
        # Buscar si ya tiene un registro en la tabla puntaje, si no, lo crea
        registro_puntaje = db.query(Puntaje).filter(Puntaje.id_vaticinio == v.id_vaticinio).first()
        
        if not registro_puntaje:
            registro_puntaje = Puntaje(id_vaticinio=v.id_vaticinio)
            db.add(registro_puntaje)
            
        registro_puntaje.puntos = puntos
        registro_puntaje.acerto_resultado = acerto_res
        registro_puntaje.acerto_marcador = acerto_mar
        
        contador_actualizados += 1
        
    try:
        db.commit()
        return {"message": f"Se calcularon y guardaron los puntos para {contador_actualizados} vaticinios exitosamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al actualizar puntajes: {str(e)}")