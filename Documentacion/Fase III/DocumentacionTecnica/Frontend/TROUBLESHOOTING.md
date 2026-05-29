# Troubleshooting del Frontend

| Problema                            | Causa probable                         | Acción                                            |
| ----------------------------------- | -------------------------------------- | ------------------------------------------------- |
| La app no carga                     | Dependencias no instaladas             | Ejecutar `npm install`                            |
| Error al llamar al backend          | URL mal configurada en `environment`   | Revisar `apiUrl` y `apiBaseUrl`                   |
| 401 en requests                     | Falta `access_token` en `localStorage` | Iniciar sesión nuevamente                         |
| Pantalla vacía o rutas no resuelven | Problema de routing o carga diferida   | Revisar `app.routes.ts` y los imports diferidos   |
| Fallas de estilos/Material          | Proveedores o tema incompletos         | Verificar `app.config.ts` y `material-theme.scss` |
