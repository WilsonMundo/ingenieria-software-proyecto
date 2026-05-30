# Variables de entorno del Backend

## Variables confirmadas

| Variable                      | Valor por defecto / ejemplo       | Uso                                    |
| ----------------------------- | --------------------------------- | -------------------------------------- |
| `DB_HOST`                     | requerido                         | Host de PostgreSQL                     |
| `DB_PORT`                     | requerido                         | Puerto de PostgreSQL                   |
| `DB_NAME`                     | `ligamundial_bd`                  | Nombre de la base de datos             |
| `DB_USER`                     | `postgres`                        | Usuario de base de datos               |
| `DB_PASSWORD`                 | `postgres`                        | Contraseña de base de datos            |
| `SECRET_KEY`                  | `change_me_in_production`         | Firma de JWT                           |
| `ALGORITHM`                   | `HS256`                           | Algoritmo JWT                          |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                              | Duración del access token              |
| `FRONTEND_URL`                | `http://localhost:4200`           | Origen del frontend permitido por CORS |
| `SMTP_HOST`                   | vacío                             | Envío de correos                       |
| `SMTP_PORT`                   | `587`                             | Puerto SMTP                            |
| `SMTP_USER`                   | vacío                             | Usuario SMTP                           |
| `SMTP_PASSWORD`               | vacío                             | Contraseña SMTP                        |
| `SMTP_FROM_EMAIL`             | vacío                             | Remitente SMTP                         |
| `SMTP_FROM_NAME`              | `Liga Mundial`                    | Nombre visible del remitente           |
| `EMAIL_ENABLED`               | `true` o `false` según despliegue | Activa envío de correos                |
| `APP_NAME`                    | `Liga Mundial API`                | Nombre lógico de la app                |
| `APP_ENV`                     | `development`                     | Entorno                                |
| `APP_DEBUG`                   | `true`                            | Modo debug                             |

## Archivo de referencia

El repositorio incluye [`.env.example`](../.env.example) con una plantilla mínima para desarrollo local.
