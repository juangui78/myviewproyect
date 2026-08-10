---
name: nextjs-router-checker
description: Guía rápida para verificar la validez de rutas App Router, status HTTP, NextResponse y manejo de errores en Next.js.
---
# Verificación de Rutas Next.js

- **Respuestas API**: Usar siempre `NextResponse.json(data, { status })` con código HTTP explícito.
- **Manejo de errores**: Envolver controladores en `try/catch` retornando JSON consistente `{ error: string }`.
- **Params dinámicos**: Validar presencia de `params` o `searchParams` antes de procesar la solicitud.
- **Rutas Client vs Server**: Asegurar `'use client'` únicamente cuando se usen hooks (`useState`, `useEffect`, etc.).
