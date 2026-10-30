// Gestor de almacenamiento Offline para MyView PWA (IndexedDB + Cache Storage)
// Mantiene una sola versión por proyecto y limpia automáticamente los archivos modificados.

const DB_NAME = 'myview-offline-db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';

export const SHELL_CACHE = 'myview-shell-v1';
export const MODELS_CACHE = 'myview-models-v1';
export const DATA_CACHE = 'myview-data-v1';

const OFFLINE_EVENT_NAME = 'myview:offline-changed';

function notifyOfflineChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_EVENT_NAME));
  }
}

export function onOfflineProjectsChange(callback) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(OFFLINE_EVENT_NAME, callback);
  return () => window.removeEventListener(OFFLINE_EVENT_NAME, callback);
}

export function isStandalonePwa() {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone === true
  );
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB no disponible'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: '_id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Selecciona exactamente el mismo modelo inicial y URLs que el visualizador (page.jsx)
export function selectPrimaryModelAndUrls(modelsList) {
  if (!Array.isArray(modelsList) || modelsList.length === 0) {
    return { selectedModel: null, selectedIndex: 0, urls: [] };
  }

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile =
    /Mobi|Android|iPad|iPhone|iPod/i.test(ua) ||
    (typeof window !== 'undefined' && window.innerWidth < 768);

  let safeIndex = 0;
  if (isMobile) {
    const mobileIdx = modelsList.findIndex((m) => {
      const name = (m.name || '').toLowerCase();
      const url = (m.model?.url || '').toLowerCase();
      return (
        name.includes('mobile') ||
        name.includes('móvil') ||
        url.includes('-mobile') ||
        url.includes('mobile')
      );
    });
    if (mobileIdx !== -1) {
      safeIndex = mobileIdx;
    } else {
      const withMobUrlIdx = modelsList.findIndex((m) =>
        Boolean(m.model?.mobileUrl)
      );
      safeIndex = withMobUrlIdx !== -1 ? withMobUrlIdx : 0;
    }
  } else {
    const highIdx = modelsList.findIndex((m) => {
      const name = (m.name || '').toLowerCase();
      const url = (m.model?.url || '').toLowerCase();
      return (
        (name.includes('high') ||
          url.includes('-high') ||
          name.includes('pc')) &&
        !name.includes('mobile') &&
        !url.includes('mobile') &&
        !name.includes('preview') &&
        !url.includes('preview')
      );
    });
    if (highIdx !== -1) {
      safeIndex = highIdx;
    } else {
      const stdIdx = modelsList.findIndex((m) => {
        const name = (m.name || '').toLowerCase();
        const url = (m.model?.url || '').toLowerCase();
        return (
          !name.includes('mobile') &&
          !url.includes('mobile') &&
          !name.includes('preview') &&
          !url.includes('preview')
        );
      });
      safeIndex = stdIdx !== -1 ? stdIdx : 0;
    }
  }

  const selectedModel = modelsList[safeIndex] || modelsList[0];
  const modelData = selectedModel?.model || {};
  const highUrl =
    isMobile && modelData.mobileUrl ? modelData.mobileUrl : modelData.url;
  const previewUrl =
    modelData.previewUrl && modelData.previewUrl !== highUrl
      ? modelData.previewUrl
      : null;

  const urls = [];
  if (previewUrl) urls.push(previewUrl);
  if (highUrl && !urls.includes(highUrl)) urls.push(highUrl);

  return { selectedModel, selectedIndex: safeIndex, urls, highUrl, previewUrl };
}

// Calcula una firma única de versión para saber si el modelo 3D o sus datos cambiaron
export function computeProjectSignature(projectObj, modelsList) {
  const { selectedModel, urls } = selectPrimaryModelAndUrls(modelsList);
  if (!selectedModel) return 'empty';
  const modelStamp = [
    selectedModel._id || '',
    selectedModel.updated_at || '',
    selectedModel.creation_date || '',
    urls.join('|'),
    JSON.stringify(selectedModel.terrains || []).length,
    JSON.stringify(selectedModel.markers || []).length,
    JSON.stringify(selectedModel.defaultCamera || {}),
    selectedModel.northOffset || 0,
    projectObj?.name || '',
    projectObj?.urlImage || '',
  ].join('::');

  return modelStamp;
}

// Pide al navegador que no purgue el almacenamiento de esta PWA
export async function requestPersistentStorage() {
  try {
    if (navigator?.storage?.persist) {
      await navigator.storage.persist();
    }
  } catch (_) {}
}

// Calienta en segundo plano el HTML y los chunks JS del visualizador y de /offline
export async function warmupVisualizerAndOfflineShell() {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const shellCache = await caches.open(SHELL_CACHE);

    const pagesToWarm = ['/offline', '/web/views/visualizer'];
    for (const pagePath of pagesToWarm) {
      try {
        const res = await fetch(pagePath, { credentials: 'same-origin' });
        if (res.ok) {
          const clone = res.clone();
          await shellCache.put(pagePath, clone);
          const html = await res.text();
          // Extraer todos los scripts y hojas de estilo de /_next/static/ referenciados
          const assetMatches =
            html.match(/\/_next\/static\/[^"'\s>]+/g) || [];
          const uniqueAssets = [...new Set(assetMatches)];
          await Promise.allSettled(
            uniqueAssets.map(async (assetUrl) => {
              const already = await shellCache.match(assetUrl);
              if (!already) {
                const assetRes = await fetch(assetUrl);
                if (assetRes.ok) {
                  await shellCache.put(assetUrl, assetRes);
                }
              }
            })
          );
        }
      } catch (_) {}
    }
  } catch (_) {}
}

// Descarga un archivo con seguimiento de progreso y lo guarda en caché
async function fetchAndCacheWithProgress(cache, url, onBytesLoaded) {
  const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) {
    throw new Error(`No se pudo descargar el recurso (${response.status})`);
  }

  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';
  const contentLength = Number(response.headers.get('content-length') || 0);

  if (!response.body || typeof response.body.getReader !== 'function') {
    const blob = await response.blob();
    onBytesLoaded?.(blob.size, blob.size);
    const cachedRes = new Response(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(blob.size),
      },
    });
    await cache.put(url, cachedRes);
    return blob.size;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      received += value.byteLength;
      onBytesLoaded?.(received, contentLength);
    }
  }

  const blob = new Blob(chunks, { type: contentType });
  const cachedRes = new Response(blob, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(blob.size),
    },
  });

  await cache.put(url, cachedRes);
  return blob.size;
}

// Guarda un proyecto para uso offline (solo la toma principal para optimizar almacenamiento)
export async function downloadProjectOffline(cardItem, onProgress) {
  const projectId = cardItem?._id;
  if (!projectId) throw new Error('ID de proyecto inválido');

  await requestPersistentStorage();
  warmupVisualizerAndOfflineShell();

  onProgress?.(5);

  const origin = window.location.origin;
  const visApiPath = `${origin}/api/controllers/visualizer/${projectId}`;
  const modelsApiPath = `${origin}/api/controllers/models_/${projectId}/allmodels`;

  const [visRes, modelsRes] = await Promise.all([
    fetch(`${visApiPath}?t=${Date.now()}`),
    fetch(`${modelsApiPath}?t=${Date.now()}`),
  ]);

  if (!visRes.ok || !modelsRes.ok) {
    throw new Error('No se pudo obtener la información del proyecto');
  }

  const [visData, modelsData] = await Promise.all([
    visRes.json(),
    modelsRes.json(),
  ]);

  const modelsList = Array.isArray(modelsData) ? modelsData : [];
  if (modelsList.length === 0) {
    throw new Error('Este proyecto aún no tiene modelos 3D cargados');
  }

  const { selectedModel, urls: modelUrls } =
    selectPrimaryModelAndUrls(modelsList);
  if (!selectedModel || modelUrls.length === 0) {
    throw new Error('No se encontró archivo 3D válido en el proyecto');
  }

  // Verificar si ya había una versión guardada para limpiar sus archivos antiguos después
  const existingRecord = await getOfflineProject(projectId);
  const oldUrls = existingRecord?.cachedUrls || [];

  const modelsCache = await caches.open(MODELS_CACHE);
  const dataCache = await caches.open(DATA_CACHE);

  const urlsToCache = [...modelUrls];
  const coverUrl = cardItem.urlImage || visData?.proyect?.urlImage;
  if (coverUrl && coverUrl.startsWith('http') && !urlsToCache.includes(coverUrl)) {
    urlsToCache.push(coverUrl);
  }

  onProgress?.(12);

  let totalBytes = 0;
  for (let i = 0; i < urlsToCache.length; i++) {
    const targetUrl = urlsToCache[i];
    const basePct = 12 + Math.round((i / urlsToCache.length) * 80);
    const spanPct = Math.round(80 / urlsToCache.length);

    const bytes = await fetchAndCacheWithProgress(
      modelsCache,
      targetUrl,
      (loaded, total) => {
        if (total > 0) {
          const stepPct = Math.min(
            spanPct,
            Math.round((loaded / total) * spanPct)
          );
          onProgress?.(Math.min(95, basePct + stepPct));
        }
      }
    );
    totalBytes += bytes;
  }

  // Guardar los JSON de API en DATA_CACHE (solo con el modelo principal para no intentar abrir tomas no descargadas)
  const offlineModelsPayload = [selectedModel];
  await dataCache.put(
    visApiPath,
    new Response(JSON.stringify(visData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );
  await dataCache.put(
    modelsApiPath,
    new Response(JSON.stringify(offlineModelsPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );

  // Limpiar cualquier archivo antiguo de este proyecto que ya no se use
  for (const oldUrl of oldUrls) {
    if (!urlsToCache.includes(oldUrl)) {
      await modelsCache.delete(oldUrl);
    }
  }

  const signature = computeProjectSignature(
    visData?.proyect || cardItem,
    modelsList
  );

  const record = {
    _id: String(projectId),
    encryptedId: cardItem.encryptedId || '',
    name: visData?.proyect?.name || cardItem.name || 'Proyecto',
    description:
      visData?.proyect?.description || cardItem.description || '',
    city: cardItem.city || '',
    department: cardItem.department || '',
    urlImage: coverUrl || '/images/parcela.jpg',
    lastScanDate:
      selectedModel.creation_date ||
      cardItem.lastScanDate ||
      new Date().toISOString(),
    syncedAt: new Date().toISOString(),
    bytes: totalBytes,
    modelId: String(selectedModel._id || ''),
    modelUpdatedAt: selectedModel.updated_at || selectedModel.creation_date || '',
    cachedUrls: urlsToCache,
    signature,
  };

  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    tx.objectStore(STORE_PROJECTS).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  onProgress?.(100);
  notifyOfflineChange();
  return record;
}

// Obtiene el registro offline de un proyecto por ID
export async function getOfflineProject(projectId) {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const req = tx.objectStore(STORE_PROJECTS).get(String(projectId));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (_) {
    return null;
  }
}

// Lista todos los proyectos guardados para el Feed Offline
export async function listOfflineProjects() {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const req = tx.objectStore(STORE_PROJECTS).getAll();
      req.onsuccess = () => {
        const list = Array.isArray(req.result) ? req.result : [];
        list.sort(
          (a, b) =>
            new Date(b.syncedAt || 0).getTime() -
            new Date(a.syncedAt || 0).getTime()
        );
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (_) {
    return [];
  }
}

// Elimina un proyecto del modo offline y borra todos sus archivos de la caché
export async function removeOfflineProject(projectId) {
  const idStr = String(projectId);
  const existing = await getOfflineProject(idStr);

  // Obtener otros proyectos para no borrar una imagen compartida por error
  const allProjects = await listOfflineProjects();
  const otherUrls = new Set();
  allProjects.forEach((p) => {
    if (p._id !== idStr && Array.isArray(p.cachedUrls)) {
      p.cachedUrls.forEach((u) => otherUrls.add(u));
    }
  });

  if ('caches' in window) {
    const modelsCache = await caches.open(MODELS_CACHE);
    const dataCache = await caches.open(DATA_CACHE);

    if (existing?.cachedUrls) {
      for (const u of existing.cachedUrls) {
        if (!otherUrls.has(u)) {
          await modelsCache.delete(u);
        }
      }
    }

    const origin = window.location.origin;
    await dataCache.delete(`${origin}/api/controllers/visualizer/${idStr}`);
    await dataCache.delete(
      `${origin}/api/controllers/models_/${idStr}/allmodels`
    );
  }

  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    tx.objectStore(STORE_PROJECTS).delete(idStr);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  notifyOfflineChange();
}

// Sincroniza automáticamente un proyecto descargado cuando se abre con internet
// y limpia los archivos antiguos si el modelo 3D fue reemplazado
export async function syncOfflineProjectIfDownloaded(
  projectId,
  freshProjectInfo,
  freshModelsList
) {
  if (typeof window === 'undefined' || !navigator.onLine) return null;
  const idStr = String(projectId);
  const existing = await getOfflineProject(idStr);
  if (!existing) return null; // No está marcado como disponible offline

  const modelsList = Array.isArray(freshModelsList) ? freshModelsList : [];
  if (modelsList.length === 0) return existing;

  const { selectedModel, urls: newModelUrls } =
    selectPrimaryModelAndUrls(modelsList);
  if (!selectedModel) return existing;

  const newSignature = computeProjectSignature(
    freshProjectInfo || existing,
    modelsList
  );

  const origin = window.location.origin;
  const visApiPath = `${origin}/api/controllers/visualizer/${idStr}`;
  const modelsApiPath = `${origin}/api/controllers/models_/${idStr}/allmodels`;

  const dataCache = await caches.open(DATA_CACHE);

  // Actualizar siempre el JSON del modelo principal (lotes disponibles, terrenos, marcadores, cámara)
  await dataCache.put(
    modelsApiPath,
    new Response(JSON.stringify([selectedModel]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  );

  if (freshProjectInfo) {
    await dataCache.put(
      visApiPath,
      new Response(
        JSON.stringify({ model: selectedModel, proyect: freshProjectInfo }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    );
  }

  // Si la firma no cambió, no hace falta tocar los archivos .glb
  if (existing.signature === newSignature) {
    return existing;
  }

  // Verificar si cambiaron las URLs de los archivos 3D (.glb) o la fecha del modelo
  const modelsCache = await caches.open(MODELS_CACHE);
  const coverUrl = freshProjectInfo?.urlImage || existing.urlImage;
  const nextUrlsToKeep = [...newModelUrls];
  if (
    coverUrl &&
    coverUrl.startsWith('http') &&
    !nextUrlsToKeep.includes(coverUrl)
  ) {
    nextUrlsToKeep.push(coverUrl);
  }

  const modelTimestampChanged =
    String(selectedModel._id || '') !== String(existing.modelId || '') ||
    String(selectedModel.updated_at || selectedModel.creation_date || '') !==
      String(existing.modelUpdatedAt || '');

  let totalBytes = existing.bytes || 0;
  let recalculatedBytes = 0;

  // Descargar cualquier URL nueva (o refrescar si cambió el modelo) antes de borrar la anterior
  for (const targetUrl of nextUrlsToKeep) {
    const alreadyCached = await modelsCache.match(targetUrl);
    const isGlb = targetUrl.includes('.glb');
    if (!alreadyCached || (isGlb && modelTimestampChanged)) {
      try {
        const size = await fetchAndCacheWithProgress(modelsCache, targetUrl);
        recalculatedBytes += size;
      } catch (err) {
        // Si falla la descarga en segundo plano, conservamos lo que había sin romper nada
        console.warn('No se pudo actualizar archivo offline:', err);
        return existing;
      }
    } else {
      const len = Number(alreadyCached.headers.get('content-length') || 0);
      recalculatedBytes += len;
    }
  }

  if (recalculatedBytes > 0) {
    totalBytes = recalculatedBytes;
  }

  // Limpiar de la caché cualquier archivo antiguo que haya sido reemplazado
  const oldUrls = Array.isArray(existing.cachedUrls) ? existing.cachedUrls : [];
  for (const oldUrl of oldUrls) {
    if (!nextUrlsToKeep.includes(oldUrl)) {
      await modelsCache.delete(oldUrl);
    }
  }

  const updatedRecord = {
    ...existing,
    name: freshProjectInfo?.name || existing.name,
    description: freshProjectInfo?.description || existing.description,
    urlImage: coverUrl || existing.urlImage,
    lastScanDate: selectedModel.creation_date || existing.lastScanDate,
    syncedAt: new Date().toISOString(),
    bytes: totalBytes,
    modelId: String(selectedModel._id || ''),
    modelUpdatedAt:
      selectedModel.updated_at || selectedModel.creation_date || '',
    cachedUrls: nextUrlsToKeep,
    signature: newSignature,
  };

  const db = await openDB();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    tx.objectStore(STORE_PROJECTS).put(updatedRecord);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  notifyOfflineChange();
  return updatedRecord;
}

// Sincroniza silenciosamente en el Feed los proyectos que ya están descargados
// y limpia archivos huérfanos en Cache Storage
export async function cleanupOrphanedOfflineFiles() {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const projects = await listOfflineProjects();
    const validUrls = new Set();
    projects.forEach((p) => {
      if (Array.isArray(p.cachedUrls)) {
        p.cachedUrls.forEach((u) => validUrls.add(u));
      }
    });

    const modelsCache = await caches.open(MODELS_CACHE);
    const keys = await modelsCache.keys();
    for (const req of keys) {
      if (!validUrls.has(req.url)) {
        await modelsCache.delete(req);
      }
    }
  } catch (_) {}
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${mb.toFixed(1)} MB`;
}
