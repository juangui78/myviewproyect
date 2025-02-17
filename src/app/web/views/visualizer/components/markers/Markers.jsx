import React from 'react';
import { Html } from '@react-three/drei';

function Marker({ position, label, onClick }) {
    return (
        <mesh position={position} onClick={onClick}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial color="red" />
            {/* <Html position={[0, 0.5, 0]} style={{ pointerEvents: 'none' }}>
                <div style={{
                    color: 'white',
                    background: 'black',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    display: 'flex',        // Usamos flex para alinear el texto y el número
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                }}>
                    <span>{label}</span>
                </div>
            </Html> */}
        </mesh>
    );
}

export default Marker;