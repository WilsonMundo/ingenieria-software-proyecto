# API del Backend

## Convenciones

| Aspecto        | Valor                                |
| -------------- | ------------------------------------ |
| Base URL local | `http://localhost:8000`              |
| Prefijo de API | `/api`                               |
| Autenticación  | Bearer token en endpoints protegidos |

## Endpoints

| Módulo            | Método | Ruta                                            | Protección | Descripción                                                                                |
| ----------------- | ------ | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| Salud             | GET    | `/`                                             | No         | Verifica que la API responde                                                               |
| Auth              | POST   | `/api/auth/login`                               | No         | Inicia sesión y devuelve access/refresh token                                              |
| Auth              | POST   | `/api/auth/registro`                            | No         | Registra un usuario                                                                        |
| Auth              | POST   | `/api/auth/olvido-contrasenia`                  | No         | Solicita recuperación de contraseña                                                        |
| Auth              | GET    | `/api/auth/perfil`                              | Sí         | Devuelve el perfil del usuario autenticado                                                 |
| Auth              | POST   | `/api/auth/logout`                              | No         | Revoca una sesión por refresh token                                                        |
| Auth              | PUT    | `/api/auth/cambiar-password`                    | Sí         | Cambia la contraseña del usuario autenticado                                               |
| Auth              | POST   | `/api/auth/reset-password`                      | No         | Restablece contraseña con token                                                            |
| Usuarios          | GET    | `/api/usuarios`                                 | Sí         | Lista usuarios visibles para el usuario autenticado                                        |
| Usuarios          | PATCH  | `/api/usuarios/{id_usuario}/dar-baja`           | Sí         | Da de baja un usuario                                                                      |
| Ligas             | GET    | `/api/ligas`                                    | Sí         | Lista ligas del usuario autenticado                                                        |
| Ligas             | GET    | `/api/ligas/{id_liga}`                          | Sí         | Obtiene una liga por id                                                                    |
| Ligas             | POST   | `/api/ligas`                                    | Sí         | Crea una liga                                                                              |
| Clasificación     | GET    | `/api/ligas/{id_liga}/clasificacion`            | No visible | Consulta clasificación de una liga                                                         |
| Clasificación     | GET    | `/api/ligas/{id_liga}/clasificacion/historico`  | No visible | Consulta histórico de clasificación                                                        |
| Clasificación     | POST   | `/api/ligas/{id_liga}/clasificacion/recalcular` | No visible | Recalcula clasificación                                                                    |
| Partidos          | GET    | `/api/partidos`                                 | No         | Lista partidos del mundial                                                                 |
| Vaticinios        | GET    | `/api/vaticinios/predicciones`                  | Sí         | Lista predicciones del usuario autenticado                                                 |
| Vaticinios        | POST   | `/api/vaticinios/{id_liga}`                     | Sí         | Crea un vaticinio en una liga                                                              |
| Vaticinios legado | POST   | `/vaticinios/`                                  | No visible | Guarda un vaticinio; endpoint alternativo encontrado en `app/api/controllers/vaticinio.py` |
| Vaticinios legado | POST   | `/vaticinios/calcular-puntos/{partido_id}`      | No visible | Calcula puntos para vaticinios de un partido                                               |
| Invitaciones      | POST   | `/api/invitaciones/enviar`                      | No visible | Envía invitación a una liga                                                                |
| Invitaciones      | GET    | `/api/invitaciones/validar/{token}`             | No visible | Valida una invitación                                                                      |
| Invitaciones      | POST   | `/api/invitaciones/aceptar`                     | No visible | Acepta una invitación                                                                      |
| Premios           | GET    | `/api/premios/ligas`                            | Admin      | Lista ligas de apuesta para administración                                                 |
| Premios           | POST   | `/api/premios/ligas/{id_liga}/cerrar`           | Admin      | Cierra una liga y calcula premios                                                          |
| Premios           | GET    | `/api/premios/ligas/{id_liga}`                  | Sí         | Consulta cierre y premios de una liga                                                      |
| Premios           | DELETE | `/api/premios/{id_premio}`                      | Admin      | Soft delete de premio                                                                      |
| Admin             | GET    | `/api/admin/audit-log`                          | Admin      | Consulta bitácora de auditoría                                                             |
| Admin             | GET    | `/api/admin/dashboard-global`                   | Admin      | Totales del panel administrativo                                                           |
| Admin             | GET    | `/api/admin/reportes/actividad`                 | Admin      | Reporte agregado de actividad                                                              |

## Nota sobre protección

Algunos routers usan dependencias de autenticación en el código y otros no las declaran de forma explícita en el archivo del router. Para documentación operativa se recomienda validar cada endpoint desde el servicio que lo implementa antes de exponerlo públicamente.
