'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';

// Futuristic Holographic Scanner Gizmo (Sci-Fi Target) - Flat Red/Pink rings on the floor
const Gizmo = ({ position }) => {
    // Compute outer circle points (radius 0.5)
    const circlePoints = useMemo(() => {
        const pts = [];
        const segments = 32;
        const radius = 0.5;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
        }
        return pts;
    }, []);

    // Compute inner circle points (radius 0.18)
    const innerCirclePoints = useMemo(() => {
        const pts = [];
        const segments = 32;
        const radius = 0.18;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
        }
        return pts;
    }, []);

    if (!position) return null;
    
    // Lift it slightly to avoid z-fighting with the floor geometry
    const liftedPosition = [position.x, position.y + 0.015, position.z];
    
    return (
        <group position={liftedPosition}>
            {/* Concentric Outer Circle (Red) */}
            <Line
                points={circlePoints}
                color="#ff073a"
                lineWidth={1.8}
                depthTest={true}
                userData={{ isGizmo: true }}
            />
            {/* Concentric Inner Circle (Pink) */}
            <Line
                points={innerCirclePoints}
                color="#d500f9"
                lineWidth={1.5}
                depthTest={true}
                userData={{ isGizmo: true }}
            />
            
            {/* Scope Ticks along X and Z axes (Red) */}
            <Line
                points={[[-0.7, 0, 0], [-0.5, 0, 0]]}
                color="#ff073a"
                lineWidth={1.8}
                depthTest={true}
                userData={{ isGizmo: true }}
            />
            <Line
                points={[[0.5, 0, 0], [0.7, 0, 0]]}
                color="#ff073a"
                lineWidth={1.8}
                depthTest={true}
                userData={{ isGizmo: true }}
            />
            <Line
                points={[[0, 0, -0.7], [0, 0, -0.5]]}
                color="#ff073a"
                lineWidth={1.8}
                depthTest={true}
                userData={{ isGizmo: true }}
            />
            <Line
                points={[[0, 0, 0.5], [0, 0, 0.7]]}
                color="#ff073a"
                lineWidth={1.8}
                depthTest={true}
                userData={{ isGizmo: true }}
            />
            
            {/* Center target dot (Red) */}
            <mesh userData={{ isGizmo: true }}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color="#ff073a" depthWrite={true} depthTest={true} />
            </mesh>
        </group>
    );
};

const ClickHandler = ({ onAddMarker, onAddView360Marker, addView360Mode }) => {
    const { camera, scene, gl } = useThree();
    const [hoverPoint, setHoverPoint] = useState(null);
    const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 });
    const magnifierCanvasRef = useRef(null);

    const handleCanvasClick = (event) => {
        if (event.button !== 0) return;
        const canvas = gl.domElement;
        const rect = canvas.getBoundingClientRect();

        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(scene.children, true)
            .filter(item => !item.object.userData?.isGizmo);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            console.log('Intersección en:', intersectPoint);
            if (addView360Mode) {
                onAddView360Marker([intersectPoint.x, intersectPoint.y, intersectPoint.z]);
            } else {
                onAddMarker([intersectPoint.x, intersectPoint.y, intersectPoint.z]);
            }
        }
    };

    // Track mouse movement and perform pointer coordinates updates
    useEffect(() => {
        const canvas = gl.domElement;

        const handlePointerMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            setMouseScreenPos({ x: event.clientX, y: event.clientY });

            const mouse = new THREE.Vector2(
                (mouseX / rect.width) * 2 - 1,
                -(mouseY / rect.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children, true)
                .filter(item => !item.object.userData?.isGizmo);

            if (intersects.length > 0) {
                setHoverPoint(intersects[0].point);
            } else {
                setHoverPoint(null);
            }
        };

        const handlePointerLeave = () => {
            setHoverPoint(null);
        };

        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerleave', handlePointerLeave);

        return () => {
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerleave', handlePointerLeave);
        };
    }, [camera, scene, gl]);

    // Renders the magnifier zoom bubble inside the animation loop
    useFrame(() => {
        if (!hoverPoint || !magnifierCanvasRef.current) return;

        const canvas2d = magnifierCanvasRef.current;
        const ctx = canvas2d.getContext('2d');
        if (!ctx) return;

        const canvas3d = gl.domElement;
        const rect = canvas3d.getBoundingClientRect();

        const x = mouseScreenPos.x - rect.left;
        const y = mouseScreenPos.y - rect.top;

        const scaleX = canvas3d.width / rect.width;
        const scaleY = canvas3d.height / rect.height;

        const sx_center = x * scaleX;
        const sy_center = y * scaleY;

        const magnifierSize = 200;
        const zoomLevel = 2.5;

        // Source dimensions in WebGL pixels
        const sw = (magnifierSize / zoomLevel) * scaleX;
        const sh = (magnifierSize / zoomLevel) * scaleY;

        // Source top-left corner
        const sx = sx_center - sw / 2;
        const sy = sy_center - sh / 2;

        ctx.clearRect(0, 0, magnifierSize, magnifierSize);

        // Apply high-quality interpolation smoothing to reduce pixelation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        try {
            ctx.drawImage(canvas3d, sx, sy, sw, sh, 0, 0, magnifierSize, magnifierSize);
        } catch (e) {
            // Silence DOMException if canvas dimensions are not yet loaded
        }
    });

    // Flip magnifier position if it overflows the top of the viewport
    const magnifierY = mouseScreenPos.y < 250 ? mouseScreenPos.y + 50 : mouseScreenPos.y - 230;
    const magnifierX = mouseScreenPos.x - 100;

    return (
        <group>
            {/* The invisible plane that handles clicking fallback */}
            <mesh
                onPointerDown={handleCanvasClick}
                position={[0, 0, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                visible={false}
            >
                <planeGeometry args={[2000, 2000]} />
                <meshBasicMaterial color="blue" transparent={true} opacity={0} />
            </mesh>

            {/* Render 3D Hover Gizmo */}
            {hoverPoint && <Gizmo position={hoverPoint} />}

            {/* Render Magnifier DOM Overlay using Html */}
            {hoverPoint && (
                <Html calculatePosition={() => [0, 0, 0]} style={{ pointerEvents: 'none' }}>
                    <div
                        style={{
                            position: 'fixed',
                            left: `${magnifierX}px`,
                            top: `${magnifierY}px`,
                            width: '200px',
                            height: '200px',
                            borderRadius: '50%',
                            border: '1px solid rgba(136, 136, 136, 0.6)', // Sleek, thin border matching reference
                            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35), inset 0 0 10px rgba(0,0,0,0.15)',
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            zIndex: 999999,
                            backgroundColor: '#1e1e1e',
                        }}
                    >
                        <canvas
                            ref={magnifierCanvasRef}
                            width={200}
                            height={200}
                            style={{
                                width: '200px',
                                height: '200px',
                                display: 'block',
                                borderRadius: '50%',
                            }}
                        />
                    </div>
                </Html>
            )}
        </group>
    );
};

export default ClickHandler;
