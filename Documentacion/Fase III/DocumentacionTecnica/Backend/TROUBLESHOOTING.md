# Troubleshooting del Backend

| Problema                                   | Causa probable                                              | Acción                                                          |
| ------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------- |
| La API no arranca                          | Variables `DB_*` o `SECRET_KEY` faltantes                   | Revisar `.env` y `backend/app/core/config.py`                   |
| Error de conexión a PostgreSQL             | La DB no está levantada o `DB_HOST/DB_PORT` son incorrectos | Validar `docker compose ps` y la URL generada                   |
| CORS bloquea al frontend                   | `FRONTEND_URL` no coincide con la URL real                  | Ajustar la variable y reiniciar la API                          |
| 401 en endpoints protegidos                | Token ausente, inválido o expirado                          | Verificar `Authorization: Bearer ...`                           |
| 403 en endpoints de admin                  | El usuario no tiene rol `administrador`                     | Revisar rol y dependencia `get_current_admin`                   |
| Recuperación de contraseña no envía correo | `EMAIL_ENABLED` o SMTP incompletos                          | Confirmar variables SMTP y configuración del servicio de correo |
