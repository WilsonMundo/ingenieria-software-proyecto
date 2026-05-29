# Pruebas del Backend

## Estado actual

| Tipo                   | Estado                             |
| ---------------------- | ---------------------------------- |
| Suite automatizada     | No confirmada en el árbol revisado |
| Script de conectividad | Sí: `backend/test_connection.py`   |

## Validaciones útiles

| Validación            | Método                                |
| --------------------- | ------------------------------------- |
| Arranque de API       | Levantar Uvicorn y abrir `/`          |
| Conexión a PostgreSQL | Ejecutar `backend/test_connection.py` |
| Docker completo       | `docker compose up --build`           |

## TODO

- TODO: Confirmar si existen tests automatizados adicionales fuera de `backend/tests/`.
- TODO: Confirmar si hay fixtures o pruebas de integración para routers y servicios.
