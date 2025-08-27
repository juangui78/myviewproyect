import React from 'react';
import { Html } from '@react-three/drei';

function Marker360({ position, label, onClick, preview, hidden = false }) {
    // Opción 1: Elevar todo el marcador sumando altura a la posición Y
    const adjustedPosition = [position[0], position[1] + 6, position[2]];
    
    // Imagen por defecto si no se pasa preview
    const imageSource = '/images/lowprev.jpg';
    const finalImage = preview || imageSource;
    
    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick) {
            onClick();
        }
    };
    
    // Si está oculto, no renderizar nada
    if (hidden) {
        return null;
    }
    
    return (
        <group position={adjustedPosition}>
            <Html center style={{ 
                pointerEvents: 'auto',
                zIndex: hidden ? -1 : 'auto' // Controla el z-index
            }}>
                <style>
                    {`
                    .marker360-group:hover .marker360-preview {
                        transform: scale(2);
                        z-index: 2;
                        box-shadow: 0 0 12px #0008;
                    }
                    .marker360-group:hover .marker360-label {
                        transform: scale(1.3);
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