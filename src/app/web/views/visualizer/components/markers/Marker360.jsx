import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

function Marker360({ position, label, onClick, preview, hidden = false, picture }) {
    const groupRef = useRef();
    const { camera } = useThree();
    
    // Opción 1: Elevar todo el marcador sumando altura a la posición Y
    const adjustedPosition = [position[0], position[1] + 6, position[2]];
    
    const finalImage = picture || '/images/lowprev.jpg';
    
    // Calcular escala basada en distancia - ANTES del return condicional
    useFrame(() => {
        if (groupRef.current && !hidden) {
            const distance = camera.position.distanceTo(groupRef.current.position);
            
            // Ajusta estos valores según necesites:
            const baseScale = 0.5;
            const scaleFactor = 0.01;
            const minScale = 0.3;
            const maxScale = 1.0;
            
            let scale = baseScale + distance * scaleFactor;
            scale = Math.max(minScale, Math.min(maxScale, scale));
            
            groupRef.current.scale.setScalar(scale);
        }
    });
    
    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    };
    
    // Si está oculto, no renderizar nada - DESPUÉS de los hooks
    if (hidden) {
        return null;
    }
    
    return (
        <group ref={groupRef} position={adjustedPosition}>
            <Html 
                center 
                style={{ 
                    pointerEvents: 'auto',
                    zIndex: 'auto'
                }}
                distanceFactor={97}
            >
                <style>
                    {`
                    .marker360-group:hover .marker360-preview {
                        transform: scale(1.4);
                        z-index: 2;
                        box-shadow: 0 0 12px #0008;
                    }
                    .marker360-group:hover .marker360-label {
                        transform: scale(1.2);
                        z-index: 2;
                    }
                    `}
                </style>
                <div
                    className="marker360-group"
                    onClick={handleClick}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                    }}
                >
                    {finalImage ? (
                        <img
                            src={finalImage}
                            alt="preview"
                            className="marker360-preview"
                            style={{
                                width: 62,
                                height: 32,
                                objectFit: 'cover',
                                borderRadius: 4,
                                marginBottom: 2,
                                boxShadow: '0 0 4px #0002',
                                transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
                            }}
                        />
                    ) : (
                        <div
                            className="marker360-preview"
                            style={{
                                width: 60,
                                height: 30,
                                background: '#fff',
                                borderRadius: 4,
                                marginBottom: 2,
                                boxShadow: '0 0 4px #0002',
                                transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
                            }}
                        />
                    )}
                    <span 
                        className="marker360-label"
                        style={{
                            color: 'black',
                            background: '#FFFFFF',
                            padding: '2px 7px',
                            borderRadius: '5px',
                            fontSize: 12,
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                            transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
                        }}
                    >
                        {label}
                    </span>
                </div>
            </Html>
        </group>
    );
}

export default Marker360;