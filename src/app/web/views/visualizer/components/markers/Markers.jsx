import React from 'react';

function Marker({ position, label, onClick }) {
    return (
        <group position={position} onClick={onClick}>
            {/* Solid glowing core (Neon Orange) */}
            <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshBasicMaterial color="#FF5F1F" />
            </mesh>
        </group>
    );
}

export default Marker;