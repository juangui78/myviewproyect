'use client'
import React, { forwardRef } from 'react';
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls, useProgress, Grid } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useEffect } from "react";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Marker from "../components/markers/Markers";
import Marker360 from '../components/markers/Marker360';
import ClickHandler from "../components/clickhandler/ClickHandler";
import * as THREE from 'three';
import AreaVisual from "../components/areaVisualizer/AreaVisual";
import Toolbar from "../components/toolbar/Toolbar";
import Terrains from "../components/tables/terrains/Terrains.jsx"
import History from "../components/tables/history/History.jsx"
import CameraController from '../components/cameras/CameraController';
import InformationCard from '../components/information/InformationCard.jsx';
import { decrypt } from '@/api/libs/crypto';
import { Toaster, toast } from 'sonner'
import { formatDate } from '../js/dateFormat';
import { useSession } from "next-auth/react";
import { BlocksShuffle3 } from '@/web/global_components/icons/BlocksShuffle3';
import SliderLoading from '../components/sliderLoading/SliderLoading';
import Whatsapp from '@/web/global_components/icons/Whatsapp';
import { Image } from '@nextui-org/react';
import Eye from '@/web/global_components/icons/Eye';
import gsap from "gsap";
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import LoadingScreen from '../components/loadingScreen/LoadingScreen.jsx';
import { get, set } from 'mongoose';
import Photo360Modal from '../components/viewer360/PhotoSphereModal';
import Background360 from '../components/background360/Background360';


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




const CameraDebugger = () => {
    const { camera, gl } = useThree();

    useEffect(() => {
        const handleCameraChange = () => {
            console.log(camera.position, "CAMERA POSITION");
        };

        // Escuchar el evento de cambio en OrbitControls
        gl.domElement.addEventListener("pointermove", handleCameraChange);

        return () => {
            // Limpiar el evento al desmontar el componente
            gl.domElement.removeEventListener("pointermove", handleCameraChange);
        };
    }, [camera, gl]);

    return null; // Este componente no renderiza nada
};



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

const App = () => {
    const [light, setLight] = useState('sunset')
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
    const [currentIndexModel, setCurrentIndexModel] = useState(0); // Nuevo estado para el índice del modelo actual
    const [cameraState, setCameraState] = useState(null);
    const [isUserControlling, setIsUserControlling] = useState(false);
    const [lastCameraView, setLastCameraView] = useState(0);
    const orbitControlsRef = React.useRef();
    const [background360, setBackground360] = useState(null);
    const [background360Rotation, setBackground360Rotation] = useState(0);
    const [background360RotationX, setBackground360RotationX] = useState(0);
    const [currentView, setCurrentView] = useState('3d');
    const [isAutoRotate, setIsAutoRotate] = useState(false);
    const [showBackground360, setShowBackground360] = useState(true);
    // const changeCameraView = useCameraView(); // Usa el hook personalizado

    //search Params to validate info
    const searchParams = useSearchParams();
    const idProyect = decrypt(searchParams.get("id"));

    const { data: session } = useSession();

    const handleCameraViewChange = () => {
        setCameraView((prevView) => (prevView + 1) % 5); // Cambia entre 0, 1, 2 y 3
        setIsUserControlling(false);
    };

    const CameraViewManager = ({ cameraView,
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
    };

    const ViewManager = ({ viewType, orbitControlsRef }) => {
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
    };

    const FirstPersonNavigation = ({ enabled, orbitControlsRef, onExit }) => {
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
    }

    const handleAddTerrain = () => {
        if (currentTerrainMarkers.length > 2) {
            const newTerrain = {
                id: terrains.length + 1, // ID único para el terreno
                type: "default", // Puedes cambiar esto para permitir al usuario seleccionar el tipo
                markers: currentTerrainMarkers, // Marcadores del terreno
            };
            setTerrains((prevTerrains) => [...prevTerrains, newTerrain]); // Añadir el terreno
            setCurrentTerrainMarkers([]); // Limpiar los marcadores actuales

            // Actualizar allTerrains
            setAllTerrains((prevAllTerrains) => [...prevAllTerrains, newTerrain]);

            // Llamar a handleResetMarkers
            handleResetMarkers();
        }
    };

    const handleAddView360Marker = (position) => {
        // Aquí podrías abrir un modal para seleccionar la foto 360
        const photo360 = "/images/mi-foto-360.jpg"; // Cambia esto por la lógica que necesites

        const newMarker = {
            id: Date.now(),
            position,
            photo360,
            label: "Vista 360",
        };

        setView360Markers((prev) => [...prev, newMarker]);
    };

    const handleSaveYawOffset = (markerId, yawOffset) => {
        setView360Markers(prev => prev.map(m => (m.id === markerId || m._id === markerId || String(m.id || m._id) === String(markerId)) ? { ...m, yawOffset } : m));
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

    const changeLight = () => {
        setLight(prevLight => prevLight === 'sunset' ? 'lobby' : 'sunset')
    }

    // Función para recibir el área calculada desde AreaVisual
    const handleAreaCalculated = (calculatedArea) => {
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

    console.log('info:', projectInfo);

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

                    if (response.data[safeIndex]?.background360Rotation !== undefined) {
                        setBackground360Rotation(response.data[safeIndex].background360Rotation);
                    } else {
                        setBackground360Rotation(0);
                    }

                    if (response.data[safeIndex]?.background360RotationX !== undefined) {
                        setBackground360RotationX(response.data[safeIndex].background360RotationX);
                    } else {
                        setBackground360RotationX(0);
                    }

                    // Inicializa photo360Url con la URL del primer marcador 360 si existe
                    if (response.data[safeIndex]?.markers?.length > 0) {
                        console.log("Cargando marcadores desde BD (edicion):", response.data[safeIndex].markers);
                        setView360Markers(response.data[safeIndex].markers);
                    } else {
                        setView360Markers([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching models:", error);
            }
        };

        fetchModels();
    }, [idProyect]);

    console.log('Current Model:', currentModel);


    const handleNextModel = (event) => {
        event.preventDefault();
        if (currentIndexModel < models.length - 1) {
            const nextIndex = currentIndexModel + 1;
            setCurrentIndexModel(nextIndex);
            setcurrentModel(models[nextIndex]);
            loadModel(models[nextIndex])
            console.log('current modellll:', currentModel);

        }
    };

    const handlePreviousModel = (event) => {
        event.preventDefault();
        if (currentIndexModel > 0) {
            const prevIndex = currentIndexModel - 1;
            setCurrentIndexModel(prevIndex);
            setcurrentModel(models[prevIndex]);
            loadModel(models[prevIndex]);

            console.log('current modelllll:', currentModel);
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
                    setIsModelLoaded(true);
                    setIsLoadingScreenVisible(false); // Oculta la pantalla de carga
                    setCurrentModelUrl(modelLocation.url);
                    setCurrentModelId(projectId); // Usa la variable local
                    setPjname(currentModel.name) // Usa la variable local
                    setBackground360(currentModel.background360 || null);
                    if (currentModel.background360Rotation !== undefined) {
                        setBackground360Rotation(currentModel.background360Rotation);
                    } else {
                        setBackground360Rotation(0);
                    }

                    if (currentModel.background360RotationX !== undefined) {
                        setBackground360RotationX(currentModel.background360RotationX);
                    } else {
                        setBackground360RotationX(0);
                    }
                    // console.log('ID CARGADA:', projectId); // Usa la variable local

                    // Si necesitas hacer algo con los terrenos después de cargar
                    if (currentModel.terrains) {
                        setTerrains(currentModel.terrains);
                        setAllTerrains(currentModel.terrains);
                        setView360Markers(currentModel.markers || []); // Carga los markers 360 si existen
                    }
                });
            } else {
                alert("No existe modelo");
            }
        }

        if (session !== null && session !== undefined) setIsPublish(false);
    }, [currentModel, isModelLoaded]);

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

            const loader = getGltfLoader();
            loader.load(modelUrl, (gltfLoaded) => {
                const optimizedGltf = preprocessLoadedGltf(gltfLoaded);
                setGltf(optimizedGltf);
                setIsModelLoaded(true);
                setCurrentModelUrl(modelUrl);
                setCurrentModelId(model.key);

                if (model.model.terrains.length > 0) {
                    setTerrains(model.model.terrains);
                    setAllTerrains(model.model.terrains);
                }

                if (model.markers) {
                    setView360Markers(model.markers);
                } else {
                    setView360Markers([]);
                }

                // Restaurar el estado de la cámara después del render
                setTimeout(() => {
                    if (currentCameraState) {
                        restoreCameraState(currentCameraState);
                    }
                }, 150); // Un poco más de tiempo para asegurar el render completo

                console.log('Modelo cargado correctamente. ID:', model.key);
            });
        } else {
            console.error("Estructura del modelo inválida o URL no definida", model);
        }
    };

    // Pre-cargar imágenes 360 cuando se cargan los markers
    useEffect(() => {
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

    // OrbitControls mejorado con detección de interacción del usuario
    const OrbitControlsWithDetection = () => {
        const { camera, gl } = useThree();

        useEffect(() => {
            if (orbitControlsRef.current) {
                const controls = orbitControlsRef.current;

                // Detectar cuando el usuario comienza a interactuar
                const handleStart = () => {
                    setIsUserControlling(true);
                };

                // Detectar cuando el usuario termina de interactuar
                const handleEnd = () => {
                    // El usuario sigue controlando hasta que se use una vista predefinida
                    setIsUserControlling(true);
                };

                controls.addEventListener('start', handleStart);
                controls.addEventListener('end', handleEnd);

                return () => {
                    controls.removeEventListener('start', handleStart);
                    controls.removeEventListener('end', handleEnd);
                };
            }
        }, []);

        return (
            <OrbitControls
                ref={orbitControlsRef}
                minDistance={0}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
                enableDamping={true}
                dampingFactor={0.05}
            />
        );
    };



    const saveTerrainsToDB = async () => {

        const modelID = currentModelId || idProyect;

        try {
            const response = await axios.post(`/api/controllers/visualizer/${idProyect}`, {
                modelID: modelID,
                terrains: allTerrains,
                view360Markers: view360Markers,
                background360Rotation: background360Rotation,
                background360RotationX: background360RotationX,
            });
            console.log('Terrenos guardados:', response.data);

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
        } catch (error) {
            console.error('Error al guardar los terrenos:', error);
        }
    };

    const handleSaveButtonClick = () => {
        toast.promise(
            saveTerrainsToDB(), // Ejecutamos la promesa
            {
                loading: "Guardando terrenos...",
                success: (data) => `Terrenos guardados!`, // Ajusta según tu respuesta
                error: (err) => `Error!`
            }
        );
    };




    console.log('view360Markers:', view360Markers);
    console.log('current mode: ', addView360Mode);

    useEffect(() => {
        console.log("Photo360 URL updated:", photo360Url);
    }, [photo360Url]);




    return (
        <div className="flex flex-col items-center h-screen max-h-screen w-full overflow-hidden fixed inset-0">
            {/* div de carga inicial */}

            {(isLoadingScreenVisible) && (
                <div className='bg-white w-full h-full absolute z-[100000000] flex flex-col justify-center items-center gap-[20px]'>
                    <div className='md:w-[90% sm:w-[98%] w-[98%]'>
                        <SliderLoading info={projectInfo} />
                    </div>
                    <div>
                        < BlocksShuffle3 className="text-6xl" />
                    </div>
                    <div className='w-full text-center'>
                        <p>Cargando modelo, esto puede tomar un tiempo la primera vez.</p>
                    </div>
                    <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                        <a
                            href="https://wa.me/+573192067689" // Reemplaza con tu número de WhatsApp
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
                            currentView={currentView}
                            onChangeView={setCurrentView}
                            isAutoRotate={isAutoRotate}
                            onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
                            showBackground360={showBackground360}
                            onToggleBackground360={() => setShowBackground360(!showBackground360)}
                            hasBackground360={!!background360}
                        />}
                </div>
                <div className="pointer-events-auto shrink-0">
                    <InformationCard info={projectInfo} />
                </div>
            </div>

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
                                style={{ cursor: currentView === 'free' ? 'none' : (editMarkersMode ? 'crosshair' : 'default') }}
                                dpr={isSafariMobile || isInstagramBrowser ? 1 : [1, 2]} ref={objectRef} gl={{
                                antialias: !(isSafariMobile || isInstagramBrowser),
                                powerPreference: "high-performance",
                                precision: isSafariMobile || isInstagramBrowser ? "mediump" : "highp",
                                alpha: false,
                                preserveDrawingBuffer: true,
                            }}
                                onCreated={({ gl }) => {
                                    gl.toneMapping = THREE.LinearToneMapping
                                    gl.physicallyCorrectLights = true
                                    gl.toneMappingExposure = 1.25 // súbele o bájale según lo oscuro/claro
                                }}
                                camera={{ position: [0, 160, 0], fov: 75 }}
                            >
                                {/* <Suspense fallback={null}> */}
                                {/* <gridHelper args={[500, 500, 'gray']}/>
                            <axesHelper args={[100, 10, 10]} /> */}
                                <ambientLight intensity={1} />
                                <directionalLight color="white" position={[0, 2, 50]} />

                                <CameraViewManager cameraView={cameraView} />
                                <ViewManager viewType={currentView} orbitControlsRef={orbitControlsRef} />
                                <FirstPersonNavigation enabled={currentView === 'free'} orbitControlsRef={orbitControlsRef} onExit={() => setCurrentView('3d')} />
                                {/* <CameraDebugger /> */}

                                {editMarkersMode && <ClickHandler onAddMarker={handleAddMarker} objectRef={objectRef} onAddView360Marker={handleAddView360Marker} addView360Mode={addView360Mode} />}
                                {markers.map(marker => (
                                    <Marker
                                        key={marker.id}
                                        position={marker.position}
                                        label={marker.label}
                                        onClick={() => setSelectedMarker(marker.id)}
                                    />
                                ))}
                                {isModelLoaded && currentTerrainMarkers.map(marker => (
                                    <Marker
                                        key={marker.id}
                                        position={marker.position}
                                        label={marker.label}
                                        onClick={() => setSelectedMarker(marker.id)}
                                    />
                                ))}
                                {view360Markers.map(marker => (
                                    <Marker360
                                        key={marker.id}
                                        position={marker.position}
                                        label={marker.label}
                                        color="orange" // O usa un icono diferente
                                        hidden={isPhoto360ModalOpen}
                                        picture={marker.lowpic}
                                        onClick={() => {
                                            console.log('Marker 360 clicked:', marker.photo360);

                                            setPhoto360Url(marker.photo360);
                                            setIsPhoto360ModalOpen(true); // Abrir el modal
                                        }}
                                    />
                                ))}
                                {isModelLoaded && showTerrains && terrains.map((terrain) => (
                                    <React.Fragment key={terrain.id}>
                                        {terrain.markers.map(marker => (
                                            <Marker
                                                key={marker.id}
                                                position={marker.position}
                                                label={marker.label}
                                                onClick={() => {
                                                    setSelectedMarker(marker.id);
                                                }}
                                            />
                                        ))}
                                        {terrain.markers.length > 2 && (
                                            <AreaVisual
                                                pjname={pjname}
                                                terrains={terrains}
                                                markers={terrain.markers}
                                                areaCalculated={handleAreaCalculated}
                                                onClick={() => setIsPhoto360ModalOpen(true)}
                                            />
                                        )}
                                    </React.Fragment>
                                ))}


                                {gltf && <ModelComponent gltf={gltf} ref={objectRef} />}
                                {/* <CameraPositioner /> */}
                                {/* <CameraController terrain={selectedTerrain} /> */}
                                {/* <OrbitControls minDistance={0} minPolarAngle={0} maxPolarAngle={Math.PI / 2} /> */}
                                {/* <OrbitControlsWithDetection /> */}
                                <OrbitControls
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
                            {isModelLoaded &&
                                <div className="fixed bottom-[calc(1vh+5px)] left-[calc(2vw+6px)] z-[9999] md:bottom-4 md:left-4">
                                    <div className="navigation-controls flex flex-col items-center mb-4">
                                        {/* Fecha arriba */}
                                        <span className="text-center mb-2  text-white bg-black bg-opacity-50 px-2 py-1 rounded-xl">
                                            {currentModel?.creation_date
                                                ? new Date(currentModel.creation_date).toLocaleDateString()
                                                : "Sin fecha"}
                                        </span>

                                        {/* Botones abajo */}
                                        <div className="flex justify-between w-full gap-2">
                                            <Button
                                                onClick={handlePreviousModel}
                                                disabled={currentIndexModel === 0}
                                                className="p-2 border-none disabled:opacity-50 text-sm md:text-sm h-8 bg-black text-white"
                                            >
                                                ← Ant
                                            </Button>
                                            <Button
                                                onClick={handleNextModel}
                                                disabled={currentIndexModel === models.length - 1}
                                                className="p-2 border-none disabled:opacity-50 text-sm md:text-sm h-8 bg-black  text-white"
                                            >
                                                Sig →
                                            </Button>
                                        </div>
                                    </div>
                                    <Button onClick={handleCameraViewChange} className="text-sm md:text-sm border-none bg-black p-2 text-white h-8">
                                        <Eye></Eye>
                                        Cambiar Vista
                                    </Button>
                                </div>
                            }

                            <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                                <a
                                    href="https://wa.me/+573192067689" // Reemplaza con tu número de WhatsApp
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-[40px] h-[40px] bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                                >
                                    <Whatsapp className="text-white text-3xl md:text-4xl " />
                                </a>
                            </div>

                        </div>
                    </div>

                    <Photo360Modal
                        url={photo360Url}
                        markers={view360Markers}
                        isOpen={isPhoto360ModalOpen}
                        isEditMode={true}
                        onSaveYawOffset={handleSaveYawOffset}
                        onClose={() => {
                            setPhoto360Url(null);
                            setIsPhoto360ModalOpen(false);
                        }}
                    />

                    {/* <div className="flex flex-col items-center h-full p-2 max-w-[15%] w-[15%] overflow-auto bg-[url(/images/op22.webp)] bg-cover bg-center px-2 ">

                    <div className="py-4 w-[100%] px-4" >
                        <p className="text-base text-white italic font-lg font-semibold tracking-wide">Terrenos</p>
                        {currentTerrainMarkers.length > 2 && (
                            <Button onClick={handleAddTerrain} color="primary">
                                Añadir Terreno
                            </Button>
                        )}
                        <Button onClick={handleSaveButtonClick} color="primary"
                        >
                            Guardar Terrenos
                        </Button>

                        <Terrains terrains={terrains} onSelectTerrain={setSelectedTerrain} />

                        <p className="text-base italic text-white font-semibold tracking-wide">Información</p>
                        <h3 className='text-xs break-words text-white '>
                            {currentModel?.description ? currentModel.description : "Cargando..."}
                            <p> Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, ipsam ab harum aliquid, minus ducimus tempore ullam, hic nostrum molestiae impedit provident delectus repellendus? Maiores illum iure in asperiores nobis.</p>
                        </h3>
                        <br />
                        <h3 className='italic text-xs text-white'>{currentModel?.creation_date ? formatDate(currentModel?.creation_date) : null} </h3>
                        <h3 className='italic text-xs text-gray-500 border-b-1 border-l-red-950 pb-4'>Fecha de Subida: </h3>


                        <div className="z-[9999]">
                            {isModelLoaded &&
                                <div className="fixed bottom-[calc(1vh+5px)] left-[calc(2vw+6px)] z-[9999] md:bottom-4 md:left-4">
                                    <Button onClick={handleCameraViewChange} className="text-sm md:text-sm border-none bg-black p-2 text-white h-8">
                                        <Eye></Eye>
                                        Cambiar Vista
                                    </Button>
                                </div>
                            }

                            <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                                <a
                                    href="https://wa.me/+573192067689" // Reemplaza con tu número de WhatsApp
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-[40px] h-[40px] bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                                >
                                    <Whatsapp className="text-white text-3xl md:text-4xl " />
                                </a>
                            </div>

                        </div>
                    </div>
                </div> */}
                </div>)}

            {isSafariMobile && (

                <div className='bg-white w-full h-full absolute z-[100000000] flex flex-col justify-center items-center gap-[20px]'>

                    <div className='md:w-[90% sm:w-[98%] w-[98%]'>
                        <SliderLoading info={projectInfo} />
                    </div>
                    <div>
                        < BlocksShuffle3 className="text-6xl" />
                    </div>
                    <div className='w-full text-center'>
                        <p>Estamos trabajando en tu experiencia.</p>
                        <p>Por favor utiliza un navegador diferente.</p>
                    </div>
                    <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                        <a
                            href="https://wa.me/+573192067689" // Reemplaza con tu número de WhatsApp
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

                <div className='bg-white w-full h-full absolute z-[100000000] flex flex-col justify-center items-center gap-[20px]'>

                    <div className='md:w-[90% sm:w-[98%] w-[98%]'>
                        <SliderLoading info={projectInfo} />
                    </div>
                    <div>
                        < BlocksShuffle3 className="text-6xl" />
                    </div>
                    <div className='w-full text-center'>
                        <p>Estamos trabajando en tu experiencia.</p>
                        <p>Por favor utiliza un navegador diferente.</p>
                    </div>
                    <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
                        <a
                            href="https://wa.me/+573192067689" // Reemplaza con tu número de WhatsApp
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