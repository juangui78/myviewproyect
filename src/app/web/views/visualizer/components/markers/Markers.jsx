import React from 'react';
import { Html } from '@react-three/drei';

function Marker({ position, label, onClick }) {
    return (
        <group position={position} onClick={onClick}>
            {/* Inner solid glowing core (Neon Orange) */}
            <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#FF5F1F" />
            </mesh>
            
            {/* Outer holographic shell (Neon Orange) */}
            <mesh>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial 
                    color="#FF5F1F" 
                    transparent={true} 
                    opacity={0.3} 
                    wireframe={true}
                />
            </mesh>
        </group>
    );
}

export default Marker;