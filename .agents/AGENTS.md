# Reglas del Proyecto

- **Funcionamiento vital**: No romper flujos críticos (autenticación, empresas/leads, API visualizador, crypto). Mantener firmas de funciones y contratos de API.
- **Edición quirúrgica**: Cambios mínimos y acotados. Respetar estructura Next.js existente. No alterar `.env` ni credenciales.
- **Verificación**: Validar sintaxis y build antes de concluir. Diagnosticar con logs reales, no silenciar errores.
- **Confirmación previa**: Consultar antes de borrar archivos core, cambiar seguridad/auth o modificar `package.json`.
