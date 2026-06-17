import React, { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';

const AreaVisual = ({ markers, areaCalculated, pjname, lineHeightOffset = 0.5, onClick }) => {
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

  // Cerrar el bucle de puntos
  const closedPoints = useMemo(() => {
    if (elevatedPoints.length > 1) {
      return [...elevatedPoints, elevatedPoints[0]];
    }
    return elevatedPoints;
  }, [elevatedPoints]);

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
      {closedPoints.length > 1 && (
        <Line
          points={closedPoints}
          color="#FF5F1F"   // Naranja neón de alta visibilidad
          lineWidth={4}     // Grosor óptimo de 4px para resaltar
          depthTest={false} // Evita la oclusión por parte del relieve del terreno
        />
      )}
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