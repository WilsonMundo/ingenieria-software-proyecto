# Variables de entorno del Frontend

## Environments

| Archivo                      | production | `apiUrl`                                    | `apiBaseUrl`                         |
| ---------------------------- | ---------- | ------------------------------------------- | ------------------------------------ |
| `environment.ts`             | `false`    | `http://localhost:8000/api/v1`              | `http://localhost:8000`              |
| `environment.development.ts` | `false`    | `http://localhost:8000/api/v1`              | `http://localhost:8000`              |
| `environment.prod.ts`        | `true`     | `https://goltechapi.mundoalonzo.com/api/v1` | `https://goltechapi.mundoalonzo.com` |

## Notas

- Las variables observadas son de compilación, no de ejecución en el navegador.
- No se encontró un archivo de proxy adicional.
