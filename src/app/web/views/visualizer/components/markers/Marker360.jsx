import React, { useRef, useMemo, memo } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';

function Marker360({ position, label, onClick, preview, hidden = false, picture }) {
    const groupRef = useRef();
    const { camera } = useThree();

    // Elevar todo el marcador sumando altura a la posición Y
    const posX = position?.[0] || 0;
    const posY = position?.[1] || 0;
    const posZ = position?.[2] || 0;
    const adjustedPosition = useMemo(() => [posX, posY + 6, posZ], [posX, posY, posZ]);

    const finalImage = picture || '/images/lowprev.jpg';

    // Calcular escala basada en distancia - ANTES del return condicional
    useFrame(() => {
        if (groupRef.current && !hidden) {
            const distance = camera.position.distanceTo(groupRef.current.position);

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
                    zIndex: 10
                }}
                distanceFactor={97}
                zIndexRange={[40, 0]}
            >
                <div
                    className="marker360-group group"
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
                            className="marker360-preview transition-all duration-200 hover:scale-125 hover:shadow-lg"
                            style={{
                                width: 62,
                                height: 32,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginBottom: 4,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.5)',
                            }}
                        />
                    ) : (
                        <div
                            className="marker360-preview transition-all duration-200 hover:scale-125 hover:shadow-lg"
                            style={{
                                width: 62,
                                height: 32,
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(4px)',
                                borderRadius: 8,
                                marginBottom: 4,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                            }}
                        />
                    )}
                    <span
                        className="marker360-label transition-transform duration-200 hover:scale-110"
                        style={{
                            color: 'white',
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(md)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: 11,
                            fontWeight: '500',
                            marginTop: 2,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {label}
                    </span>
                </div>
            </Html>
        </group>
    );
}

export default memo(Marker360);