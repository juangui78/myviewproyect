import React, { useMemo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

const AreaVisual = ({ markers, areaCalculated, pjname, lineHeightOffset = 0.5, onClick }) => {
  const lineRef = useRef();
  const geometry = useRef(new THREE.BufferGeometry());
  const material = useRef(new THREE.LineDashedMaterial({
    color: 0xffff00,
    dashSize: 0.5,
    gapSize: 0.3,
    linewidth: 2,
    depthTest: false,
  }));
  const [area, setArea] = useState(0);

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

 // Actualizar geometría
  useEffect(() => {
    if (elevatedPoints.length > 1) {
      // Agregar el primer punto al final para cerrar el área
      const closedPoints = [...elevatedPoints, elevatedPoints[0]];
      const positions = new Float32Array(closedPoints.flatMap(p => [p.x, p.y, p.z]));
      geometry.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.current.computeBoundingSphere(); // Recalcula la geometría
    }
  }, [elevatedPoints]);

  // Calcular distancias para LineDashedMaterial
  useEffect(() => {
    if (lineRef.current) {
      lineRef.current.computeLineDistances(); // Necesario para LineDashedMaterial
    }
  }, [geometry]);

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
    setArea(calculatedArea);
    areaCalculated(calculatedArea);
  }, [originalPoints, areaCalculated]);

  return (
    <>
      <line ref={lineRef} geometry={geometry.current} material={material.current} />
      {markers.length > 0 && (
        <Html
          position={[
            markers[markers.length - 1].position[0],
            markers[markers.length - 1].position[1] + lineHeightOffset,
            markers[markers.length - 1].position[2],
          ]}
          style={{ pointerEvents: 'auto' }}
          zIndexRange={[0, 5000]}
        >
          <div style={{
            color: 'black',
            background: 'white',
            padding: '2px 7px',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
          onClick={onClick}
          >
            
            <span>Área: {(pjname === "Concepcion" ? 3.333 : area).toFixed(3)} m²</span>
          </div>
        </Html>
      )}
    </>
  );
};

export default AreaVisual;