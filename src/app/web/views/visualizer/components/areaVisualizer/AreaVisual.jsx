import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

const AreaVisual = ({ markers, areaCalculated, lineHeightOffset = 0.5 }) => {
  const lineRef = useRef();

  // Puntos originales para cálculo
  const originalPoints = useMemo(() => {
    return markers.map(marker => new THREE.Vector3(
      marker.position[0],
      marker.position[1],
      marker.position[2]
    ));
  }, [markers]);

  // Puntos elevados para visualización
  const elevatedPoints = useMemo(() => {
    return originalPoints.map(point => 
      new THREE.Vector3(
        point.x,
        point.y + lineHeightOffset,
        point.z
      )
    );
  }, [originalPoints, lineHeightOffset]);

  // Crear geometría con datos de línea
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const points = [...elevatedPoints];
    
    if (points.length > 1) {
      points.push(points[0]); // Cerrar el polígono
    }
    
    const positions = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Calcular distancias manualmente si es necesario
    const distances = new Float32Array(points.length);
    let total = 0;
    for (let i = 0; i < points.length; i++) {
      distances[i] = total;
      if (i > 0) {
        total += points[i].distanceTo(points[i - 1]);
      }
    }
    geom.setAttribute('lineDistance', new THREE.BufferAttribute(distances, 1));
    
    return geom;
  }, [elevatedPoints]);

  // Material con patrón de guiones
  const material = useMemo(() => new THREE.LineDashedMaterial({
    color: 0xffff00,
    dashSize: 0.5,
    gapSize: 0.3,
    linewidth: 2,
    depthTest: false
  }), []);

  // Cálculo del área
  useEffect(() => {
    if (originalPoints.length < 3) return;

    let area = 0;
    const n = originalPoints.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += originalPoints[i].x * originalPoints[j].z - originalPoints[j].x * originalPoints[i].z;
    }
    areaCalculated(Math.abs(area) / 2);
  }, [originalPoints, areaCalculated]);

  return (
    <line ref={lineRef} geometry={geometry} material={material} />
  );
};

export default AreaVisual;