---
name: visualizer-api-guard
description: Reglas para proteger y optimizar la API y el renderizado del visualizador en myview.
---
# Visualizer API Guard

- **Contrato de API**: No alterar los parámetros ni la estructura de retorno del endpoint `/api/controllers/visualizer/[id]`.
- **Manejo de Assets**: Validar la existencia e integridad de los recursos antes de procesarlos.
- **Cache y Rendimiento**: Mantener cabeceras de caché eficientes (`Cache-Control`) para evitar re-procesamientos pesados.
- **Respuesta Antifallos**: Retornar estados HTTP 404/400 con JSON limpio si el ID o recurso no es válido.
