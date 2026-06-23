import React from 'react';
import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';

const DistanceVisual = ({ markers, lineHeightOffset = 0 }) => {
  if (!markers || markers.length === 0) return null;

  return (
    <group>
      {/* Custom futuristic measurement markers */}
      {markers.map((marker, idx) => (
        <group key={marker.id || idx} position={marker.position}>
          {/* Inner solid glowing core */}
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#0CDBFF" />
          </mesh>
          {/* Outer futuristic holographic shell */}
          <mesh>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial 
              color="#0CDBFF" 
              transparent={true} 
              opacity={0.3} 
              wireframe={true}
            />
          </mesh>
        </group>
      ))}

      {/* Render line and distance label if there are 2 markers */}
      {markers.length >= 2 && (() => {
        const point1 = new THREE.Vector3(
          markers[0].position[0],
          markers[0].position[1] + lineHeightOffset,
          markers[0].position[2]
        );
        
        const point2 = new THREE.Vector3(
          markers[1].position[0],
          markers[1].position[1] + lineHeightOffset,
          markers[1].position[2]
        );

        const distance = point1.distanceTo(point2);
        const middlePoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);

        return (
          <>
            <Line
              points={[point1, point2]}
              color="#0CDBFF"
              lineWidth={3.5}
              depthTest={false}
              renderOrder={9999}
            />
            <Html
              position={[middlePoint.x, middlePoint.y + 0.3, middlePoint.z]}
              style={{ pointerEvents: 'none' }}
              zIndexRange={[0, 5000]}
            >
              <div style={{
                color: 'white',
                textAlign: 'center',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                whiteSpace: 'nowrap',
                textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)',
              }}>
                <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0CDBFF' }}>
                  Distancia
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '2px' }}>
                  {distance.toFixed(2)} m
                </div>
              </div>
            </Html>
          </>
        );
      })()}
    </group>
  );
};

export default DistanceVisual;
