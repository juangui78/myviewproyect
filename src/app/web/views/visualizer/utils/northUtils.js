import * as THREE from 'three';

const _forward = new THREE.Vector3();

/**
 * Normaliza cualquier ángulo en grados al rango [0, 360).
 */
export function normalizeDegrees(deg) {
  const n = Number(deg);
  if (!Number.isFinite(n)) return 0;
  return ((n % 360) + 360) % 360;
}

/**
 * Obtiene el rumbo azimutal de la cámara en el espacio del mundo Three.js (0° = -Z, 90° = +X, 180° = +Z, 270° = -X).
 * Cuando la cámara mira casi verticalmente (vista en planta / cenital), utiliza el eje +X local de la cámara
 * rotado 90° en el plano horizontal (que siempre mantiene longitud unitaria sin gimbal lock ni inversión).
 */
export function getCameraWorldAzimuthDeg(camera) {
  if (!camera) return 0;

  camera.getWorldDirection(_forward);
  const horizLen = Math.hypot(_forward.x, _forward.z);

  let dirX = _forward.x;
  let dirZ = _forward.z;

  if (horizLen <= 0.02) {
    // Columna 0 de matrixWorld es el eje +X local (derecha de pantalla): (rx, ry, rz) = (te[0], te[1], te[2]).
    // Rotar 90° hacia adelante en el plano X-Z da (rz, -rx) = (te[2], -te[0]), unitario en cualquier inclinación.
    const te = camera.matrixWorld?.elements;
    if (te) {
      dirX = te[2];
      dirZ = -te[0];
    }
  }

  if (Math.hypot(dirX, dirZ) <= 0.00001) {
    return 0;
  }

  const angleRad = Math.atan2(dirX, -dirZ);
  const deg = (angleRad * 180) / Math.PI;
  return normalizeDegrees(deg);
}

/**
 * Obtiene el rumbo de la brújula relativo al Norte real calibrado del proyecto (northOffset).
 * - 0°   = Norte
 * - 90°  = Este (Salida del sol)
 * - 180° = Sur
 * - 270° = Oeste
 */
export function getCompassHeadingDeg(camera, northOffset = 0) {
  const worldAzimuth = getCameraWorldAzimuthDeg(camera);
  return normalizeDegrees(worldAzimuth - (Number(northOffset) || 0));
}

/**
 * Calcula la posición horizontal (x, z) a la que debe moverse la cámara orbital
 * alrededor de `target` para quedar mirando exactamente hacia el Norte real (northOffset).
 */
export function getNorthResetCameraPosition(target, cameraPosition, northOffset = 0) {
  const rawDist = Math.hypot(
    cameraPosition.x - target.x,
    cameraPosition.z - target.z
  );
  const horizontalDist = Math.max(rawDist, 0.001);
  const rad = (normalizeDegrees(northOffset) * Math.PI) / 180;

  return {
    x: target.x - horizontalDist * Math.sin(rad),
    z: target.z + horizontalDist * Math.cos(rad),
  };
}

/**
 * Calcula el Bounding Box ajustado del modelo 3D (descartando outliers extremos de fotogrametría)
 * y extrae la silueta 2D real (footprint en el plano X-Z) para dibujarla a escala exacta en el minimapa.
 */
export function computeModelBoundsAndFootprint(scene) {
  if (!scene) return null;

  scene.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(scene);
  if (rawBox.isEmpty()) {
    return {
      minX: -50, maxX: 50, minZ: -50, maxZ: 50, minY: 0, maxY: 10,
      width: 100, depth: 100, height: 10,
      centerX: 0, centerY: 5, centerZ: 0,
      footprint: []
    };
  }

  const xs = [];
  const ys = [];
  const zs = [];
  const tempV = new THREE.Vector3();

  let totalVertices = 0;
  scene.traverse((node) => {
    if (node.isMesh && node.geometry?.attributes?.position) {
      totalVertices += node.geometry.attributes.position.count;
    }
  });

  const maxSamples = 6000;
  const step = Math.max(1, Math.floor(totalVertices / maxSamples));

  scene.traverse((node) => {
    if (node.isMesh && node.geometry?.attributes?.position) {
      const posAttr = node.geometry.attributes.position;
      const count = posAttr.count;
      for (let i = 0; i < count; i += step) {
        tempV.fromBufferAttribute(posAttr, i).applyMatrix4(node.matrixWorld);
        if (Number.isFinite(tempV.x) && Number.isFinite(tempV.y) && Number.isFinite(tempV.z)) {
          xs.push(tempV.x);
          ys.push(tempV.y);
          zs.push(tempV.z);
        }
      }
    }
  });

  let minX = rawBox.min.x, maxX = rawBox.max.x;
  let minY = rawBox.min.y, maxY = rawBox.max.y;
  let minZ = rawBox.min.z, maxZ = rawBox.max.z;

  if (xs.length >= 30) {
    const sortedX = [...xs].sort((a, b) => a - b);
    const sortedY = [...ys].sort((a, b) => a - b);
    const sortedZ = [...zs].sort((a, b) => a - b);
    // Recortar 1% de puntos aislados para ceñirse al volumen real del modelo
    const pLow = Math.floor(xs.length * 0.01);
    const pHigh = Math.min(xs.length - 1, Math.ceil(xs.length * 0.99));
    minX = sortedX[pLow];
    maxX = sortedX[pHigh];
    minY = sortedY[pLow];
    maxY = sortedY[pHigh];
    minZ = sortedZ[pLow];
    maxZ = sortedZ[pHigh];
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const width = Math.max(maxX - minX, 1);
  const depth = Math.max(maxZ - minZ, 1);
  const height = Math.max(maxY - minY, 1);

  // Construir envolvente radial de 36 sectores (cada 10°) para la silueta 2D real del modelo
  const numSectors = 36;
  const maxRadii = new Float32Array(numSectors).fill(0);
  const sectorPoints = new Array(numSectors).fill(null);
  const halfW = (width / 2) * 1.05;
  const halfD = (depth / 2) * 1.05;

  for (let i = 0; i < xs.length; i++) {
    const vx = xs[i];
    const vz = zs[i];
    const dx = vx - centerX;
    const dz = vz - centerZ;
    if (Math.abs(dx) > halfW || Math.abs(dz) > halfD) continue;

    const r2 = dx * dx + dz * dz;
    let angle = Math.atan2(dz, dx);
    if (angle < 0) angle += Math.PI * 2;
    const sector = Math.min(numSectors - 1, Math.floor((angle / (Math.PI * 2)) * numSectors));
    if (r2 > maxRadii[sector]) {
      maxRadii[sector] = r2;
      sectorPoints[sector] = { x: vx, z: vz };
    }
  }

  const footprint = sectorPoints.filter(Boolean);

  return {
    minX, maxX, minZ, maxZ, minY, maxY,
    width, depth, height,
    centerX, centerY, centerZ,
    footprint
  };
}
