import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.controllers.auth_controller import router as auth_router
from app.api.controllers.invitacion_controller import router as invitacion_router
from app.core.logging import configure_logging

configure_logging()
logger = logging.getLogger("app")

app = FastAPI(
    title="Liga Mundial API",
    version="1.0.0"
)

origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(invitacion_router)


@app.middleware("http")
async def log_server_errors(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        duration_ms = (time.perf_counter() - start) * 1000
        logger.exception(
            "Unhandled error method=%s path=%s duration_ms=%.2f",
            request.method,
            request.url.path,
            duration_ms,
        )
        raise

    duration_ms = (time.perf_counter() - start) * 1000
    if response.status_code >= 500:
        logger.error(
            "Server error method=%s path=%s status=%s duration_ms=%.2f",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )

    return response


@app.get("/")
def root():
    return "API funcionando correctamente"