'use client'
import React, { forwardRef } from 'react';
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useProgress, TransformControls, Grid } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useEffect, useState, useCallback } from "react";
import { Button, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { upload360PhotoAction } from "../user/feed/actions/uploadImage";
import Marker from "./components/markers/Markers";
import Marker360 from './components/markers/Marker360';
import ClickHandler from "./components/clickhandler/ClickHandler";
import * as THREE from 'three';
import AreaVisual from "./components/areaVisualizer/AreaVisual";
import DistanceVisual from "./components/areaVisualizer/DistanceVisual";
import Toolbar from "./components/toolbar/Toolbar";
import Terrains from "./components/tables/terrains/Terrains.jsx"
import History from "./components/tables/history/History.jsx"
import CameraController from './components/cameras/CameraController';
import InformationCard from './components/information/InformationCard.jsx';
import { decrypt } from '@/api/libs/crypto';
import { Toaster, toast } from 'sonner'
import { formatDate } from './js/dateFormat';
import { useSession } from "next-auth/react";
import { BlocksShuffle3 } from '@/web/global_components/icons/BlocksShuffle3';
import SliderLoading from './components/sliderLoading/SliderLoading';
import Whatsapp from '@/web/global_components/icons/Whatsapp';
import { Image } from '@nextui-org/react';
import Eye from '@/web/global_components/icons/Eye';
import gsap from "gsap";
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import dynamic from "next/dynamic";
import LoadingScreen from './components/loadingScreen/LoadingScreen.jsx';
import { get, set } from 'mongoose';
import Background360 from './components/background360/Background360';

const Photo360Modal = dynamic(() => import('./components/viewer360/PhotoSphereModal'), {
    ssr: false
});

const TerrainDetailCard = dynamic(() => import('./components/terrainDetail/TerrainDetailCard'), {
    ssr: false
});

import Compass, { CompassSync } from './components/compass/Compass';

const BackArrowIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ModelComponent = forwardRef(({ gltf }, ref) => {
    return (
        <primitive object={gltf.scene} ref={ref} scale={1} />
    );
});

ModelComponent.displayName = 'ModelComponent';

const FadedGrid = () => {
    const shaderMaterial = React.useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                gridSize: { value: 10.0 },
                sectionSize: { value: 50.0 },
                gridColor: { value: new THREE.Color("#ffffff") },
                fadeDistance: { value: 500.0 },
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float gridSize;
                uniform float sectionSize;
                uniform vec3 gridColor;
                uniform float fadeDistance;
                varying vec3 vWorldPosition;

                float getGrid(vec2 pos, float size) {
                    vec2 coord = pos / size;
                    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
                    float line = min(grid.x, grid.y);
                    return 1.0 - min(line, 1.0);
                }

                void main() {
                    float cell = getGrid(vWorldPosition.xz, gridSize);
                    float section = getGrid(vWorldPosition.xz, sectionSize);
                    
                    float linePattern = max(cell * 0.5, section * 0.95);
                    if (linePattern <= 0.02) discard;

                    float dist = length(vWorldPosition.xz);
                    float alpha = clamp(1.0 - (dist / fadeDistance), 0.0, 1.0);
                    alpha = pow(alpha, 1.1);

                    gl_FragColor = vec4(gridColor, linePattern * alpha * 0.9);
                }
            `,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });
    }, []);

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[1000, 1000]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};



export const DATARANDOM = [ // informacion quemada mas adelante cuadramos esto
    "📍 Ubicación – Vereda Barro Blanco, Concepción, Antioquia",
    "🟢 A 20 min del casco urbano de Concepción",
    "🟢 A 25 min de San Vicente",
    "🟢 A 10 min del estadero El Tapón",
    "🟢 🚗 A 1h 30 del aeropuerto internacional José María Córdova",
    "🟢 🛣️ A 1h 10 de Rionegro y Marinilla",
    "🟢 🏙️ A 2h de Medellín",
    "🟢 🌄 A 40 min de Barbosa",
    "📐 Área total del lote:",
    "3.333 m²",
    "🔨 Incluye explanación de 400 m² lista para construir",
    "🛣️ Accesos y vías:",
    "🚗 A solo 10 min de la vía pavimentada que conecta San Vicente con Concepción",
    "💧 Servicios de fácil conexión:",
    "💡 Energía",
    "🚿 Agua",
    "🌐 Internet",
    "🏡 Usos posibles según certificado de usos del suelo:",
    "✅ Turismo rural",
    "✅ Vivienda",
    "✅ Agricultura",
    "✅ Inversión natural",
    "🌿 Atractivos del lote:",
    "🌳 Bosque nativo",
    "🐦 Avistamiento de aves",
    "😌 Zona tranquila para descanso",
    "📜 Estado legal:",
    "✔️ Escrituras al día en proindiviso.",
    "✔️ Licencia de construcción viable según usos del suelo y EOT municipal.",
    "💰 Precio de venta:",
    "$133.000.000 COP",
    "📞 Contacto directo:",
    "Esteban Gómez González",
    "📲 319 206 7689"
]


// const CameraDebugger = () => {
//     const { camera, gl } = useThree();

//     useEffect(() => {
//         const handleCameraChange = () => {
//             console.log(camera.position, "CAMERA POSITION");
//         };

//         // Escuchar el evento de cambio en OrbitControls
//         gl.domElement.addEventListener("pointermove", handleCameraChange);

//         return () => {
//             // Limpiar el evento al desmontar el componente
//             gl.domElement.removeEventListener("pointermove", handleCameraChange);
//         };
//     }, [camera, gl]);

//     return null; // Este componente no renderiza nada
// };



// Reusable instance of GLTFLoader to optimize memory usage, avoid garbage collection overhead,
// and reuse the same instance/workers across multiple loads.
let globalGltfLoader = null;
const getGltfLoader = () => {
    if (typeof window === 'undefined') return null;
    if (!globalGltfLoader) {
        globalGltfLoader = new GLTFLoader();
        globalGltfLoader.setMeshoptDecoder(MeshoptDecoder);
    }
    return globalGltfLoader;
};

const CameraViewManager = React.memo(({ cameraView,
    onUserControlChange,
    onLastCameraViewChange,
    orbitControlsRef
}) => {
    const { camera } = useThree();

    useEffect(() => {
        const positions = [
            { x: 0, y: 50, z: 0 },
            { x: -59.69, y: 103.87, z: -84.092 },
            { x: 475.40, y: 223.10, z: -84.77 },
            { x: -91.45, y: 71.300, z: -28.779 },
            { x: 90.581, y: 32.404, z: 51.591 },
        ];

        const targetPosition = positions[cameraView];

        // Solo ejecutar si realmente cambió la vista (no en cada render)
        if (onLastCameraViewChange && onUserControlChange) {
            // Marcar que la cámara está siendo controlada por el sistema
            onUserControlChange(false);

            // Deshabilitar controles temporalmente
            if (orbitControlsRef && orbitControlsRef.current) {
                orbitControlsRef.current.enabled = false;
            }

            // Usar gsap para animar la posición de la cámara
            gsap.to(camera.position, {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.lookAt(0, 0, 0);
                    if (orbitControlsRef && orbitControlsRef.current) {
                        orbitControlsRef.current.target.set(0, 0, 0);
                        orbitControlsRef.current.update();
                    }
                },
                onComplete: () => {
                    onLastCameraViewChange(cameraView);
                    // Re-habilitar controles después de la animación
                    if (orbitControlsRef && orbitControlsRef.current) {
                        orbitControlsRef.current.enabled = true;
                    }
                }
            });

            camera.updateProjectionMatrix();
        }
    }, [cameraView, camera, onUserControlChange, onLastCameraViewChange, orbitControlsRef]);

    return null;
});

CameraViewManager.displayName = 'CameraViewManager';

const ViewManager = React.memo(({ viewType, orbitControlsRef }) => {
    const { camera } = useThree();

    useEffect(() => {
        if (!orbitControlsRef || !orbitControlsRef.current) return;
        const controls = orbitControlsRef.current;

        // Mantener el vector superior constante para evitar rotaciones y volteos extraños
        camera.up.set(0, 1, 0);

        if (viewType === 'plant') {
            // Deshabilitar rotación en los controles (solo permitir paneo y zoom)
            controls.enableRotate = false;
            controls.minPolarAngle = 0;
            controls.maxPolarAngle = Math.PI;

            // Cambiar el click izquierdo para realizar desplazamiento (pan)
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };

            const target = controls.target;
            const distance = camera.position.distanceTo(target);
            const currentFov = camera.fov || 75;
            const targetFov = 45;

            // Compensar distancia para mantener el mismo tamaño visual
            const fovFactor = Math.tan((currentFov * Math.PI) / 360) / Math.tan((targetFov * Math.PI) / 360);
            const targetDistance = distance * fovFactor;
            const targetY = target.y + (targetDistance > 10 ? targetDistance : 100);

            controls.enabled = false;

            gsap.to(camera, {
                fov: targetFov,
                duration: 1.2,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.updateProjectionMatrix();
                }
            });

            // Posicionamos con un offset mínimo en Z de 0.001 para que la cámara no quede perfectamente vertical 
            // respecto al vector superior [0, 1, 0], previniendo giros bruscos del gimbal lock.
            gsap.to(camera.position, {
                x: target.x,
                y: targetY,
                z: target.z + 0.001,
                duration: 1.2,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.lookAt(target.x, target.y, target.z);
                    controls.update();
                },
                onComplete: () => {
                    controls.enabled = true;
                    camera.lookAt(target.x, target.y, target.z);
                    controls.update();
                }
            });
        } else if (viewType === 'isometric') {
            // Permitir rotación lateral (horizontal), pero bloquear la vertical a 35.26 grados de elevación
            controls.enableRotate = true;
            const rad35 = 35.264 * (Math.PI / 180);
            const isoPolarAngle = Math.PI / 2 - rad35; // 54.736 grados polar

            controls.minPolarAngle = isoPolarAngle;
            controls.maxPolarAngle = isoPolarAngle;

            // El click izquierdo rota horizontalmente, el click derecho desplaza (pan)
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };

            const target = controls.target;
            const distance = camera.position.distanceTo(target);
            const currentFov = camera.fov || 75;
            const targetFov = 30;

            // Compensar distancia para mantener el mismo tamaño visual
            const fovFactor = Math.tan((currentFov * Math.PI) / 360) / Math.tan((targetFov * Math.PI) / 360);
            const targetDistance = distance * fovFactor;
            const isoDistance = targetDistance > 10 ? targetDistance : 100;

            // Calcular posición isométrica estándar (azimut a 45 grados)
            const rad45 = 45 * (Math.PI / 180);
            const targetX = target.x + isoDistance * Math.cos(rad35) * Math.cos(rad45);
            const targetY = target.y + isoDistance * Math.sin(rad35);
            const targetZ = target.z + isoDistance * Math.cos(rad35) * Math.sin(rad45);

            controls.enabled = false;

            gsap.to(camera, {
                fov: targetFov,
                duration: 1.2,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.updateProjectionMatrix();
                }
            });

            gsap.to(camera.position, {
                x: targetX,
                y: targetY,
                z: targetZ,
                duration: 1.2,
                ease: "power2.inOut",
                onUpdate: () => {
                    camera.lookAt(target.x, target.y, target.z);
                    controls.update();
                },
                onComplete: () => {
                    controls.enabled = true;
                    camera.lookAt(target.x, target.y, target.z);
                    controls.update();
                }
            });
        } else {
            // Re-habilitar rotación de cámara y restaurar click izquierdo a rotación orbital
            controls.enableRotate = true;
            controls.minPolarAngle = 0;
            controls.maxPolarAngle = Math.PI;
            controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN
            };
            
            const targetFov = 75;
            if (camera.fov !== targetFov) {
                gsap.to(camera, {
                    fov: targetFov,
                    duration: 1.2,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        camera.updateProjectionMatrix();
                    }
                });

                const target = controls.target;
                const distance = camera.position.distanceTo(target);
                const currentFov = camera.fov || 30;
                const fovFactor = Math.tan((currentFov * Math.PI) / 360) / Math.tan((targetFov * Math.PI) / 360);
                const targetDistance = distance * fovFactor;

                const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
                const newPos = new THREE.Vector3().addVectors(target, dir.multiplyScalar(targetDistance));

                controls.enabled = false;

                gsap.to(camera.position, {
                    x: newPos.x,
                    y: newPos.y,
                    z: newPos.z,
                    duration: 1.2,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        camera.lookAt(target.x, target.y, target.z);
                        controls.update();
                    },
                    onComplete: () => {
                        controls.enabled = true;
                        controls.update();
                    }
                });
            } else {
                controls.update();
            }
        }
    }, [viewType, camera, orbitControlsRef]);

    return null;
});

ViewManager.displayName = 'ViewManager';

const FirstPersonNavigation = React.memo(({ enabled, orbitControlsRef, onExit }) => {
    const { camera, gl } = useThree();
    const keysPressed = React.useRef({});
    const isDragging = React.useRef(false);
    const previousMousePosition = React.useRef({ x: 0, y: 0 });
    const euler = React.useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

    useEffect(() => {
        if (!enabled) return;

        // Deshabilitar OrbitControls mientras navegamos en Primera Persona
        if (orbitControlsRef && orbitControlsRef.current) {
            orbitControlsRef.current.enabled = false;
        }

        euler.current.setFromQuaternion(camera.quaternion, 'YXZ');

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (document.pointerLockElement) document.exitPointerLock?.();
                onExit?.();
                return;
            }
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
            keysPressed.current[e.key.toLowerCase()] = true;
        };

        const handleKeyUp = (e) => {
            keysPressed.current[e.key.toLowerCase()] = false;
        };

        const handleMouseDown = (e) => {
            if (e.button === 0 || e.button === 2) {
                isDragging.current = true;
                previousMousePosition.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseUp = () => {
            isDragging.current = false;
        };

        const handleMouseMove = (e) => {
            if (!isDragging.current && document.pointerLockElement !== gl.domElement) return;

            const movementX = document.pointerLockElement === gl.domElement 
                ? e.movementX 
                : e.clientX - previousMousePosition.current.x;
            const movementY = document.pointerLockElement === gl.domElement 
                ? e.movementY 
                : e.clientY - previousMousePosition.current.y;

            previousMousePosition.current = { x: e.clientX, y: e.clientY };

            const sensitivity = 0.0025;
            euler.current.y -= movementX * sensitivity; // Yaw (rotación horizontal)
            euler.current.x -= movementY * sensitivity; // Pitch (rotación vertical)

            // Limitar la inclinación vertical para evitar giros inversos (gimbal lock)
            euler.current.x = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, euler.current.x));

            camera.quaternion.setFromEuler(euler.current);
        };

        const handleCanvasClick = () => {
            if (document.pointerLockElement !== gl.domElement) {
                gl.domElement.requestPointerLock?.();
            }
        };

        const handlePointerLockChange = () => {
            if (document.pointerLockElement !== gl.domElement && enabled) {
                onExit?.();
            }
        };

        const domElem = gl.domElement;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        domElem.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);
        domElem.addEventListener('click', handleCanvasClick);
        document.addEventListener('pointerlockchange', handlePointerLockChange);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            domElem.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
            domElem.removeEventListener('click', handleCanvasClick);
            document.removeEventListener('pointerlockchange', handlePointerLockChange);
            if (document.pointerLockElement === gl.domElement) {
                document.exitPointerLock?.();
            }
            keysPressed.current = {};
            isDragging.current = false;

            // Al salir de primera persona, restaurar OrbitControls apuntando hacia la dirección donde mira la cámara
            if (orbitControlsRef && orbitControlsRef.current) {
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                orbitControlsRef.current.target.copy(camera.position).addScaledVector(dir, 20);
                orbitControlsRef.current.enabled = true;
                orbitControlsRef.current.update();
            }
        };
    }, [enabled, camera, gl.domElement, orbitControlsRef, onExit]);

    useFrame((state, delta) => {
        if (!enabled) return;

        const speedMultiplier = keysPressed.current['shift'] ? 2.5 : 1.0;
        const moveSpeed = 16 * speedMultiplier * delta;

        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);

        const forward = dir.clone().normalize();
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

        const moveVector = new THREE.Vector3(0, 0, 0);

        if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
            moveVector.addScaledVector(forward, moveSpeed);
        }
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
            moveVector.addScaledVector(forward, -moveSpeed);
        }
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
            moveVector.addScaledVector(right, -moveSpeed);
        }
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
            moveVector.addScaledVector(right, moveSpeed);
        }
        if (keysPressed.current['q'] || keysPressed.current[' ']) {
            moveVector.y += moveSpeed;
        }
        if (keysPressed.current['e']) {
            moveVector.y -= moveSpeed;
        }

        if (moveVector.lengthSq() > 0) {
            camera.position.add(moveVector);
        }
    });

    return null;
});

FirstPersonNavigation.displayName = 'FirstPersonNavigation';

const App = () => {
    const [light, setLight] = useState('lobby')
    const [currentModel, setcurrentModel] = useState(null);
    const [gltf, setGltf] = useState(null);
    const { progress } = useProgress();
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);
    const objectRef = React.useRef();
    const [editMarkersMode, setEditMarkersMode] = useState(false)
    const [areaCalculated, setAreaCalculated] = useState(0);
    const [distanceCalculated, setDistanceCalculated] = useState(0)
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [models, setModels] = useState([]);
    const [terrains, setTerrains] = useState([]);
    const [currentTerrainMarkers, setCurrentTerrainMarkers] = useState([]);
    const [allTerrains, setAllTerrains] = useState([]);
    const [selectedTerrain, setSelectedTerrain] = useState(null);
    const [currentModelUrl, setCurrentModelUrl] = useState(null);
    const [currentModelId, setCurrentModelId] = useState(null);
    const [showTerrains, setShowTerrains] = useState(true);
    const [isPublish, setIsPublish] = useState(true);
    const [projectInfo, setProjectInfo] = useState(null)
    const [pjname, setPjname] = useState(null)
    const [cameraView, setCameraView] = useState(0);
    const [isLoadingScreenVisible, setIsLoadingScreenVisible] = useState(true);
    const [isSafariMobile, setIsSafariMobile] = useState(false);
    const [isInstagramBrowser, setIsInstagramBrowser] = useState(false);
    const [photo360Url, setPhoto360Url] = useState(null);
    const [view360Markers, setView360Markers] = useState([]);
    const [addView360Mode, setAddView360Mode] = useState(false);
    const [isPhoto360ModalOpen, setIsPhoto360ModalOpen] = useState(false);
    const [activeTerrainForDetail, setActiveTerrainForDetail] = useState(null);
    const [terrainAreasMap, setTerrainAreasMap] = useState({});
    const [currentIndexModel, setCurrentIndexModel] = useState(0);
    const [cameraState, setCameraState] = useState(null);
    const [isUserControlling, setIsUserControlling] = useState(false);
    const [lastCameraView, setLastCameraView] = useState(0);
    const orbitControlsRef = React.useRef();
    const compassRef = React.useRef(null);

    // Reorientar suavemente la cámara hacia el Norte (eje -Z) con rotación azimutal a 0
    const handleResetNorth = useCallback(() => {
        if (!orbitControlsRef.current) return;
        const controls = orbitControlsRef.current;
        const camera = controls.object;
        const target = controls.target;

        const horizontalDist = Math.hypot(camera.position.x - target.x, camera.position.z - target.z);
        if (horizontalDist < 0.001) return;

        gsap.killTweensOf(camera.position);
        gsap.to(camera.position, {
            x: target.x,
            z: target.z + horizontalDist,
            duration: 0.8,
            ease: "power2.out",
            onUpdate: () => {
                camera.lookAt(target);
                controls.update();
            }
        });
    }, []);
    const isInitialLoadRef = React.useRef(true);
    const transformControlsRef = React.useRef();
    const [selectedMarkerObj, setSelectedMarkerObj] = useState(null);
    const [background360, setBackground360] = useState(null);
    const [currentView, setCurrentView] = useState('3d');
    const [background360Rotation, setBackground360Rotation] = useState(0);
    const [originalBackground360Rotation, setOriginalBackground360Rotation] = useState(0);
    const [background360RotationX, setBackground360RotationX] = useState(0);
    const [originalBackground360RotationX, setOriginalBackground360RotationX] = useState(0);
    const [isSwitchingModel, setIsSwitchingModel] = useState(false);
    const [isWireframe, setIsWireframe] = useState(false);
    const [isElevationMode, setIsElevationMode] = useState(false);
    const [isAutoRotate, setIsAutoRotate] = useState(false);
    const [showBackground360, setShowBackground360] = useState(true);
    const [heightBounds, setHeightBounds] = useState({ min: 0, max: 1 });
    const [isEditingMode, setIsEditingMode] = useState(false);
    const [editMarkerType, setEditMarkerType] = useState('area');
    const [distanceMarkers, setDistanceMarkers] = useState([]);
    const [originalTerrains, setOriginalTerrains] = useState([]);
    const [originalView360Markers, setOriginalView360Markers] = useState([]);
    const [isAdd360ModalOpen, setIsAdd360ModalOpen] = useState(false);
    const [pending360Position, setPending360Position] = useState(null);
    const [new360Label, setNew360Label] = useState("");
    const [new360File, setNew360File] = useState(null);
    const [isUploading360, setIsUploading360] = useState(false);
    const [defaultCamera, setDefaultCamera] = useState(null);
    const [originalDefaultCamera, setOriginalDefaultCamera] = useState(null);

    // Función profunda para liberar RAM / VRAM de ThreeJS
    const disposeGLTF = (currentGltf) => {
        if (!currentGltf || !currentGltf.scene) return;

        currentGltf.scene.traverse((node) => {
            if (node.isMesh) {
                // Liberar geometría
                if (node.geometry) {
                    node.geometry.dispose();
                }

                // Liberar materiales y texturas
                if (node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];

                    materials.forEach((material) => {
                        // Limpiar texturas en mapas
                        ['map', 'lightMap', 'bumpMap', 'normalMap', 'specularMap', 'envMap', 'alphaMap', 'aoMap', 'displacementMap', 'emissiveMap', 'metalnessMap', 'roughnessMap'].forEach((mapName) => {
                            if (material[mapName]) {
                                material[mapName].dispose();
                            }
                        });

                        material.dispose();
                    });
                }
            }
        });

        // Forzar limpieza de texturas huérfanas o en caché si es posible
        if (THREE.Cache && THREE.Cache.enabled) {
            THREE.Cache.clear();
        }
    };

    // Función para aplicar optimizaciones de renderizado
    const preprocessLoadedGltf = (gltfLoaded) => {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const isMobile = isSafariMobile || isInstagramBrowser || /Mobi|Android/i.test(ua);

        console.log("Applying visualizer optimizations to loaded GLTF...");
        gltfLoaded.scene.traverse((node) => {
            if (node.isMesh) {
                node.frustumCulled = true;
                node.castShadow = false;
                node.receiveShadow = false;
                
                // Deshabilitar actualización automática de matriz para objetos estáticos
                node.matrixAutoUpdate = false;
                node.updateMatrix();

                if (node.material) {
                    const materials = Array.isArray(node.material) ? node.material : [node.material];
                    materials.forEach(material => {
                        material.shadowSide = null;

                        const optimizeTexture = (tex) => {
                            if (tex) {
                                // Limitar anisotropía en móviles para ahorrar fillrate, usar 2 en desktop para buena nitidez sin penalización
                                tex.anisotropy = isMobile ? 1 : 2;
                                tex.minFilter = THREE.LinearFilter;
                                tex.magFilter = THREE.LinearFilter;
                                if (isMobile) {
                                    tex.generateMipmaps = false; // Ahorra mucha VRAM en móviles
                                }
                            }
                        };
                        optimizeTexture(material.map);
                        optimizeTexture(material.emissiveMap);
                        optimizeTexture(material.normalMap);
                        optimizeTexture(material.roughnessMap);
                        optimizeTexture(material.metalnessMap);
                        optimizeTexture(material.aoMap);
                    });
                }
            }
        });
        return gltfLoaded;
    };

    // const changeCameraView = useCameraView(); // Usa el hook personalizado

    //search Params to validate info
    const searchParams = useSearchParams();
    const idProyect = decrypt(searchParams.get("id"));

    const { data: session } = useSession();

    const handleCameraViewChange = () => {
        setCameraView((prevView) => (prevView + 1) % 5); // Cambia entre 0, 1, 2 y 3
        setIsUserControlling(false);
    };

    // Función para capturar el estado actual de la cámara
    const captureCurrentCameraState = () => {
        if (orbitControlsRef.current) {
            const controls = orbitControlsRef.current;
            const camera = controls.object;

            const state = {
                position: camera.position.clone(),
                target: controls.target.clone(),
                zoom: camera.zoom,
                cameraView: lastCameraView,
                isUserControlling: isUserControlling,
                // Si usas perspectiva:
                fov: camera.fov,
                near: camera.near,
                far: camera.far
            };

            setCameraState(state);
            return state;
        }
        return null;
    };

    const restoreCameraState = (state) => {
        if (state && orbitControlsRef.current) {
            const controls = orbitControlsRef.current;
            const camera = controls.object;

            // Restaurar siempre la posición y el target exactos de la cámara
            camera.position.copy(state.position);
            controls.target.copy(state.target);

            if (state.zoom) camera.zoom = state.zoom;
            if (state.fov && camera.isPerspectiveCamera) {
                camera.fov = state.fov;
                camera.near = state.near;
                camera.far = state.far;
            }

            camera.updateProjectionMatrix();
            controls.update();

            // Mantener los estados de control y vista previos
            setIsUserControlling(state.isUserControlling);
            setCameraView(state.cameraView);
        }
    };


    const toggleTerrains = () => {
        setShowTerrains((prev) => !prev);
        setSelectedMarker(null);
        setSelectedTerrain(null);
    }

    const handleAddTerrain = () => {
        if (currentTerrainMarkers.length > 2) {
            const newTerrain = {
                id: terrains.length + 1, // ID único para el terreno
                name: `Terreno ${terrains.length + 1}`,
                status: "disponible",
                type: "default", // Puedes cambiar esto para permitir al usuario seleccionar el tipo
                markers: currentTerrainMarkers, // Marcadores del terreno
            };
            setTerrains((prevTerrains) => [...prevTerrains, newTerrain]); // Añadir el terreno
            setCurrentTerrainMarkers([]); // Limpiar los marcadores actuales

            // Actualizar allTerrains
            setAllTerrains((prevAllTerrains) => [...prevAllTerrains, newTerrain]);

            // Llamar a handleResetMarkers
            handleResetMarkers();

            // Desactivar colocación de puntos por error
            setEditMarkersMode(false);
        }
    };

    const handleEditMarkersMode = (event) => {
        event.preventDefault();
        setEditMarkersMode((prevMode) => !prevMode);

    };

    const handleResetMarkers = () => {
        setMarkers([]);
    };

    const handleAddMarker = (position) => {

        console.log('Marker added at:', position);
        // Lógica para añadir el marcador visualmente

        const newMarker = {
            id: currentTerrainMarkers.length + 1,
            position,
            label: `Punto ${currentTerrainMarkers.length + 1}`,
        };

        setCurrentTerrainMarkers((prevMarkers) => [...prevMarkers, newMarker]);

        // Calcular distancia entre dos markers
        if (currentTerrainMarkers.length > 0) {
            const lastMarkerPosition = new THREE.Vector3(...currentTerrainMarkers[currentTerrainMarkers.length - 1].position);
            const newMarkerPosition = new THREE.Vector3(...position);
            const distance = lastMarkerPosition.distanceTo(newMarkerPosition);
            // console.log('Distancia entre el último marcador y el nuevo:', distance);
            setDistanceCalculated(distance);
        }

        // Añadir el nuevo marcador al estado
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    };

    const handleAddDistanceMarker = (position) => {
        const newMarker = {
            id: distanceMarkers.length + 1,
            position,
            label: `M ${distanceMarkers.length + 1}`,
        };

        if (distanceMarkers.length >= 2) {
            setDistanceMarkers([newMarker]);
        } else {
            setDistanceMarkers(prev => {
                const updated = [...prev, newMarker];
                if (updated.length === 2) {
                    setEditMarkersMode(false);
                }
                return updated;
            });
        }
    };

    const changeLight = () => {
        setLight(prevLight => prevLight === 'sunset' ? 'lobby' : 'sunset')
    }

    // Función para recibir el área calculada desde AreaVisual
    const handleAreaCalculated = (calculatedArea) => {
        setAreaCalculated(calculatedArea);
    };

    const handleTerrainAreaCalculated = (terrainId, calculatedArea) => {
        setTerrainAreasMap(prev => ({
            ...prev,
            [terrainId]: (calculatedArea === 3.333 ? 3.333 : calculatedArea).toFixed(1)
        }));
        setAreaCalculated(calculatedArea);
    };

    // Se valida si el navegador es Safari en iOS para evitar problemas de carga
    const checkIsSafariOnIOS = () => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
        const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
        const isInstagramBrowser = /Instagram/.test(ua);

        return {
            isSafariMobile: isIOS && isSafari,
            isInstagramBrowser: isIOS && isInstagramBrowser,
        };
    };

    useEffect(() => {
        const { isSafariMobile, isInstagramBrowser } = checkIsSafariOnIOS();
        setIsSafariMobile(isSafariMobile);
        setIsInstagramBrowser(isInstagramBrowser);
        if (isSafariMobile || isInstagramBrowser) {
            setIsLoadingScreenVisible(false); // Muestra la pantalla de carga si es Safari iOS o Instagram
        }

    }, []);

    useEffect(() => {
        THREE.Cache.enabled = true;
        return () => {
            THREE.Cache.clear();
            THREE.Cache.enabled = false;
        };
    }, []);

    // console.log('info:', projectInfo);

    // traer todos los modelos del proyecto
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axios.get(`/api/controllers/models_/${idProyect}/allmodels?t=${Date.now()}`);
                console.log("Fetched models:", response.data);

                if (response.data && response.data.length > 0) {
                    setModels(response.data);

                    const queryIndexStr = searchParams.get("modelIndex");
                    const queryIndex = queryIndexStr ? parseInt(queryIndexStr, 10) : 0;
                    const safeIndex = (isNaN(queryIndex) || queryIndex < 0 || queryIndex >= response.data.length) ? 0 : queryIndex;

                    setCurrentIndexModel(safeIndex);
                    setcurrentModel(response.data[safeIndex]);

                    if (response.data[safeIndex]?.terrains) {
                        setTerrains(response.data[safeIndex].terrains);
                        setAllTerrains(response.data[safeIndex].terrains);
                    } else {
                        setTerrains([]);
                        setAllTerrains([]);
                    }

                    if (response.data[safeIndex]?.defaultCamera) {
                        setDefaultCamera(response.data[safeIndex].defaultCamera);
                        setOriginalDefaultCamera(response.data[safeIndex].defaultCamera);
                    } else {
                        setDefaultCamera(null);
                        setOriginalDefaultCamera(null);
                    }

                    if (response.data[safeIndex]?.background360Rotation !== undefined) {
                        setBackground360Rotation(response.data[safeIndex].background360Rotation);
                        setOriginalBackground360Rotation(response.data[safeIndex].background360Rotation);
                    } else {
                        setBackground360Rotation(0);
                        setOriginalBackground360Rotation(0);
                    }

                    if (response.data[safeIndex]?.background360RotationX !== undefined) {
                        setBackground360RotationX(response.data[safeIndex].background360RotationX);
                        setOriginalBackground360RotationX(response.data[safeIndex].background360RotationX);
                    } else {
                        setBackground360RotationX(0);
                        setOriginalBackground360RotationX(0);
                    }

                    // Inicializa photo360Url con la URL del primer marcador 360 si existe
                    if (response.data[safeIndex]?.markers?.length > 0) {
                        console.log("Cargando marcadores desde BD:", response.data[safeIndex].markers);
                        setView360Markers(response.data[safeIndex].markers);
                        setOriginalView360Markers(response.data[safeIndex].markers);
                    } else {
                        setView360Markers([]);
                        setOriginalView360Markers([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };

        fetchModels();
    }, [idProyect]);

    const handleNextModel = (event) => {
        event.preventDefault();
        if (currentIndexModel < models.length - 1) {
            const nextIndex = currentIndexModel + 1;
            setCurrentIndexModel(nextIndex);
            setcurrentModel(models[nextIndex]);
            loadModel(models[nextIndex])


        }
    };

    const handlePreviousModel = (event) => {
        event.preventDefault();
        if (currentIndexModel > 0) {
            const prevIndex = currentIndexModel - 1;
            setCurrentIndexModel(prevIndex);
            setcurrentModel(models[prevIndex]);
            loadModel(models[prevIndex]);


        }
    };

    const handleSelectModel = (index) => {
        if (index !== currentIndexModel) {
            setCurrentIndexModel(index);
            setcurrentModel(models[index]);
            loadModel(models[index]);
        }
    };


    // useEffect para obtener el proyecto y modelo
    useEffect(() => {
        const getModel = async () => {
            try {
                const response = await axios.get(`/api/controllers/visualizer/${idProyect}?t=${Date.now()}`)

                if (response.data != undefined) {
                    if (response.data.proyect) {
                        setProjectInfo(response.data.proyect)
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };




        //save analytics from views
        const saveAnalyticsPerView = async () => {
            if (window.location.hostname === "localhost") return;

            try {
                const fecth = await axios.post(`/api/controllers/analytics`, {
                    idProyect: idProyect,
                });

                if (fecth.status != 200) {
                    console.error("Error al guardar la información de Analytics");
                }
            } catch (error) {
                console.log("Error en el servidor");
            }
        }

        getModel();
        saveAnalyticsPerView();

    }, [idProyect])

    useEffect(() => {
        isInitialLoadRef.current = true;
    }, [idProyect]);

    // useEffect para cargar el modelo inicial con proyecto actual

    useEffect(() => {
        if (isSafariMobile || isInstagramBrowser) return; // ← salir temprano en Safari iOS

        // Si hay un proyecto actual y el modelo aún no está cargado
        if (currentModel && !isModelLoaded) {
            const modelLocation = currentModel?.model;

            if (modelLocation !== "") {
                const loader = getGltfLoader();

                // Guarda el ID antes de iniciar la carga asíncrona
                const projectId = currentModel._id;

                loader.load(modelLocation.url, (gltfLoaded) => {
                    const optimizedGltf = preprocessLoadedGltf(gltfLoaded);
                    setGltf(optimizedGltf);

                    // Calcular límites de altura
                    const box = new THREE.Box3().setFromObject(optimizedGltf.scene);
                    setHeightBounds({ min: box.min.y, max: box.max.y });

                    setIsModelLoaded(true);
                    setIsLoadingScreenVisible(false); // Oculta la pantalla de carga
                    setCurrentModelUrl(modelLocation.url);
                    setCurrentModelId(projectId);
                    setPjname(currentModel.name)
                    setBackground360(currentModel.background360 || null);
                    if (currentModel.background360Rotation !== undefined) {
                        setBackground360Rotation(currentModel.background360Rotation);
                        setOriginalBackground360Rotation(currentModel.background360Rotation);
                    } else {
                        setBackground360Rotation(0);
                        setOriginalBackground360Rotation(0);
                    }

                    if (currentModel.background360RotationX !== undefined) {
                        setBackground360RotationX(currentModel.background360RotationX);
                        setOriginalBackground360RotationX(currentModel.background360RotationX);
                    } else {
                        setBackground360RotationX(0);
                        setOriginalBackground360RotationX(0);
                    }

                    if (currentModel.terrains) {
                        setTerrains(currentModel.terrains);
                        setAllTerrains(currentModel.terrains);
                        setView360Markers(currentModel.markers || []);
                    }

                    if (currentModel.defaultCamera) {
                        setDefaultCamera(currentModel.defaultCamera);
                        setOriginalDefaultCamera(currentModel.defaultCamera);
                    } else {
                        setDefaultCamera(null);
                        setOriginalDefaultCamera(null);
                    }
                });
            } else {
                alert("No existe modelo");
            }
        }

        if (session !== null && session !== undefined) setIsPublish(false);
    }, [currentModel, isModelLoaded, isSafariMobile, isInstagramBrowser]);

    // Aplicar cámara por defecto una vez cargado el modelo y los controles listos
    useEffect(() => {
        if (isModelLoaded) {
            if (!isInitialLoadRef.current) {
                return;
            }
            if (currentModel?.defaultCamera) {
                let attempts = 0;
                const applyCamera = () => {
                    if (orbitControlsRef.current) {
                        const controls = orbitControlsRef.current;
                        const camera = controls.object;
                        const { position, target } = currentModel.defaultCamera;
                        if (position && position.length === 3) {
                            camera.position.set(position[0], position[1], position[2]);
                        }
                        if (target && target.length === 3) {
                            controls.target.set(target[0], target[1], target[2]);
                        }
                        camera.updateProjectionMatrix();
                        controls.update();
                    } else if (attempts < 15) {
                        attempts++;
                        setTimeout(applyCamera, 100);
                    }
                };
                setTimeout(applyCamera, 100);
            }
            isInitialLoadRef.current = false;
        }
    }, [isModelLoaded, currentModel]);

    // Función para cargar un modelo específico
    const loadModel = (model) => {
        // Capturar estado actual ANTES de cambiar el modelo
        const currentCameraState = captureCurrentCameraState();

        if (model && model.model && model.model.url) {
            const modelUrl = model.model.url;

            if (modelUrl === currentModelUrl) {
                console.log("El modelo ya está cargado.");
                return;
            }

            setTerrains([]);
            setAllTerrains([]);
            setView360Markers([]);
            setSelectedMarker(null);
            setIsSwitchingModel(true);

            // 1. Limpiar el modelo actual en memoria RAM / CPU y Tarjeta Gráfica VRAM
            if (gltf) {
                disposeGLTF(gltf);
                setGltf(null); // Desrenderiza el componente GLTF antiguo de inmediato
            }

            const loader = getGltfLoader();

            loader.load(modelUrl, (gltfLoaded) => {
                const optimizedGltf = preprocessLoadedGltf(gltfLoaded);
                setGltf(optimizedGltf);

                setIsModelLoaded(true);
                setCurrentModelUrl(modelUrl);
                setCurrentModelId(model.key || model._id);

                // Calcular límites de altura para el nuevo modelo
                const box = new THREE.Box3().setFromObject(optimizedGltf.scene);
                setHeightBounds({ min: box.min.y, max: box.max.y });

                if (model.terrains && model.terrains.length > 0) {
                    setTerrains(model.terrains);
                    setAllTerrains(model.terrains);
                }

                if (model.defaultCamera) {
                    setDefaultCamera(model.defaultCamera);
                    setOriginalDefaultCamera(model.defaultCamera);
                } else {
                    setDefaultCamera(null);
                    setOriginalDefaultCamera(null);
                }

                if (model.markers && model.markers.length > 0) {
                    setView360Markers(model.markers);
                    setOriginalView360Markers(model.markers);
                } else {
                    setView360Markers([]);
                    setOriginalView360Markers([]);
                }

                setIsSwitchingModel(false);

                // Restaurar el estado de la cámara después del render
                setTimeout(() => {
                    if (currentCameraState) {
                        restoreCameraState(currentCameraState);
                    }
                }, 150);

                console.log('Modelo cargado correctamente. ID:', model.key);
            });
        } else {
            console.error("Estructura del modelo inválida o URL no definida", model);
        }
    };

    // Pre-cargar imágenes 360 cuando se cargan los markers
    useEffect(() => {
        if (isSafariMobile || isInstagramBrowser) return; // ← No pre-cargar imágenes pesadas en móviles

        if (view360Markers.length > 0) {
            view360Markers.forEach(marker => {
                if (marker.photo360) {
                    const img = new window.Image();
                    img.src = marker.photo360;
                }
            });
        }
    }, [view360Markers]);


    useEffect(() => {
        if (orbitControlsRef.current) {
            const controls = orbitControlsRef.current;

            let userInteractionTimeout;

            const handleStart = () => {
                if (userInteractionTimeout) {
                    clearTimeout(userInteractionTimeout);
                }
                setIsUserControlling(true);
            };

            const handleChange = () => {
                setIsUserControlling(true);

                if (userInteractionTimeout) {
                    clearTimeout(userInteractionTimeout);
                }

                userInteractionTimeout = setTimeout(() => {
                    // No cambiar isUserControlling aquí
                }, 2000);
            };

            controls.addEventListener('start', handleStart);
            controls.addEventListener('change', handleChange);

            return () => {
                controls.removeEventListener('start', handleStart);
                controls.removeEventListener('change', handleChange);
                if (userInteractionTimeout) {
                    clearTimeout(userInteractionTimeout);
                }
            };
        }
    }, []);


    const saveTerrainsToDB = async () => {

        const modelID = currentModelId || idProyect;

        try {
            const response = await axios.post(`/api/controllers/visualizer/${idProyect}`, {
                modelID: modelID,
                terrains: allTerrains,
                view360Markers: view360Markers,
                defaultCamera: defaultCamera,
                background360Rotation: background360Rotation,
                background360RotationX: background360RotationX,
            });
            console.log('Terrenos guardados:', response.data);
            setOriginalTerrains(allTerrains);
            setOriginalView360Markers(view360Markers);
            setOriginalDefaultCamera(defaultCamera);
            setOriginalBackground360Rotation(background360Rotation);
            setOriginalBackground360RotationX(background360RotationX);

            // Sincronizar todos los modelos cargados localmente con el mismo fondo y rotaciones
            setModels(prev => prev.map(m => ({
                ...m,
                background360: background360,
                background360Rotation: background360Rotation,
                background360RotationX: background360RotationX
            })));
            setcurrentModel(prev => prev ? {
                ...prev,
                background360: background360,
                background360Rotation: background360Rotation,
                background360RotationX: background360RotationX
            } : null);

            setSelectedMarker(null);
            setSelectedTerrain(null);
            setIsEditingMode(false);
            setEditMarkersMode(false);
            return response.data;
        } catch (error) {
            console.error('Error al guardar los terrenos:', error);
            throw error;
        }
    };

    const handleSaveButtonClick = () => {
        toast.promise(
            saveTerrainsToDB(), // Ejecutamos la promesa
            {
                loading: "Guardando cambios en el proyecto...",
                success: (data) => "¡Cambios guardados con éxito!",
                error: (err) => "Error al guardar los cambios."
            }
        );
    };

    const handleToggleEditingMode = () => {
        if (!isEditingMode) {
            setOriginalTerrains(allTerrains);
            setIsEditingMode(true);
            setEditMarkersMode(false);
            setEditMarkerType('area');
            setAddView360Mode(false);
        } else {
            handleCancelEditing();
        }
    };

    const handleCancelEditing = () => {
        if (window.confirm("¿Deseas descartar los cambios no guardados?")) {
            setTerrains(originalTerrains);
            setAllTerrains(originalTerrains);
            setView360Markers(originalView360Markers);
            setDefaultCamera(originalDefaultCamera);
            setBackground360Rotation(originalBackground360Rotation);
            setBackground360RotationX(originalBackground360RotationX);
            setCurrentTerrainMarkers([]);
            setMarkers([]);
            setSelectedMarker(null);
            setSelectedTerrain(null);
            setIsEditingMode(false);
            setEditMarkersMode(false);
        }
    };

    const handleSaveYawOffset = (markerId, yawOffset) => {
        setView360Markers(prev => prev.map(m => (m.id === markerId || m._id === markerId || String(m.id || m._id) === String(markerId)) ? { ...m, yawOffset } : m));
    };

    const handleSetEditMarkerType = (type) => {
        setEditMarkerType(type);
        setAddView360Mode(type === '360');
        setCurrentTerrainMarkers([]);
        setDistanceMarkers([]);
        setMarkers([]);
        setSelectedMarker(null);
        setSelectedTerrain(null);
    };

    const handleAddView360Marker = (position) => {
        setPending360Position(position);
        setNew360Label("Vista 360");
        setNew360File(null);
        setIsAdd360ModalOpen(true);
    };

    const handleSave360Marker = async () => {
        if (!new360File) {
            alert("Por favor selecciona una imagen 360");
            return;
        }

        setIsUploading360(true);
        try {
            const formData = new FormData();
            formData.append("image", new360File);

            const uploadRes = await upload360PhotoAction(idProyect, formData);
            if (uploadRes.success) {
                const newMarker = {
                    id: Date.now(),
                    position: pending360Position,
                    photo360: uploadRes.url,
                    label: new360Label || "Vista 360",
                };

                setView360Markers((prev) => [...prev, newMarker]);
                setIsAdd360ModalOpen(false);
                toast.success("Marcador 360 añadido temporalmente.");
            } else {
                alert("Error al subir la imagen 360: " + uploadRes.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error al guardar el marcador 360");
        } finally {
            setIsUploading360(false);
        }
    };

    const getSelectedMarkerItem = () => {
        if (!selectedMarker) return null;
        const m360 = view360Markers.find(m => m.id === selectedMarker);
        if (m360) return { item: m360, type: '360' };

        const mArea = currentTerrainMarkers.find(m => m.id === selectedMarker);
        if (mArea) return { item: mArea, type: 'area' };

        // Buscar en terrenos guardados
        for (const terrain of terrains) {
            const mTerrain = terrain.markers.find(m => m.id === selectedMarker);
            if (mTerrain) {
                return { item: mTerrain, type: 'terrain-marker', terrainId: terrain.id };
            }
        }

        return null;
    };

    const handleUpdateTerrainName = (newName) => {
        if (!selectedTerrain) return;

        setSelectedTerrain(prev => prev ? { ...prev, name: newName } : null);

        setTerrains(prev => prev.map(t =>
            t.id === selectedTerrain.id ? { ...t, name: newName } : t
        ));

        setAllTerrains(prev => prev.map(t =>
            t.id === selectedTerrain.id ? { ...t, name: newName } : t
        ));
    };

    const handleUpdateTerrainStatus = (newStatus) => {
        if (!selectedTerrain) return;

        setSelectedTerrain(prev => prev ? { ...prev, status: newStatus } : null);

        setTerrains(prev => prev.map(t =>
            t.id === selectedTerrain.id ? { ...t, status: newStatus } : t
        ));

        setAllTerrains(prev => prev.map(t =>
            t.id === selectedTerrain.id ? { ...t, status: newStatus } : t
        ));
    };

    const handleDeleteMarkerFromTerrain = (markerId) => {
        if (!selectedTerrain) return;

        if (window.confirm("¿Seguro que deseas eliminar este punto del terreno?")) {
            if (selectedMarker === markerId) {
                setSelectedMarker(null);
            }

            const updatedMarkers = selectedTerrain.markers.filter(m => m.id !== markerId);

            if (updatedMarkers.length === 0) {
                setTerrains(prev => prev.filter(t => t.id !== selectedTerrain.id));
                setAllTerrains(prev => prev.filter(t => t.id !== selectedTerrain.id));
                setSelectedTerrain(null);
                toast.success("Terreno eliminado ya que no tiene puntos.");
            } else {
                setSelectedTerrain(prev => prev ? { ...prev, markers: updatedMarkers } : null);

                setTerrains(prev => prev.map(t =>
                    t.id === selectedTerrain.id ? { ...t, markers: updatedMarkers } : t
                ));

                setAllTerrains(prev => prev.map(t =>
                    t.id === selectedTerrain.id ? { ...t, markers: updatedMarkers } : t
                ));
                toast.success("Punto eliminado del terreno.");
            }
        }
    };

    const handleAddMarkerToSelectedTerrain = (position) => {
        if (!selectedTerrain) return;

        const newMarker = {
            id: Date.now(),
            position,
            label: `Punto ${selectedTerrain.markers.length + 1}`,
        };

        const updatedMarkers = [...selectedTerrain.markers, newMarker];

        setSelectedTerrain(prev => prev ? { ...prev, markers: updatedMarkers } : null);

        setTerrains(prev => prev.map(t =>
            t.id === selectedTerrain.id ? { ...t, markers: updatedMarkers } : t
        ));

        setAllTerrains(prev => prev.map(t =>
            t.id === selectedTerrain.id ? { ...t, markers: updatedMarkers } : t
        ));

        toast.success("Punto añadido al terreno.");
    };

    const handleSetDefaultCamera = () => {
        if (!orbitControlsRef.current) return;
        const controls = orbitControlsRef.current;
        const camera = controls.object;

        const position = [camera.position.x, camera.position.y, camera.position.z];
        const target = [controls.target.x, controls.target.y, controls.target.z];

        setDefaultCamera({ position, target });
        toast.success("Posición de cámara capturada localmente. Haz clic en 'Guardar Cambios' para persistir.");
    };

    const selectedInfo = getSelectedMarkerItem();

    const handleUpdateMarkerPosition = (axis, value) => {
        if (!selectedMarker || !selectedInfo) return;

        if (axis === 'all') {
            const newPos = value;
            if (selectedInfo.type === '360') {
                setView360Markers(prev => prev.map(m => m.id === selectedMarker ? { ...m, position: newPos } : m));
            } else if (selectedInfo.type === 'area') {
                setCurrentTerrainMarkers(prev => prev.map(m => m.id === selectedMarker ? { ...m, position: newPos } : m));
                setMarkers(prev => prev.map(m => m.id === selectedMarker ? { ...m, position: newPos } : m));
            } else if (selectedInfo.type === 'terrain-marker') {
                setTerrains(prev => prev.map(t => {
                    if (t.id === selectedInfo.terrainId) {
                        return {
                            ...t,
                            markers: t.markers.map(m => m.id === selectedMarker ? { ...m, position: newPos } : m)
                        };
                    }
                    return t;
                }));
                setAllTerrains(prev => prev.map(t => {
                    if (t.id === selectedInfo.terrainId) {
                        return {
                            ...t,
                            markers: t.markers.map(m => m.id === selectedMarker ? { ...m, position: newPos } : m)
                        };
                    }
                    return t;
                }));
            }
            return;
        }

        const numericValue = parseFloat(value);
        if (isNaN(numericValue)) return;

        if (selectedInfo.type === '360') {
            setView360Markers(prev => prev.map(m => {
                if (m.id === selectedMarker) {
                    const newPos = [...m.position];
                    if (axis === 'x') newPos[0] = numericValue;
                    if (axis === 'y') newPos[1] = numericValue;
                    if (axis === 'z') newPos[2] = numericValue;
                    return { ...m, position: newPos };
                }
                return m;
            }));
        } else if (selectedInfo.type === 'area') {
            setCurrentTerrainMarkers(prev => prev.map(m => {
                if (m.id === selectedMarker) {
                    const newPos = [...m.position];
                    if (axis === 'x') newPos[0] = numericValue;
                    if (axis === 'y') newPos[1] = numericValue;
                    if (axis === 'z') newPos[2] = numericValue;
                    return { ...m, position: newPos };
                }
                return m;
            }));
            setMarkers(prev => prev.map(m => {
                if (m.id === selectedMarker) {
                    const newPos = [...m.position];
                    if (axis === 'x') newPos[0] = numericValue;
                    if (axis === 'y') newPos[1] = numericValue;
                    if (axis === 'z') newPos[2] = numericValue;
                    return { ...m, position: newPos };
                }
                return m;
            }));
        } else if (selectedInfo.type === 'terrain-marker') {
            setTerrains(prev => prev.map(t => {
                if (t.id === selectedInfo.terrainId) {
                    return {
                        ...t,
                        markers: t.markers.map(m => {
                            if (m.id === selectedMarker) {
                                const newPos = [...m.position];
                                if (axis === 'x') newPos[0] = numericValue;
                                if (axis === 'y') newPos[1] = numericValue;
                                if (axis === 'z') newPos[2] = numericValue;
                                return { ...m, position: newPos };
                            }
                            return m;
                        })
                    };
                }
                return t;
            }));
            setAllTerrains(prev => prev.map(t => {
                if (t.id === selectedInfo.terrainId) {
                    return {
                        ...t,
                        markers: t.markers.map(m => {
                            if (m.id === selectedMarker) {
                                const newPos = [...m.position];
                                if (axis === 'x') newPos[0] = numericValue;
                                if (axis === 'y') newPos[1] = numericValue;
                                if (axis === 'z') newPos[2] = numericValue;
                                return { ...m, position: newPos };
                            }
                            return m;
                        })
                    };
                }
                return t;
            }));
        }
    };

    const handleUpdateMarkerLabel = (label) => {
        if (!selectedMarker || !selectedInfo) return;
        if (selectedInfo.type === '360') {
            setView360Markers(prev => prev.map(m => m.id === selectedMarker ? { ...m, label } : m));
        } else if (selectedInfo.type === 'area') {
            setCurrentTerrainMarkers(prev => prev.map(m => m.id === selectedMarker ? { ...m, label } : m));
            setMarkers(prev => prev.map(m => m.id === selectedMarker ? { ...m, label } : m));
        } else if (selectedInfo.type === 'terrain-marker') {
            setTerrains(prev => prev.map(t => {
                if (t.id === selectedInfo.terrainId) {
                    return {
                        ...t,
                        markers: t.markers.map(m => m.id === selectedMarker ? { ...m, label } : m)
                    };
                }
                return t;
            }));
            setAllTerrains(prev => prev.map(t => {
                if (t.id === selectedInfo.terrainId) {
                    return {
                        ...t,
                        markers: t.markers.map(m => m.id === selectedMarker ? { ...m, label } : m)
                    };
                }
                return t;
            }));
        }
    };

    const handleDeleteSelectedMarker = () => {
        if (!selectedMarker || !selectedInfo) return;
        if (window.confirm("¿Seguro que deseas eliminar este marcador?")) {
            if (selectedInfo.type === '360') {
                setView360Markers(prev => prev.filter(m => m.id !== selectedMarker));
            } else if (selectedInfo.type === 'area') {
                setCurrentTerrainMarkers(prev => prev.filter(m => m.id !== selectedMarker));
                setMarkers(prev => prev.filter(m => m.id !== selectedMarker));
            } else if (selectedInfo.type === 'terrain-marker') {
                setTerrains(prev => prev.map(t => {
                    if (t.id === selectedInfo.terrainId) {
                        return {
                            ...t,
                            markers: t.markers.filter(m => m.id !== selectedMarker)
                        };
                    }
                    return t;
                }).filter(t => t.markers.length > 0));
                setAllTerrains(prev => prev.map(t => {
                    if (t.id === selectedInfo.terrainId) {
                        return {
                            ...t,
                            markers: t.markers.filter(m => m.id !== selectedMarker)
                        };
                    }
                    return t;
                }).filter(t => t.markers.length > 0));
            }
            setSelectedMarker(null);
            toast.success("Marcador eliminado.");
        }
    };

    const handleNudgeMarkerPosition = (axis, direction) => {
        if (!selectedMarker || !selectedInfo) return;
        const currentVal = selectedInfo.item.position[axis === 'x' ? 0 : axis === 'y' ? 1 : 2];
        const step = 0.5;
        const newVal = currentVal + (direction === 'up' ? step : -step);
        handleUpdateMarkerPosition(axis, newVal);
    };

    useEffect(() => {
        if (!isEditingMode) return;

        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'c' || key === 'v') {
                const active = document.activeElement;
                if (active && (
                    active.tagName === 'INPUT' ||
                    active.tagName === 'TEXTAREA' ||
                    active.isContentEditable
                )) {
                    return;
                }
                if (key === 'c') {
                    setEditMarkersMode(true);
                } else if (key === 'v') {
                    setEditMarkersMode(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isEditingMode]);

    const handleUpdateModelNotes = (modelId, newNotes, updatedBy, updatedAt) => {
        setModels(prev => prev.map(m => (m._id === modelId || m.key === modelId) ? { ...m, version_notes: newNotes, updated_by: updatedBy, notes_updated_at: updatedAt } : m));
        setcurrentModel(prev => (prev?._id === modelId || prev?.key === modelId) ? { ...prev, version_notes: newNotes, updated_by: updatedBy, notes_updated_at: updatedAt } : prev);
    };

    useEffect(() => {
        if (gltf && gltf.scene) {
            gltf.scene.traverse((node) => {
                if (node.isMesh) {
                    // Si activamos el modo elevación
                    if (isElevationMode) {
                        // Guardar el material original si no existe
                        if (!node.userData.originalMaterial) {
                            node.userData.originalMaterial = node.material;
                        }

                        // Crear material de elevación para este mesh
                        node.material = new THREE.ShaderMaterial({
                            uniforms: {
                                minHeight: { value: heightBounds.min },
                                maxHeight: { value: heightBounds.max },
                            },
                            vertexShader: `
                                varying float vHeight;
                                void main() {
                                    vHeight = (modelMatrix * vec4(position, 1.0)).y;
                                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                                }
                            `,
                            fragmentShader: `
                                uniform float minHeight;
                                uniform float maxHeight;
                                varying float vHeight;
                                void main() {
                                    float h = (vHeight - minHeight) / (maxHeight - minHeight);
                                    h = clamp(h, 0.0, 1.0);
                                    
                                    vec3 color;
                                    if (h < 0.25) {
                                        color = mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 0.5, 1.0), h * 4.0);
                                    } else if (h < 0.5) {
                                        color = mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 1.0, 0.0), (h - 0.25) * 4.0);
                                    } else if (h < 0.75) {
                                        color = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (h - 0.5) * 4.0);
                                    } else {
                                        color = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (h - 0.75) * 4.0);
                                    }
                                    
                                    gl_FragColor = vec4(color, 1.0);
                                }
                            `,
                            wireframe: isWireframe
                        });
                    } else {
                        // Restaurar material original si existe
                        if (node.userData.originalMaterial) {
                            node.material = node.userData.originalMaterial;
                        }
                    }

                    // Siempre aplicar el estado de wireframe al material actual
                    if (Array.isArray(node.material)) {
                        node.material.forEach(m => {
                            if (m) m.wireframe = isWireframe;
                        });
                    } else if (node.material) {
                        node.material.wireframe = isWireframe;
                    }
                }
            });
        }
    }, [isElevationMode, isWireframe, gltf, heightBounds]);

    const getSelectedMarkerPosition = () => {
        const info = getSelectedMarkerItem();
        if (info && info.item) {
            return info.item.position;
        }
        return [0, 0, 0];
    };

    const hasChanges = JSON.stringify(allTerrains) !== JSON.stringify(originalTerrains) ||
        JSON.stringify(view360Markers) !== JSON.stringify(originalView360Markers) ||
        JSON.stringify(defaultCamera) !== JSON.stringify(originalDefaultCamera) ||
        background360Rotation !== originalBackground360Rotation ||
        background360RotationX !== originalBackground360RotationX;

    const selectedMarkerPosition = getSelectedMarkerPosition();








    return (
        <div className="flex flex-col items-center h-screen max-h-screen w-full overflow-hidden fixed inset-0 select-none">
            <Toaster richColors closeButton position="bottom-right" duration={10000} containerStyle={{ zIndex: 999999 }} />

            {/* div de carga inicial */}

            {(isLoadingScreenVisible) && (
                <div className='bg-white text-black w-full h-full absolute z-[100000000] flex flex-col justify-center items-center gap-[20px]'>
                    <div className='md:w-[90% sm:w-[98%] w-[98%]'>
                        <SliderLoading info={projectInfo} />
                    </div>
                    <div>
                        < BlocksShuffle3 className="text-6xl text-black" />
                    </div>
                    <div className='w-full text-center text-black'>
                        <p>Cargando modelo, esto puede tomar un tiempo la primera vez.</p>
                    </div>
                    <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4 flex flex-col items-end gap-3">
                        <Link
                            href={`/web/views/visualizer/easyview?id=${encodeURIComponent(searchParams.get("id") || "")}&modelIndex=${currentIndexModel}`}
                            className="flex items-center justify-center gap-2 px-4 h-10 bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-lg hover:bg-white/20 transition-all text-white"
                            title="¿Problemas de rendimiento en el móvil? Visualizar con EasyView"
                        >
                            <span className="text-sm font-semibold">Visualizar con EasyView</span>
                            <Eye className="w-5 h-5 text-white" />
                        </Link>
                        <a
                            href="https://wa.me/+573019027822" // Reemplaza con tu número de WhatsApp
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                        >
                            <Whatsapp className="text-white text-1xl" />

                        </a>
                    </div>
                </div>
            )}

            {/* Canvas Header Controls */}
            <div className="flex justify-between w-full pt-[12px] px-[10px] sm:px-[15px] bg-transparent z-[10] absolute items-center gap-1.5 sm:gap-4 pointer-events-none">
                <div className="pointer-events-auto shrink-0">
                    {!isPublish ?
                        <Link href='/web/views/user/feed' >
                            <button 
                                type="button" 
                                className="flex items-center justify-center h-10 px-3 sm:px-4 text-sm font-medium text-white bg-black/60 backdrop-blur-md border border-white/20 rounded-full shadow-lg hover:bg-black/80 transition-all gap-1.5 shrink-0"
                                title="Regresar al feed"
                            >
                                <BackArrowIcon className="w-4 h-4 text-white shrink-0" />
                                <span className="hidden sm:inline">Regresar</span>
                            </button>
                        </Link> :

                        <div className="shrink-0">
                            <Image
                                src='/logos/isotipo-full-color.png'
                                alt="My View Icon"
                                width={40}
                                height={40}
                                className="rounded-full shrink-0"
                            />
                        </div>
                    }
                </div>
                <div className="pointer-events-auto min-w-0">
                    {isModelLoaded &&
                        <Toolbar
                            onToggleLight={changeLight}
                            onMeasureDistance={() => setEditMarkersMode(!editMarkersMode)}
                            onMeasureArea={() => console.log('')}
                            onSelectMode={() => console.log('')}
                            onReset={handleResetMarkers}
                            lightMode={light}
                            showTerrains={toggleTerrains}
                            isWireframe={isWireframe}
                            onToggleWireframe={() => setIsWireframe(!isWireframe)}
                            isElevationMode={isElevationMode}
                            onToggleElevation={() => setIsElevationMode(!isElevationMode)}
                            currentView={currentView}
                            onChangeView={setCurrentView}
                            canEdit={!isPublish}
                            isEditingMode={isEditingMode}
                            onToggleEditingMode={handleToggleEditingMode}
                            isAutoRotate={isAutoRotate}
                            onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
                            showBackground360={showBackground360}
                            onToggleBackground360={() => setShowBackground360(!showBackground360)}
                            hasBackground360={!!background360}
                        />}
                </div>
                <div className="pointer-events-auto shrink-0">
                    <InformationCard
                        info={projectInfo}
                        currentModel={currentModel}
                        session={session}
                        onUpdateModelNotes={handleUpdateModelNotes}
                    />
                </div>
            </div>

            {/* Brújula Horizontal HUD debajo del Toolbar */}
            {isModelLoaded && (
                <div className={`absolute left-1/2 -translate-x-1/2 z-[10] pointer-events-auto transition-all duration-200 ${currentView === 'free' ? 'top-[132px]' : 'top-[68px] sm:top-[74px]'}`}>
                    <Compass ref={compassRef} onResetNorth={handleResetNorth} />
                </div>
            )}





            {/* Se condiciona el renderizado general no safari */}

            {!isSafariMobile && isModelLoaded && (
                <div className='flex w-full h-full flex-col sm:flex-row'>
                    <div className='flex w-full h-full relative'>
                        {currentView === 'free' && (
                            <>
                                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-md border border-[#0CDBFF]/50 text-white px-4 py-2.5 rounded-full text-xs font-medium flex items-center gap-3 shadow-[0_0_20px_rgba(12,219,255,0.3)] pointer-events-auto">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#0CDBFF] animate-pulse flex-shrink-0" />
                                    <span>🎮 <strong>Vista Libre:</strong> Clic para fijar ratón | <strong>WASD / Flechas</strong> Avanzar | <strong>Q / Espacio</strong> Subir | <strong>E</strong> Bajar | Presiona <strong>ESC</strong> para salir</span>
                                    <button 
                                        onClick={() => {
                                            if (document.pointerLockElement) document.exitPointerLock?.();
                                            setCurrentView('3d');
                                        }}
                                        className="ml-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors border border-white/10"
                                    >
                                        Salir (ESC)
                                    </button>
                                </div>

                                {/* Puntero central de alta visibilidad: 2 líneas en cruz con contraste */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center justify-center w-6 h-6">
                                    {/* Línea horizontal */}
                                    <div className="absolute w-4 h-[2px] bg-[#0CDBFF] rounded-full shadow-[0_0_4px_rgba(0,0,0,1)] border border-black" />
                                    {/* Línea vertical */}
                                    <div className="absolute h-4 w-[2px] bg-[#0CDBFF] rounded-full shadow-[0_0_4px_rgba(0,0,0,1)] border border-black" />
                                    {/* Punto central diminuto de contraste */}
                                    <div className="absolute w-1 h-1 rounded-full bg-white border border-black shadow-[0_0_2px_rgba(0,0,0,1)]" />
                                </div>
                            </>
                        )}
                        <Suspense fallback={<LoadingScreen info={projectInfo} />}>
                            <Canvas
                                frameloop={isPhoto360ModalOpen ? "never" : "always"}
                                style={{ cursor: currentView === 'free' ? 'none' : (editMarkersMode ? 'crosshair' : 'default') }}
                                dpr={isSafariMobile || isInstagramBrowser ? 1 : [1, 2]}
                                ref={objectRef}
                                camera={{ position: [0, 160, 0], fov: 75 }}
                                performance={{ min: 0.5 }}
                                gl={{
                                    antialias: !(isSafariMobile || isInstagramBrowser),
                                    powerPreference: "high-performance",
                                    precision: isSafariMobile || isInstagramBrowser ? "mediump" : "highp",
                                    alpha: false,
                                    preserveDrawingBuffer: true,
                                }}
                                onCreated={({ gl }) => {
                                    gl.toneMapping = THREE.LinearToneMapping
                                    gl.physicallyCorrectLights = true
                                    gl.toneMappingExposure = 1.25
                                }}
                            >
                                <ambientLight intensity={1} />
                                <directionalLight color="white" position={[0, 2, 50]} />

                                <CameraViewManager cameraView={cameraView} />
                                <ViewManager viewType={currentView} orbitControlsRef={orbitControlsRef} />
                                <FirstPersonNavigation enabled={currentView === 'free'} orbitControlsRef={orbitControlsRef} onExit={() => setCurrentView('3d')} />
                                <CompassSync compassRef={compassRef} />
                                {/* <CameraDebugger /> */}

                                {editMarkersMode && (
                                    <ClickHandler
                                        onAddMarker={
                                            editMarkerType === 'distance'
                                                ? handleAddDistanceMarker
                                                : (selectedTerrain ? handleAddMarkerToSelectedTerrain : handleAddMarker)
                                        }
                                        objectRef={objectRef}
                                        onAddView360Marker={handleAddView360Marker}
                                        addView360Mode={addView360Mode}
                                    />
                                )}
                                {/* {markers.map(marker => (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    label={marker.label}
                                ))} */}

                                {isModelLoaded && currentTerrainMarkers.map(marker => {
                                    const isSelected = isEditingMode && selectedMarker === marker.id;
                                    if (isSelected) {
                                        return (
                                            <mesh
                                                key={marker.id}
                                                ref={setSelectedMarkerObj}
                                                position={marker.position}
                                            >
                                                <sphereGeometry args={[0.8, 32, 32]} />
                                                <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.3} />
                                            </mesh>
                                        );
                                    }
                                    return (
                                        <Marker
                                            key={marker.id}
                                            position={marker.position}
                                            label={marker.label}
                                            onClick={() => setSelectedMarker(marker.id)}
                                        />
                                    );
                                })}
                                {showTerrains && view360Markers.map(marker => {
                                    const isSelected = isEditingMode && selectedMarker === marker.id;
                                    if (isSelected) {
                                        return (
                                            <group
                                                key={marker.id}
                                                ref={setSelectedMarkerObj}
                                                position={marker.position}
                                            >
                                                <mesh>
                                                    <sphereGeometry args={[0.8, 32, 32]} />
                                                    <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={0.5} />
                                                </mesh>
                                                <Marker360
                                                    position={[0, -6, 0]}
                                                    label={marker.label}
                                                    color="orange"
                                                    hidden={isPhoto360ModalOpen}
                                                    picture={marker.lowpic}
                                                    onClick={() => {
                                                        setSelectedMarker(marker.id);
                                                        setPhoto360Url(marker.photo360);
                                                        setIsPhoto360ModalOpen(true);
                                                    }}
                                                />
                                            </group>
                                        );
                                    }
                                    return (
                                        <Marker360
                                            key={marker.id}
                                            position={marker.position}
                                            label={marker.label}
                                            color="orange"
                                            hidden={isPhoto360ModalOpen}
                                            picture={marker.lowpic}
                                            onClick={() => {
                                                if (isEditingMode) {
                                                    setSelectedMarker(marker.id);
                                                } else {
                                                    setPhoto360Url(marker.photo360);
                                                    setIsPhoto360ModalOpen(true);
                                                }
                                            }}
                                        />
                                    );
                                })}
                                {isModelLoaded && showTerrains && terrains.map((terrain) => (
                                    <React.Fragment key={terrain.id}>
                                        {terrain.markers.map(marker => {
                                            const isSelected = isEditingMode && selectedMarker === marker.id;
                                            if (isSelected) {
                                                return (
                                                    <mesh
                                                        key={marker.id}
                                                        ref={setSelectedMarkerObj}
                                                        position={marker.position}
                                                    >
                                                        <sphereGeometry args={[0.8, 32, 32]} />
                                                        <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.3} />
                                                    </mesh>
                                                );
                                            }
                                            return (
                                                <Marker
                                                    key={marker.id}
                                                    position={marker.position}
                                                    label={marker.label}
                                                    onClick={() => {
                                                        setSelectedMarker(marker.id);
                                                        setSelectedTerrain(terrain);
                                                    }}
                                                />
                                            );
                                        })}
                                        {terrain.markers.length > 2 && (
                                            <AreaVisual
                                                pjname={terrain.name || "Área"}
                                                status={terrain.status || "disponible"}
                                                terrains={terrains}
                                                markers={terrain.markers}
                                                areaCalculated={(val) => handleTerrainAreaCalculated(terrain.id, val)}
                                                onClick={() => {
                                                    if (isEditingMode) {
                                                        setSelectedTerrain(terrain);
                                                        setSelectedMarker(null);
                                                    } else {
                                                        setActiveTerrainForDetail(terrain);
                                                    }
                                                }}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}

                                {editMarkerType === 'distance' && (
                                    <DistanceVisual
                                        markers={distanceMarkers}
                                    />
                                )}

                                {isEditingMode && selectedMarker && selectedMarkerObj && (
                                    <TransformControls
                                        key={selectedMarker}
                                        ref={transformControlsRef}
                                        object={selectedMarkerObj}
                                        mode="translate"
                                        onMouseDown={() => {
                                            if (orbitControlsRef.current) orbitControlsRef.current.enabled = false;
                                        }}
                                        onMouseUp={() => {
                                            if (orbitControlsRef.current) orbitControlsRef.current.enabled = true;
                                            const target = transformControlsRef.current?.object;
                                            if (target) {
                                                const newPos = [target.position.x, target.position.y, target.position.z];
                                                handleUpdateMarkerPosition('all', newPos);
                                            }
                                        }}
                                    />
                                )}

                                {gltf && <ModelComponent gltf={gltf} ref={objectRef} />}
                                {/* <CameraPositioner /> */}
                                {/* <CameraController terrain={selectedTerrain} /> */}
                                <OrbitControls
                                    makeDefault
                                    ref={orbitControlsRef}
                                    minDistance={0}
                                    minPolarAngle={0}
                                    maxPolarAngle={Math.PI / 2}
                                    enableDamping={true}
                                    dampingFactor={0.05}
                                    autoRotate={isAutoRotate}
                                    autoRotateSpeed={1.5}
                                    onStart={() => setIsAutoRotate(false)}
                                />
                                {background360 && showBackground360 ? (
                                    <>
                                        <Background360 url={background360} rotation={background360Rotation} rotationX={background360RotationX} />
                                        <Environment preset={light} />
                                    </>
                                ) : (
                                    <>
                                        <color attach="background" args={["#020b12"]} />
                                        <FadedGrid />
                                        <Environment preset={light} />
                                    </>
                                )}

                                {/* </Suspense> */}
                            </Canvas>
                        </Suspense>


                        <div className="z-[9999]">
                            {isSwitchingModel && (
                                <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full shadow-lg z-[10000]">
                                    <Spinner color="white" size="sm" />
                                    <span className="text-white text-sm font-medium tracking-wide">Cargando modelo...</span>
                                </div>
                            )}
                            {isModelLoaded &&
                                <div className="fixed bottom-[calc(1vh+5px)] left-[calc(2vw+6px)] z-[9999] md:bottom-4 md:left-4">
                                    <div className="navigation-controls flex flex-col items-center mb-4 gap-2">
                                        <div className="flex flex-col items-center mb-1">
                                            <span className="text-[12px] uppercase tracking-wider text-white font-bold mb-0.5 drop-shadow-md">
                                                {projectInfo?.name || pjname || "Proyecto"}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-tighter text-white/40 font-medium mb-1">
                                                Fecha de toma
                                            </span>

                                            <Dropdown className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10" placement="top">
                                                <DropdownTrigger>
                                                    <Button
                                                        variant="light"
                                                        className="text-center text-xs md:text-sm font-medium text-white bg-black/60 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full shadow-lg min-w-0 h-auto cursor-pointer hover:bg-white/10 transition-colors"
                                                    >
                                                        {currentModel?.creation_date
                                                            ? new Date(currentModel.creation_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                                            : "Sin fecha"}
                                                        <span className="ml-1 text-[10px] opacity-70">▲</span>
                                                    </Button>
                                                </DropdownTrigger>
                                                <DropdownMenu
                                                    aria-label="Seleccionar modelo"
                                                    className="w-full"
                                                    itemClasses={{
                                                        base: "data-[hover=true]:bg-white/10 text-white",
                                                    }}
                                                    selectionMode="single"
                                                    selectedKeys={new Set([currentIndexModel.toString()])}
                                                >
                                                    {models.map((mod, index) => (
                                                        <DropdownItem
                                                            key={index.toString()}
                                                            onClick={() => handleSelectModel(index)}
                                                            className={index === currentIndexModel ? "bg-white/20" : ""}
                                                            description={mod.name}
                                                        >
                                                            {mod.creation_date
                                                                ? new Date(mod.creation_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                                                : "Sin fecha"}
                                                        </DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                        {/* Botones abajo */}
                                        {models.length > 1 && (
                                            <div className="flex justify-between w-full gap-2">
                                                <Button
                                                    onClick={handlePreviousModel}
                                                    disabled={currentIndexModel === 0}
                                                    className="min-w-0 px-4 h-9 border border-white/20 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-black/60 transition-all shadow-lg"
                                                    size="sm"
                                                >
                                                    ← Ant
                                                </Button>
                                                <Button
                                                    onClick={handleNextModel}
                                                    disabled={currentIndexModel === models.length - 1}
                                                    className="min-w-0 px-4 h-9 border border-white/20 bg-black/60 backdrop-blur-md text-white rounded-full hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-black/60 transition-all shadow-lg"
                                                    size="sm"
                                                >
                                                    Sig →
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    {/* <Button onClick={handleCameraViewChange} className="text-sm md:text-sm border-none bg-black p-2 text-white h-8">
                                        <Eye></Eye>
                                        Cambiar Vista
                                    </Button> */}
                                </div>
                            }

                            <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4 pointer-events-auto">
                                <a
                                    href="https://wa.me/+573019027822" // Reemplaza con tu número de WhatsApp
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-[40px] h-[40px] bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                                >
                                    <Whatsapp className="text-white text-3xl md:text-4xl " />
                                </a>
                            </div>

                        </div>

                        {/* Branding */}
                        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none">
                            <span className="text-[10px] text-white/40 font-medium tracking-widest uppercase">
                                by <span className="text-white/70">MyView_</span>
                            </span>
                        </div>
                    </div>

                    <Photo360Modal
                        url={photo360Url}
                        markers={view360Markers}
                        isOpen={isPhoto360ModalOpen}
                        isEditMode={isEditingMode}
                        onSaveYawOffset={handleSaveYawOffset}
                        onClose={() => {
                            setPhoto360Url(null);
                            setIsPhoto360ModalOpen(false);
                        }}
                    />

                    <TerrainDetailCard
                        terrain={activeTerrainForDetail}
                        projectInfo={projectInfo}
                        isOpen={Boolean(activeTerrainForDetail)}
                        onClose={() => setActiveTerrainForDetail(null)}
                        calculatedArea={activeTerrainForDetail ? terrainAreasMap[activeTerrainForDetail.id] : null}
                    />

                    {isEditingMode && (
                        <div className="absolute top-[110px] right-[15px] z-[100] bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 min-w-[320px] max-w-[350px] text-white">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                <span className="font-bold text-sm text-[#0CDBFF]">Gestión de Marcadores</span>
                                <span className="text-xs text-white/50">Modo Edición Activo</span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-white/60 font-semibold">Tipo de Marcador:</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        size="sm"
                                        variant={editMarkerType === 'area' ? 'solid' : 'bordered'}
                                        className={editMarkerType === 'area' ? 'bg-[#0CDBFF] text-black font-semibold text-xs' : 'text-white border-white/20 text-xs'}
                                        onClick={() => handleSetEditMarkerType('area')}
                                    >
                                        Área
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={editMarkerType === '360' ? 'solid' : 'bordered'}
                                        className={editMarkerType === '360' ? 'bg-[#0CDBFF] text-black font-semibold text-xs' : 'text-white border-white/20 text-xs'}
                                        onClick={() => handleSetEditMarkerType('360')}
                                    >
                                        Vista 360
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={editMarkerType === 'distance' ? 'solid' : 'bordered'}
                                        className={editMarkerType === 'distance' ? 'bg-[#0CDBFF] text-black font-semibold text-xs' : 'text-white border-white/20 text-xs'}
                                        onClick={() => handleSetEditMarkerType('distance')}
                                    >
                                        Distancia
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-white/60 font-semibold">Acción del Puntero:</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        size="sm"
                                        variant={editMarkersMode ? 'solid' : 'bordered'}
                                        className={editMarkersMode ? 'bg-green-500 text-white font-semibold' : 'text-white border-white/20'}
                                        onClick={() => setEditMarkersMode(true)}
                                    >
                                        ✏️ Colocar Puntos [C]
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={!editMarkersMode ? 'solid' : 'bordered'}
                                        className={!editMarkersMode ? 'bg-[#0CDBFF] text-black font-semibold' : 'text-white border-white/20'}
                                        onClick={() => setEditMarkersMode(false)}
                                    >
                                        🌐 Mover Cámara [V]
                                    </Button>
                                </div>
                            </div>


                            {editMarkerType === 'area' && (
                                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Puntos trazados:</span>
                                        <span className="font-bold text-[#0CDBFF]">{currentTerrainMarkers.length}</span>
                                    </div>
                                    <p className="text-[11px] text-white/40 leading-normal">
                                        Haz clic sobre la superficie del modelo 3D para trazar los vértices del área (mínimo 3 puntos).
                                    </p>
                                    <Button
                                        size="sm"
                                        color="primary"
                                        className="w-full text-black font-semibold bg-[#0CDBFF]"
                                        disabled={currentTerrainMarkers.length < 3}
                                        onClick={handleAddTerrain}
                                    >
                                        Crear Terreno de Área
                                    </Button>
                                </div>
                            )}

                            {editMarkerType === '360' && (
                                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col gap-1.5 text-xs">
                                    <p className="text-white/40 text-[11px] leading-normal mb-1">
                                        Haz clic en cualquier punto del modelo 3D para colocar un marcador de Vista 360.
                                    </p>
                                </div>
                            )}

                            {editMarkerType === 'distance' && (
                                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Puntos medidos:</span>
                                        <span className="font-bold text-[#0CDBFF]">{distanceMarkers.length} / 2</span>
                                    </div>
                                    <p className="text-[11px] text-white/40 leading-normal">
                                        Haz clic sobre dos puntos en el relieve del modelo 3D para calcular la distancia lineal entre ellos.
                                    </p>
                                    {distanceMarkers.length === 2 && (
                                        <Button
                                            size="sm"
                                            color="danger"
                                            variant="flat"
                                            className="w-full text-white font-semibold"
                                            onClick={() => setDistanceMarkers([])}
                                        >
                                            Limpiar Medición
                                        </Button>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
                                <label className="text-xs text-white/60 font-semibold">Cámara por Defecto:</label>
                                <Button
                                    size="sm"
                                    variant="bordered"
                                    className="text-white border-white/20 hover:bg-white/10 text-xs font-semibold"
                                    onClick={handleSetDefaultCamera}
                                >
                                    📸 Guardar Vista Actual por Defecto
                                </Button>
                            </div>

                            {background360 && (
                                <div className="flex flex-col gap-2 border-t border-white/10 pt-2.5">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs text-white/60 font-semibold">Rotación Horiz. Fondo 360:</label>
                                            <span className="text-[11px] font-mono text-[#0CDBFF]">{Math.round(background360Rotation * (180 / Math.PI))}°</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-180"
                                            max="180"
                                            value={Math.round(background360Rotation * (180 / Math.PI))}
                                            onChange={(e) => {
                                                const deg = parseFloat(e.target.value);
                                                setBackground360Rotation(deg * (Math.PI / 180));
                                            }}
                                            className="w-full cursor-pointer accent-[#0CDBFF]"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs text-white/60 font-semibold">Rotación Vert. Fondo 360:</label>
                                            <span className="text-[11px] font-mono text-[#0CDBFF]">{Math.round(background360RotationX * (180 / Math.PI))}°</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-90"
                                            max="90"
                                            value={Math.round(background360RotationX * (180 / Math.PI))}
                                            onChange={(e) => {
                                                const deg = parseFloat(e.target.value);
                                                setBackground360RotationX(deg * (Math.PI / 180));
                                            }}
                                            className="w-full cursor-pointer accent-[#0CDBFF]"
                                        />
                                    </div>
                                </div>
                            )}


                            {selectedTerrain && (
                                <div className="bg-white/5 border border-[#0CDBFF]/30 rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-xs border-b border-white/10 pb-1">
                                        <span className="font-bold text-[#0CDBFF]">Editar Terreno</span>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            className="text-white/40 hover:text-white text-[10px] h-6 min-w-0 px-2"
                                            onClick={() => {
                                                setSelectedTerrain(null);
                                                setSelectedMarker(null);
                                            }}
                                        >
                                            Cerrar
                                        </Button>
                                    </div>

                                    <Input
                                        size="sm"
                                        label="Nombre del Relleno"
                                        labelPlacement="outside"
                                        value={selectedTerrain.name || ""}
                                        placeholder={`Terreno ${selectedTerrain.id}`}
                                        onChange={(e) => handleUpdateTerrainName(e.target.value)}
                                        variant="bordered"
                                        className="text-white mt-4"
                                        classNames={{
                                            input: "text-white text-xs",
                                            label: "text-white/70 text-[10px]"
                                        }}
                                    />

                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <label className="text-[10px] text-white/70 font-semibold">Estado Comercial:</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateTerrainStatus('disponible')}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all border ${
                                                    (selectedTerrain.status || 'disponible') === 'disponible'
                                                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(0,255,127,0.2)]'
                                                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                🟢 Disp.
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateTerrainStatus('reservado')}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all border ${
                                                    selectedTerrain.status === 'reservado'
                                                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,165,36,0.2)]'
                                                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                🟡 Res.
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateTerrainStatus('vendido')}
                                                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all border ${
                                                    selectedTerrain.status === 'vendido'
                                                        ? 'bg-red-500/25 border-red-400 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                                                }`}
                                            >
                                                🔴 Vend.
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] text-white/60 font-semibold">Puntos del Terreno:</label>
                                            <span className="text-[10px] text-white/40 font-mono">{selectedTerrain.markers.length} puntos</span>
                                        </div>

                                        <div className="max-h-[120px] overflow-y-auto border border-white/10 rounded bg-black/40 flex flex-col gap-0.5 p-1">
                                            {selectedTerrain.markers.map((marker, index) => {
                                                const isSelected = selectedMarker === marker.id;
                                                return (
                                                    <div
                                                        key={marker.id}
                                                        className={`flex justify-between items-center px-2 py-1 rounded text-xs transition-colors ${isSelected ? 'bg-[#0CDBFF]/20 border border-[#0CDBFF]/40 text-white' : 'hover:bg-white/5 text-white/70'
                                                            }`}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedMarker(marker.id)}
                                                            className="flex-1 text-left font-mono truncate font-semibold"
                                                        >
                                                            {marker.label || `Punto ${index + 1}`}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteMarkerFromTerrain(marker.id)}
                                                            className="text-red-400 hover:text-red-500 font-bold px-1.5 py-0.5"
                                                            title="Eliminar punto"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5 mt-1">
                                        {editMarkersMode ? (
                                            <div className="flex items-center justify-center gap-1.5 py-1 px-2.5 bg-green-500/10 border border-green-500/30 rounded text-[11px] text-green-400 font-medium animate-pulse">
                                                <span>●</span> Modo añadir puntos activo. Clic en el 3D para añadir.
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="bordered"
                                                className="w-full text-xs font-semibold h-7 border-[#0CDBFF]/30 text-[#0CDBFF] hover:bg-[#0CDBFF]/10"
                                                onClick={() => setEditMarkersMode(true)}
                                            >
                                                ✏️ Añadir Puntos al Terreno
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedInfo && (
                                <div className="bg-white/5 border border-[#0CDBFF]/30 rounded-lg p-2.5 flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-xs border-b border-white/10 pb-1">
                                        <span className="font-bold text-[#0CDBFF]">Editar Marcador</span>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            className="text-white/40 hover:text-white text-[10px] h-6 min-w-0 px-2"
                                            onClick={() => setSelectedMarker(null)}
                                        >
                                            Cerrar
                                        </Button>
                                    </div>

                                    <Input
                                        size="sm"
                                        label="Etiqueta"
                                        labelPlacement="outside"
                                        value={selectedInfo.item.label || ""}
                                        onChange={(e) => handleUpdateMarkerLabel(e.target.value)}
                                        variant="bordered"
                                        className="text-white mt-4"
                                        classNames={{
                                            input: "text-white text-xs",
                                            label: "text-white/70 text-[10px]"
                                        }}
                                    />

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] text-white/60 font-semibold">Posición (X, Y, Z):</label>

                                        {['x', 'y', 'z'].map((axis, idx) => (
                                            <div key={axis} className="flex items-center gap-1">
                                                <span className="text-xs uppercase font-bold text-white/50 w-4">{axis}:</span>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={parseFloat(selectedInfo.item.position[idx]).toFixed(2)}
                                                    onChange={(e) => handleUpdateMarkerPosition(axis, e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-0.5 text-xs text-white text-center focus:outline-none focus:border-[#0CDBFF]"
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    className="min-w-0 w-6 h-6 bg-white/5 hover:bg-white/10 text-white text-xs rounded"
                                                    onClick={() => handleNudgeMarkerPosition(axis, 'down')}
                                                >
                                                    -
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    className="min-w-0 w-6 h-6 bg-white/5 hover:bg-white/10 text-white text-xs rounded"
                                                    onClick={() => handleNudgeMarkerPosition(axis, 'up')}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {selectedInfo.type === '360' && (
                                        <Button
                                            size="sm"
                                            color="primary"
                                            className="w-full text-black font-semibold bg-[#0CDBFF] mt-1 text-xs h-7"
                                            onClick={() => {
                                                setPhoto360Url(selectedInfo.item.photo360);
                                                setIsPhoto360ModalOpen(true);
                                            }}
                                        >
                                            🧭 Calibrar Orientación 360
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        color="danger"
                                        variant="flat"
                                        className="w-full text-xs font-semibold h-7 mt-1"
                                        onClick={handleDeleteSelectedMarker}
                                    >
                                        🗑️ Eliminar Marcador
                                    </Button>
                                </div>
                            )}

                            <div className="flex gap-2 border-t border-white/10 pt-2.5 mt-1">
                                <Button
                                    size="sm"
                                    className={`flex-1 font-semibold ${hasChanges ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'}`}
                                    onClick={handleSaveButtonClick}
                                    isDisabled={!hasChanges}
                                    disabled={!hasChanges}
                                >
                                    Guardar Cambios
                                </Button>
                                <Button
                                    size="sm"
                                    variant="bordered"
                                    className="flex-1 border-white/20 text-white hover:bg-white/10 font-semibold"
                                    onClick={handleCancelEditing}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}

                    <Modal
                        backdrop="blur"
                        placement="center"
                        isOpen={isAdd360ModalOpen}
                        onClose={() => setIsAdd360ModalOpen(false)}
                        className="bg-[#1A1F26]/90 text-white border border-white/10 shadow-2xl"
                    >
                        <ModalContent>
                            {(onClose) => (
                                <>
                                    <ModalHeader className="flex flex-col gap-1 text-white border-b border-white/10">
                                        <h2 className="font-bold text-lg">Añadir Vista 360</h2>
                                        <p className="text-xs text-white/50">Configura la información del punto de vista 360</p>
                                    </ModalHeader>
                                    <ModalBody className="py-4 flex flex-col gap-4">
                                        <Input
                                            label="Nombre de la Vista"
                                            placeholder="Ej. Sala de estar, Balcón principal"
                                            value={new360Label}
                                            onChange={(e) => setNew360Label(e.target.value)}
                                            variant="bordered"
                                            className="text-white"
                                            classNames={{
                                                input: "text-white",
                                                label: "text-white/70"
                                            }}
                                        />
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm text-white/70">Foto Panorámica 360:</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setNew360File(e.target.files[0])}
                                                className="text-sm text-white bg-white/5 border border-white/20 rounded-lg p-2"
                                            />
                                            <p className="text-[11px] text-white/40">Sube una imagen panorámica equirrectangular para la visualización 360.</p>
                                        </div>
                                    </ModalBody>
                                    <ModalFooter className="border-t border-white/10">
                                        <Button
                                            variant="light"
                                            className="text-white"
                                            onPress={onClose}
                                            disabled={isUploading360}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="bg-[#0CDBFF] text-black font-semibold"
                                            onPress={handleSave360Marker}
                                            isLoading={isUploading360}
                                        >
                                            Agregar
                                        </Button>
                                    </ModalFooter>
                                </>
                            )}
                        </ModalContent>
                    </Modal>
                </div>)}


            {isSafariMobile && (
                <div className='bg-white text-black w-full h-full absolute z-[100000000] flex flex-col justify-center items-center gap-[24px] px-6'>
                    <div>
                        <BlocksShuffle3 className="text-6xl text-black" />
                    </div>
                    <div className='w-full text-center text-black px-4 flex flex-col gap-2 max-w-md'>
                        <p className="font-semibold text-lg">Estamos trabajando para mejorar tu experiencia en este dispositivo.</p>
                        <p className="text-sm text-gray-500">Para una mejor compatibilidad, te sugerimos utilizar Google Chrome o acceder desde un ordenador.</p>
                    </div>
                    <div>
                        <Link
                            href={`/web/views/visualizer/easyview?id=${encodeURIComponent(searchParams.get("id") || "")}&modelIndex=${currentIndexModel}`}
                            className="flex items-center justify-center gap-2 px-8 h-12 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors text-white font-semibold"
                            title="Visualizar en EasyView"
                        >
                            <span>Visualizar</span>

                        </Link>
                    </div>
                    <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                        <a
                            href="https://wa.me/+573019027822" // Reemplaza con tu número de WhatsApp
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                        >
                            <Whatsapp className="text-white text-1xl" />
                        </a>
                    </div>
                </div>
            )}

            {isInstagramBrowser && (
                <div className='bg-white text-black w-full h-full absolute z-[100000000] flex flex-col justify-center items-center gap-[24px] px-6'>
                    <div>
                        <BlocksShuffle3 className="text-6xl text-black" />
                    </div>
                    <div className='w-full text-center text-black px-4 flex flex-col gap-2 max-w-md'>
                        <p className="font-semibold text-lg">Estamos trabajando para mejorar tu experiencia en este dispositivo.</p>
                        <p className="text-sm text-gray-500">Para una mejor compatibilidad, te sugerimos utilizar Google Chrome o acceder desde un ordenador.</p>
                    </div>
                    <div>
                        <Link
                            href={`/web/views/visualizer/easyview?id=${encodeURIComponent(searchParams.get("id") || "")}&modelIndex=${currentIndexModel}`}
                            className="flex items-center justify-center gap-2 px-8 h-12 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 transition-colors text-white font-semibold"
                            title="Visualizar en EasyView"
                        >
                            <span>Visualizar</span>
                            <span className="text-xl">💡</span>
                        </Link>
                    </div>
                    <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                        <a
                            href="https://wa.me/+573019027822" // Reemplaza con tu número de WhatsApp
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                        >
                            <Whatsapp className="text-white text-1xl" />
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}


export default function WrappedApp() {

    return (
        <Suspense fallback={<SliderLoading />}>
            <App />
        </Suspense>
    )
}
