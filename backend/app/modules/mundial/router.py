from fastapi import APIRouter
from .sedes import router as sedes_router
from .estadios import router as estadios_router
from .grupos import router as grupos_router
from .fases import router as fases_router
from .paises import router as paises_router
from .partidos import router as partidos_router
from .resultados import router as resultados_router
from .torneos import router as torneos_router

mundial_router = APIRouter(prefix="/api/v1", tags=["Mundial M5"])

mundial_router.include_router(torneos_router)
mundial_router.include_router(sedes_router)
mundial_router.include_router(estadios_router)
mundial_router.include_router(grupos_router)
mundial_router.include_router(fases_router)
mundial_router.include_router(paises_router)
mundial_router.include_router(partidos_router)
mundial_router.include_router(resultados_router)
