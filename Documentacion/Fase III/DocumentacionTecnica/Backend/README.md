# Documentación técnica del Backend

Esta documentación cubre únicamente la API de Python ubicada en `Backend/` y se basa en el código fuente, el archivo raíz `.env.example` y la configuración de Docker visible en el repositorio.

## Alcance

| Elemento         | Estado                                 |
| ---------------- | -------------------------------------- |
| Framework        | FastAPI                                |
| Persistencia     | PostgreSQL                             |
| Autenticación    | JWT Bearer + sesiones en base de datos |
| Despliegue local | Uvicorn / Docker                       |

## Archivos incluidos

| Archivo                                  | Propósito                         |
| ---------------------------------------- | --------------------------------- |
| [ARCHITECTURE.md](ARCHITECTURE.md)       | Visión general de la arquitectura |
| [API.md](API.md)                         | Rutas y endpoints expuestos       |
| [SETUP.md](SETUP.md)                     | Instalación y ejecución local     |
| [ENVIRONMENT.md](ENVIRONMENT.md)         | Variables de entorno              |
| [TESTING.md](TESTING.md)                 | Pruebas y validación              |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Problemas frecuentes              |

## Resumen funcional

El backend expone una API REST para autenticación, usuarios, ligas, vaticinios, invitaciones, clasificación, premios, administración y módulos del mundial. El punto de entrada crea la aplicación FastAPI, habilita CORS y registra los routers principales.
