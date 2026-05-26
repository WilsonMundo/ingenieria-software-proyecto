# Proceso 6 - Premios, Auditoria y Panel Global (M6 + M7)

Esta guia describe como quedo integrado el Proceso 6 dentro del **proyecto
principal**, adaptado desde el prototipo que se desarrollo en el proyecto
Angular aparte.

## Que se agrego

### Backend (FastAPI, arquitectura por capas del principal)

| Archivo | Descripcion |
|---|---|
| `backend/sql/proceso6_premios_auditoria.sql` | Script **idempotente** que crea las tablas y triggers del proceso 6 sobre el esquema existente. |
| `backend/app/schemas/premio_schema.py` | Schema de request para el soft delete de premios. |
| `backend/app/services/premio_service.py` | Motor de premios (M6): cierre de liga, ranking, empates, comision, fondo global, soft delete. |
| `backend/app/services/admin_service.py` | Panel global (M7): bitacora de auditoria, dashboard global y reporte de actividad. |
| `backend/app/api/controllers/premio_controller.py` | Endpoints `/api/premios/...` |
| `backend/app/api/controllers/admin_controller.py` | Endpoints `/api/admin/...` |

Cambios sobre archivos existentes:

- `backend/app/main.py`: se registran los routers `premio_router` y `admin_router`.
- `backend/app/core/dependencies.py`: se agrega la dependencia `get_current_admin` (reutiliza `get_current_user` y exige rol `administrador`).
- `backend/app/models/liga.py`: se agrega la columna `modalidad_liga`.

### Endpoints

| Metodo | Ruta | Acceso |
|---|---|---|
| POST | `/api/premios/ligas/{id_liga}/cerrar` | Administrador |
| GET | `/api/premios/ligas/{id_liga}` | Autenticado |
| DELETE | `/api/premios/{id_premio}` | Administrador |
| GET | `/api/admin/audit-log` | Administrador |
| GET | `/api/admin/dashboard-global` | Administrador |
| GET | `/api/admin/reportes/actividad` | Administrador |

> Nota: el prototipo original no tenia autenticacion. En el principal todos los
> endpoints del panel (M7) y las acciones de escritura del motor de premios (M6)
> se protegieron con JWT + rol `administrador`, igual que el resto del proyecto.
> El usuario que ejecuta el soft delete se toma del token (no del body).

### Frontend (Angular 21, convencion `pages/` + `services/` del principal)

| Archivo | Descripcion |
|---|---|
| `frontend/src/app/services/premios-service.ts` | Cliente HTTP del motor de premios (envia el Bearer token). |
| `frontend/src/app/services/admin-service.ts` | Cliente HTTP del panel administrativo (envia el Bearer token). |
| `frontend/src/app/pages/premios/premios-liga-componente/` | Vista de premios de una liga. |
| `frontend/src/app/pages/admin/dashboard-global-componente/` | Panel global. |
| `frontend/src/app/pages/admin/audit-log-componente/` | Bitacora de auditoria. |
| `frontend/src/app/pages/admin/reportes-actividad-componente/` | Reportes de actividad. |

Cambios sobre archivos existentes:

- `frontend/src/app/app.routes.ts`: rutas nuevas `admin/dashboard-global`, `admin/auditoria`, `admin/reportes`, `premios/liga/:id`.
- `frontend/angular.json`: se agrega `src/material-theme.scss` a `styles` (las vistas usan Angular Material).
- `frontend/src/app/pages/dashboard/.../dashboard-componente.{ts,html}`: accesos en el menu lateral (Panel Global, Auditoria, Reportes).

## Como ponerlo a correr

1. **Base de datos** (PostgreSQL del proyecto principal):
   ```bash
   psql -U <usuario> -d <base_principal> -f backend/sql/proceso6_premios_auditoria.sql
   ```
   El script se puede correr varias veces sin error (usa `IF NOT EXISTS` y recrea
   los triggers). Crea `cierre_liga`, `distribucion_premio`, `premio`, `audit_log`,
   agrega `modalidad_liga` a `liga`, las columnas de soft delete y la funcion +
   triggers de auditoria.

2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Dependencia importante

El calculo del ranking (al cerrar una liga) suma puntos desde las tablas
`vaticinio` y `puntaje`, que pertenecen al proceso de puntajes/pronosticos.
El script SQL las crea **solo si no existen** (`CREATE TABLE IF NOT EXISTS`)
para que el motor de premios se pueda probar de forma aislada; si el equipo de
ese proceso ya las creo con su propio esquema, el script las respeta y no las
modifica.
