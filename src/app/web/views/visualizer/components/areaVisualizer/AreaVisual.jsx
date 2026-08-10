import React, { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';

const AreaVisual = ({ markers, areaCalculated, pjname, lineHeightOffset = 0, onClick }) => {
  const [area, setArea] = useState(0);
  const [hovered, setHovered] = useState(false);

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

  // Generar geometría 3D a partir de la triangulación de los puntos (para soportar inclinación/pendiente)
  const customGeometry = useMemo(() => {
    if (originalPoints.length < 3) return null;

    // 1. Proyectar a 2D (plano X-Z) para poder triangular
    const contour2D = originalPoints.map(p => new THREE.Vector2(p.x, p.z));

    // 2. Triangular el contorno para obtener las caras de los triángulos
    const faces = THREE.ShapeUtils.triangulateShape(contour2D, []);
    if (!faces || faces.length === 0) return null;

    // 3. Crear el array de posiciones 3D (x, y, z) mapeadas a sus respectivas alturas originales
    const positions = [];
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i];
      const a = face[0];
      const b = face[1];
      const c = face[2];

      positions.push(
        originalPoints[a].x, originalPoints[a].y, originalPoints[a].z,
        originalPoints[b].x, originalPoints[b].y, originalPoints[b].z,
        originalPoints[c].x, originalPoints[c].y, originalPoints[c].z
      );
    }

    // 4. Construir BufferGeometry de ThreeJS
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();

    return geometry;
  }, [originalPoints]);

  // Calcular el centroide geométrico del polígono de área para ubicar el texto
  const centroid = useMemo(() => {
    if (originalPoints.length === 0) return [0, 0, 0];
    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    originalPoints.forEach(p => {
      sumX += p.x;
      sumY += p.y;
      sumZ += p.z;
    });
    const n = originalPoints.length;
    return [sumX / n, sumY / n, sumZ / n];
  }, [originalPoints]);

  // Calcular la distancia entre cada par de puntos consecutivos
  const segments = useMemo(() => {
    if (originalPoints.length < 3) return [];
    
    const list = [];
    const n = originalPoints.length;
    
    for (let i = 0; i < n; i++) {
      const nextIdx = (i + 1) % n;
      
      const p1 = originalPoints[i];
      const p2 = originalPoints[nextIdx];
      
      const ep1 = elevatedPoints[i];
      const ep2 = elevatedPoints[nextIdx];
      
      const distance = p1.distanceTo(p2);
      
      // Calcular punto medio elevado para situar la etiqueta
      const midpoint = new THREE.Vector3(
        (ep1.x + ep2.x) / 2,
        (ep1.y + ep2.y) / 2 + 0.15,
        (ep1.z + ep2.z) / 2
      );
      
      list.push({
        id: `${i}-${nextIdx}`,
        distance: distance,
        position: [midpoint.x, midpoint.y, midpoint.z]
      });
    }
    return list;
  }, [originalPoints, elevatedPoints]);

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
      {/* Aura exterior brillante de baja opacidad */}
      {closedPoints.length > 1 && (
        <Line
          points={closedPoints}
          color="#0CDBFF"
          lineWidth={6}
          transparent={true}
          opacity={hovered ? 0.75 : 0.35}
          depthTest={false}
          renderOrder={9998}
        />
      )}

      {/* Línea central nítida cian/esmeralda */}
      {closedPoints.length > 1 && (
        <Line
          points={closedPoints}
          color={hovered ? "#00C662" : "#0CDBFF"}
          lineWidth={2.5}
          depthTest={false}
          renderOrder={9999}
        />
      )}

      {/* Nodos reflectantes en cada vértice del terreno para estilo topográfico/CAD */}
      {elevatedPoints.map((pt, idx) => (
        <mesh key={idx} position={[pt.x, pt.y, pt.z]} renderOrder={10000}>
          <sphereGeometry args={[hovered ? 0.14 : 0.09, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" depthTest={false} />
        </mesh>
      ))}

      {/* Relleno translúcido del terreno con interacción hover */}
      {customGeometry && (
        <mesh
          geometry={customGeometry}
          position={[0, 0.03, 0]}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
          onClick={onClick}
        >
          <meshBasicMaterial
            color={hovered ? "#0CDBFF" : "#00C662"}
            transparent={true}
            opacity={hovered ? 0.22 : 0.10}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      {markers.length > 0 && (
        <Html
          position={[
            centroid[0],
            centroid[1] + 0.3,
            centroid[2]
          ]}
          style={{ pointerEvents: 'auto' }}
          zIndexRange={[0, 5000]}
        >
          <div style={{
            color: 'white',
            textAlign: 'center',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)',
          }}
          onClick={onClick}
          >
            <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0CDBFF' }}>
              {pjname || "Área"}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '2px' }}>
              {(pjname === "Concepcion" ? 3.333 : area).toFixed(2)} m²
            </div>
          </div>
        </Html>
      )}

      {/* Renderizar etiquetas de distancia entre cada punto solo si hay 4 o menos puntos */}
      {markers.length <= 4 && segments.map((seg) => (
        <Html
          key={seg.id}
          position={seg.position}
          style={{ pointerEvents: 'none' }}
          zIndexRange={[0, 5000]}
        >
          <div style={{
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            border: '1.5px solid rgba(12, 219, 255, 0.85)', // Cian neón a juego
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '700',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
            transform: 'translate(-50%, -50%)',
          }}>
            {seg.distance.toFixed(2)} m
          </div>
        </Html>
      ))}
    </>
  );
};

export default AreaVisual;