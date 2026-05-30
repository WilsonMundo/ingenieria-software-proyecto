# Instalación y ejecución del Frontend

## Requisitos

| Requisito            | Valor observado |
| -------------------- | --------------- |
| Node package manager | `npm@10.9.2`    |
| Angular              | `21.x`          |

## Instalación

| Paso                  | Comando       |
| --------------------- | ------------- |
| Instalar dependencias | `npm install` |

## Ejecución local

| Tarea      | Comando                      | Observación                                 |
| ---------- | ---------------------------- | ------------------------------------------- |
| Desarrollo | `npm run start` o `ng serve` | Sirve en `http://localhost:4200/`           |
| Build      | `npm run build` o `ng build` | Usa configuración de producción por defecto |
| Tests      | `npm run test` o `ng test`   | Ejecuta pruebas unitarias                   |

## Configuración de build

| Entorno     | Reemplazo                                                                          |
| ----------- | ---------------------------------------------------------------------------------- |
| Development | `src/environments/environment.ts` -> `src/environments/environment.development.ts` |
| Production  | `src/environments/environment.ts` -> `src/environments/environment.prod.ts`        |
