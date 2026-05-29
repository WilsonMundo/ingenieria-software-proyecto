# Integración con la API

## Base URL

| Entorno     | `apiUrl`                                    | `apiBaseUrl`                         |
| ----------- | ------------------------------------------- | ------------------------------------ |
| Development | `http://localhost:8000/api/v1`              | `http://localhost:8000`              |
| Production  | `https://goltechapi.mundoalonzo.com/api/v1` | `https://goltechapi.mundoalonzo.com` |

## Servicios confirmados

| Servicio             | Recurso                                                                                                         | Observación                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| AuthService          | `/api/auth`                                                                                                     | Login, registro, perfil, logout, cambio y reset de contraseña |
| AdminService         | `/api/admin`                                                                                                    | Dashboard, audit log y reportes                               |
| InvitacionService    | `/api/invitaciones`                                                                                             | Envío, validación y aceptación de invitaciones                |
| PremiosService       | `/api/premios`                                                                                                  | Ligas de apuesta, cierre y borrado lógico de premios          |
| LeaguesService       | `/api/ligas`, `/api/partidos`, `/api/vaticinios`                                                                | Gestión de ligas y creación de predicciones                   |
| Servicios de dominio | `/api/torneos`, `/api/paises`, `/api/estadios`, `/api/grupos`, `/api/fases`, `/api/partidos`, `/api/resultados` | CRUD y consultas del módulo del mundial                       |
| ClasificacionService | `/api/ligas`                                                                                                    | Clasificación, histórico y recálculo                          |

## Autenticación HTTP

El interceptor `auth.interceptor.ts` agrega el encabezado `Authorization: Bearer <token>` si existe `access_token` en `localStorage`. Algunos servicios también construyen manualmente el encabezado para asegurar la autenticación.

## Observaciones

- No se encontró configuración de proxy en `angular.json` ni en archivos de entorno visibles.
- El frontend mezcla consumo de `apiUrl` y `apiBaseUrl`; esto es relevante para documentar rutas exactas y evitar confusiones en despliegue.
