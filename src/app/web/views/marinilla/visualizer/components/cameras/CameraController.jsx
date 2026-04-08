import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import gsap from "gsap";

const CameraController = ({ terrain  }) => {
    const { camera, invalidate } = useThree();

    useEffect(() => {
        if (!terrain?.markers?.length) return;

        // 1. Cancelar animaciones previas de la cámara
        gsap.killTweensOf(camera.position);
        
        // 2. Calcular el centro geométrico del terreno
        const terrainBounds = terrain.markers.reduce(
            (bounds, marker) => [
                Math.min(bounds[0], marker.position[0]),
                Math.max(bounds[1], marker.position[0]),
                Math.min(bounds[2], marker.position[1]),
                Math.max(bounds[3], marker.position[1]),
                Math.min(bounds[4], marker.position[2]),
                Math.max(bounds[5], marker.position[2]),
            ],
            [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity]
        );

        const terrainCenter = [
            (terrainBounds[0] + terrainBounds[1]) / 2,
            (terrainBounds[2] + terrainBounds[3]) / 2,
            (terrainBounds[4] + terrainBounds[5]) / 2,
        ];


        // 3. Calcular posición de la cámara con orientación forzada
        const maxDimension = Math.max(
            terrainBounds[1] - terrainBounds[0],
            terrainBounds[3] - terrainBounds[2],
            terrainBounds[5] - terrainBounds[4]
        );
        
        const cameraDistance = maxDimension * 2;
        const cameraPosition = [
            terrainCenter[0] + cameraDistance,
            terrainCenter[1] + cameraDistance,
            terrainCenter[2] + cameraDistance,
        ];

        // 4. Configurar rotación inicial antes de animar
        camera.lookAt(...terrainCenter);
        camera.updateProjectionMatrix();

        // 5. Animación con actualización continua de la rotación
        gsap.to(camera.position, {
            x: cameraPosition[0],
            y: cameraPosition[1],
            z: cameraPosition[2],
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                camera.lookAt(...terrainCenter); // Fuerza la dirección de la cámara
                camera.updateMatrixWorld(); // Actualiza la matriz de transformación
                invalidate();
            },
            onStart: () => {
                camera.rotation.order = "YXZ"; // Mejor control de rotación
            }
        });

    }, [terrain, camera, invalidate]);

    return null;
};

export default CameraController;