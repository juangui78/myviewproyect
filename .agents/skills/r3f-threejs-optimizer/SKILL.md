---
name: r3f-threejs-optimizer
description: Pautas de optimización y prevención de memory leaks en React Three Fiber y Three.js.
---
# R3F & Three.js Optimizer

- **Gestión de Memoria (Dispose)**: Limpiar geometrías, materiales y texturas creados dinámicamente (`geometry.dispose()`, `material.dispose()`) en el `useEffect` de desmontaje para evitar fugas WebGL.
- **Mutaciones en Frame Loop (`useFrame`)**: No ejecutar `useState` dentro de `useFrame`. Modificar propiedades 3D directamente usando `refs` (`ref.current.rotation.y += 0.01`).
- **Carga de Modelos y Texturas**: Usar `useGLTF.preload()` y `Suspense` con fallbacks livianos. Reutilizar geometrías e instancias (`<instancedMesh>`) cuando existan múltiples objetos idénticos.
- **Configuración de Canvas**: Configurar `<Canvas gl={{ powerPreference: 'high-performance' }}>` y pausar renders en componentes ocultos o fuera del viewport.
