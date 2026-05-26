from pydantic import BaseModel
from typing import Optional


class SoftDeletePremioRequest(BaseModel):
    """
    Datos opcionales para el soft delete de un premio.

    El usuario que ejecuta la accion se toma del token (admin
    autenticado), por lo que aqui solo viaja el motivo. No se
    elimina fisicamente el registro: se marca como eliminado.
    """

    motivo: Optional[str] = "Eliminacion logica desde panel administrativo"
