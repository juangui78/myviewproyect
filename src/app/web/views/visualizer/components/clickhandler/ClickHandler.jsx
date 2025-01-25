'use client';
import React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const ClickHandler = ({ onAddMarker }) => {
    const { camera, scene, gl } = useThree(); // Obtenemos 'gl' para acceder al canvas

    const handleCanvasClick = (event) => {

        if (event.button !== 0) return;
        const canvas = gl.domElement; // Obtenemos el canvas del contexto de Three.js
        const rect = canvas.getBoundingClientRect(); // Obtén las dimensiones y posición del canvas en la pantalla

        // Calcula la posición del mouse relativa al canvas
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        // Configura el raycaster
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // Intersecta con la geometría de los objetos en la escena
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point; // Punto de intersección exacto
            console.log('Intersección en:', intersectPoint);
            
            // Agrega el marcador en el punto de intersección
            onAddMarker([intersectPoint.x, intersectPoint.y, intersectPoint.z]);
        }
    };

    return (
        <mesh
            onPointerDown={handleCanvasClick}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            visible={false}
        >
            <planeGeometry args={[2000, 2000]} />
            <meshBasicMaterial color="blue" transparent={true} opacity={0} />
        </mesh>
    );
};

export default ClickHandler;

