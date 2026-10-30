// Service Worker para MyView PWA (Solo activo en modo standalone / app instalada)
const SHELL_CACHE = 'myview-shell-v1';
const MODELS_CACHE = 'myview-models-v1';
const DATA_CACHE = 'myview-data-v1';

// Recursos base indispensables para el visor 3D y modo offline
const PRECACHE_ASSETS = [
  '/offline',
  '/web/views/visualizer',
  '/manifest.webmanifest',
  '/draco/draco_decoder.js',
  '/draco/draco_decoder.wasm',
  '/draco/draco_wasm_wrapper.js',
  '/basis/basis_transcoder.js',
  '/basis/basis_transcoder.wasm',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/logos/isotipo-full-color.png',
  '/logos/completo-fullblanco.png',
  '/images/parcela.jpg',
  '/images/op11.webp',
  '/fonts/WorkSans-VariableFont_wght.woff2',
  '/fonts/WorkSans-Italic-VariableFont_wght.woff2',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      // Precargar de forma tolerante a fallos individuales para no abortar la instalación
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url, { cache: 'reload' }).then((res) => {
            if (res.ok) return cache.put(url, res);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const validCaches = new Set([SHELL_CACHE, MODELS_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!validCaches.has(key)) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Normaliza URLs de datos ignorando query params efímeros como ?t=Date.now()
function getNormalizedDataCacheKey(urlObj) {
  return `${urlObj.origin}${urlObj.pathname}`;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Nunca interceptar métodos que no sean GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca interceptar autenticación ni rutas sensibles
  if (url.pathname.startsWith('/api/auth')) return;

  // 1. Archivos 3D (.glb) e imágenes de proyectos guardados en MYVIEW_MODELS_CACHE (incluye CloudFront)
  if (
    url.pathname.endsWith('.glb') ||
    url.hostname.includes('cloudfront.net')
  ) {
    event.respondWith(
      caches.open(MODELS_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request, { ignoreVary: true });
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request);
      })
    );
    return;
  }

  // 2. Endpoints de datos del visualizador (GET /api/controllers/visualizer/[id] y /allmodels)
  const isVisualizerApi =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/api/controllers/visualizer/') ||
      (url.pathname.startsWith('/api/controllers/models_/') &&
        url.pathname.endsWith('/allmodels')));

  if (isVisualizerApi) {
    const cacheKey = getNormalizedDataCacheKey(url);
    event.respondWith(
      (async () => {
        const dataCache = await caches.open(DATA_CACHE);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            // Si este proyecto ya estaba guardado en DATA_CACHE, actualizamos su JSON automáticamente
            const existing = await dataCache.match(cacheKey);
            if (existing) {
              dataCache.put(cacheKey, networkResponse.clone());
            }
          }
          return networkResponse;
        } catch (err) {
          // Sin conexión: devolver la copia guardada en DATA_CACHE
          const cached = await dataCache.match(cacheKey);
          if (cached) return cached;
          throw err;
        }
      })()
    );
    return;
  }

  // Ignorar cualquier otra ruta /api/*
  if (url.pathname.startsWith('/api/')) return;

  // Ignorar peticiones Next RSC (_rsc) para que Next.js haga fallback o manejo limpio
  if (url.searchParams.has('_rsc')) {
    event.respondWith(
      fetch(request).catch(async () => {
        return new Response('', { status: 504, statusText: 'Offline' });
      })
    );
    return;
  }

  // 3. Assets estáticos de Next.js, decoders (draco/basis), fuentes, íconos y logos -> Cache-First + actualización en caché
  const isStaticAsset =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/draco/') ||
      url.pathname.startsWith('/basis/') ||
      url.pathname.startsWith('/fonts/') ||
      url.pathname.startsWith('/icons/') ||
      url.pathname.startsWith('/logos/') ||
      url.pathname.startsWith('/images/'));

  if (isStaticAsset) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const netRes = await fetch(request);
          if (netRes && netRes.ok) {
            cache.put(request, netRes.clone());
          }
          return netRes;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      })
    );
    return;
  }

  // 4. Navegaciones de páginas (HTML) -> Network-First con fallback a caché o Feed Offline
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const shellCache = await caches.open(SHELL_CACHE);
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            // Guardar siempre el HTML más reciente del visualizador y de /offline
            if (url.pathname === '/web/views/visualizer') {
              shellCache.put('/web/views/visualizer', networkResponse.clone());
            } else if (url.pathname === '/offline') {
              shellCache.put('/offline', networkResponse.clone());
            }
          }
          return networkResponse;
        } catch (err) {
          // Sin conexión:
          // Si navega al visualizador, servir el shell del visualizador guardado
          if (url.pathname.startsWith('/web/views/visualizer')) {
            const cachedVis =
              (await shellCache.match('/web/views/visualizer')) ||
              (await shellCache.match(request, { ignoreSearch: true }));
            if (cachedVis) return cachedVis;
          }

          // Para el feed (/web/views/user/feed), inicio (/) o cualquier otra vista sin conexión,
          // mostrar el Feed Offline idéntico con los proyectos descargados
          const cachedOfflineFeed = await shellCache.match('/offline');
          if (cachedOfflineFeed) return cachedOfflineFeed;

          return new Response(
            '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MyView Offline</title><style>body{background:#030D1C;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:20px}</style></head><body><div><h2>Sin conexión a Internet</h2><p>Conéctate una vez para terminar de preparar el modo offline.</p></div></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        }
      })()
    );
  }
});
