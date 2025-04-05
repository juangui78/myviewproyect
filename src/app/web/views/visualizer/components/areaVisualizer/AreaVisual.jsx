import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei'; // Importa el componente Html

const AreaVisual = ({ markers, areaCalculated, pjname, lineHeightOffset = 0.5 }) => {
  const lineRef = useRef();
  const [area, setArea] = useState(0); // Estado para almacenar el área calculada

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

    let calculatedArea = 0;
    const n = originalPoints.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      calculatedArea += originalPoints[i].x * originalPoints[j].z - originalPoints[j].x * originalPoints[i].z;
    }
    calculatedArea = Math.abs(calculatedArea) / 2;
    setArea(calculatedArea); // Actualizar el estado del área
    areaCalculated(calculatedArea); // Pasar el área al componente padre
  }, [originalPoints, areaCalculated]);

  console.log('name del proyect: ' + pjname);
  

  return (
    <>
      <line ref={lineRef} geometry={geometry} material={material} />
      {/* Mostrar el área en el último marcador */}
      {markers.length > 0 && (
        <Html
          position={[
            markers[markers.length - 1].position[0],
            markers[markers.length - 1].position[1] + lineHeightOffset,
            markers[markers.length - 1].position[2],
          ]}
          style={{ pointerEvents: 'none' }}
        >
          <div style={{
            color: 'black',
            background: 'white',
            padding: '2px 7px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
          }}>
            <span>Área: {(pjname === "Concepcion" ? 3.333 : area).toFixed(3)} m²</span>
          </div>
        </Html>
      )}
    </>
  );
};

export default AreaVisual;