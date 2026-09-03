---
name: ui-performance-checker
description: Pautas para optimizar renderizado en componentes React/Next.js y prevenir re-renders innecesarios.
---
# UI Performance Checker

- **Dynamic Imports**: Usar `next/dynamic` o lazy loading para módulos pesados del cliente (como el visualizador).
- **Imágenes**: Utilizar `next/image` con tamaños predefinidos y carga diferida (`loading="lazy"`).
- **Hooks y Re-renders**: Evitar dependencias inestables en `useEffect` y usar `useCallback`/`useMemo` en cálculos pesados.
- **Límites Client/Server**: Mantener lógica de datos en Server Components y restringir `'use client'` al mínimo necesario.
