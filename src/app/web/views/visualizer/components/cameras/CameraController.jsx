import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

const CameraController = ({ terrain }) => {
    const { camera, invalidate } = useThree();

    useEffect(() => {
        if (terrain && terrain.markers.length > 0) {
            // Calcula el centro del terreno
            const terrainCenter = terrain.markers.reduce(
                (center, marker) => {
                    return [
                        center[0] + marker.position[0] / terrain.markers.length,
                        center[1] + marker.position[1] / terrain.markers.length,
                        center[2] + marker.position[2] / terrain.markers.length,
                    ];
                },
                [0, 0, 0]
            );

            // Calcula los límites del terreno para determinar su tamaño
            const terrainBounds = terrain.markers.reduce(
                (bounds, marker) => {
                    return [
                        Math.min(bounds[0], marker.position[0]), // X mínimo
                        Math.max(bounds[1], marker.position[0]), // X máximo
                        Math.min(bounds[2], marker.position[2]), // Z mínimo
                        Math.max(bounds[3], marker.position[2]), // Z máximo
                    ];
                },
                [Infinity, -Infinity, Infinity, -Infinity]
            );
            const terrainWidth = terrainBounds[1] - terrainBounds[0]; // Ancho del terreno
            const terrainDepth = terrainBounds[3] - terrainBounds[2]; // Profundidad del terreno

            // Calcula una distancia adecuada para la cámara basada en el tamaño del terreno
            const distanceFactor = 1.5; // Factor para ajustar la distancia
            const minDistance = Math.max(terrainWidth, terrainDepth) * 0.5; // Distancia mínima
            const cameraDistance = Math.max(terrainWidth, terrainDepth) * distanceFactor;

            // Establece la posición de la cámara
            const cameraPosition = [
                terrainCenter[0], // X: Centrado en el terreno
                terrainCenter[1] + cameraDistance, // Y: Coloca la cámara arriba del terreno
                terrainCenter[2] + cameraDistance, // Z: Aleja la cámara hacia atrás
            ];

            // Aplica la nueva posición de la cámara
            camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);

            // Forza la actualización de la matriz de transformación de la cámara
            camera.updateMatrixWorld();

            // Asegúrate de que la cámara apunte al centro del terreno
            camera.lookAt(terrainCenter[0], terrainCenter[1], terrainCenter[2]);

            // Solicita una nueva renderización de la escena
            invalidate();

            console.log(terrainCenter, cameraPosition);
        }
    }, [terrain, camera, invalidate]);

    
    

    return null;
};

export default CameraController;