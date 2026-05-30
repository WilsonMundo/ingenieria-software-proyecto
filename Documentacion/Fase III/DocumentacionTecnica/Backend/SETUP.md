# Instalación y ejecución del Backend

## Requisitos

| Requisito     | Observación                            |
| ------------- | -------------------------------------- |
| Python        | `python:3.12-slim` en Docker           |
| Base de datos | PostgreSQL                             |
| Dependencias  | Listadas en `backend/requirements.txt` |

## Instalación local

| Paso                  | Comando                                   |
| --------------------- | ----------------------------------------- |
| Crear entorno virtual | `python -m venv .venv`                    |
| Activar entorno       | `.venv\\Scripts\\Activate.ps1`            |
| Instalar dependencias | `pip install -r backend/requirements.txt` |

## Ejecución local

| Modo    | Comando                                           | Observación                      |
| ------- | ------------------------------------------------- | -------------------------------- |
| Uvicorn | `uvicorn app.main:app --host 0.0.0.0 --port 8000` | Desde la carpeta `backend/`      |
| Docker  | `docker compose up --build`                       | Usa el `docker-compose.yml` raíz |

## Docker

El `docker-compose.yml` raíz levanta:

| Servicio  | Descripción                                       |
| --------- | ------------------------------------------------- |
| `db`      | PostgreSQL con scripts de inicialización          |
| `backend` | API FastAPI construida desde `backend/Dockerfile` |

## Verificación rápida

| Acción           | Resultado esperado                                                   |
| ---------------- | -------------------------------------------------------------------- |
| Abrir `/`        | Respuesta `API funcionando correctamente`                            |
| Conectar a la DB | `test_connection.py` imprime conexión exitosa si PostgreSQL responde |
