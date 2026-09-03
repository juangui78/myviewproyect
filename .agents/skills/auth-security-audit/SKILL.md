---
name: auth-security-audit
description: Reglas y verificación de seguridad para autenticación, cifrado crypto.js, cookies de sesión y tokens.
---
# Auditoría de Autenticación y Seguridad

- **Cifrado**: No modificar ni omitir funciones en `crypto.js` sin confirmación previa.
- **Cabeceras y Cookies**: Asegurar cookies con `HttpOnly`, `Secure` y `SameSite=Lax/Strict`.
- **Validación de Token/Sesión**: Verificar la presencia y validez del token en middleware o controladores de rutas protegidas.
- **Sanitización**: No exponer hashes, secretos, ni datos de usuario sensibles en las respuestas de la API.
