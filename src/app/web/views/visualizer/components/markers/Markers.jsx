import React from 'react';
import { Html } from '@react-three/drei';

function Marker({ position, label, onClick }) {
    return (
        <mesh position={position} onClick={onClick}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="red" />
            <Html position={[0, 0.5, 0]} style={{ pointerEvents: 'none' }}>
                <div style={{
                    color: 'white',
                    background: 'black',
                    padding: '2px 5px',
                    borderRadius: '5px',
                }}>
                    {label}
                </div>
            </Html>
        </mesh>
    );
}

export default Marker;