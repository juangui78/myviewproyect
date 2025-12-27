'use client'
import React, { forwardRef } from 'react';
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useProgress } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useEffect } from "react";
import { useState } from "react";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Marker from "./components/markers/Markers";
import Marker360 from './components/markers/Marker360';
import ClickHandler from "./components/clickhandler/ClickHandler";
import * as THREE from 'three';
import AreaVisual from "./components/areaVisualizer/AreaVisual";
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
import LoadingScreen from './components/loadingScreen/LoadingScreen.jsx';
import { get, set } from 'mongoose';
import Photo360Modal from './components/viewer360/PhotoSphereModal';
import Background360 from './components/background360/Background360';

const ModelComponent = forwardRef(({ gltf }, ref) => {
    return (
        <primitive object={gltf.scene} ref={ref} scale={1} />
    );
});

ModelComponent.displayName = 'ModelComponent';



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
    const [currentIndexModel, setCurrentIndexModel] = useState(0);
    const [cameraState, setCameraState] = useState(null);
    const [isUserControlling, setIsUserControlling] = useState(false);
    const [lastCameraView, setLastCameraView] = useState(0);
    const orbitControlsRef = React.useRef();
    const [background360, setBackground360] = useState(null);

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

            // Si el usuario estaba controlando la cámara, restaurar su posición
            if (state.isUserControlling) {
                // Restaurar posición manual del usuario
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

                // Mantener el estado de control del usuario
                setIsUserControlling(true);
            } else {
                // Si estaba en una vista predefinida, restaurar esa vista
                setCameraView(state.cameraView);
                setIsUserControlling(false);
            }
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

    // console.log('info:', projectInfo);

    // traer todos los modelos del proyecto
    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await axios.get(`/api/controllers/models_/${idProyect}/allmodels`);
                console.log("Fetched models:", response.data);

                if (response.data && response.data.length > 0) {
                    setModels(response.data);
                    setCurrentIndexModel(0); // Empieza con el modelo más reciente
                    setcurrentModel(response.data[0]); // Modelo más reciente

                    // Inicializa photo360Url con la URL del primer marcador 360 si existe
                    if (response.data[0]?.markers?.length > 0) {
                        setView360Markers(response.data[0].markers);
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


    // useEffect para obtener el proyecto y modelo
    useEffect(() => {
        const getModel = async () => {
            try {
                const response = await axios.get(`/api/controllers/visualizer/${idProyect}`)

                if (response.data != undefined && response.data.model !== undefined) {
                    setcurrentModel(response.data.model)
                    console.log('aqui hay: ', response.data.model);


                    if (response.data.terrains) {
                        setTerrains(response.data.terrains);
                        setAllTerrains(response.data.terrains);
                    }


                    setProjectInfo(response.data.proyect)

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

    }, [])

    // useEffect para cargar el modelo inicial con proyecto actual

    useEffect(() => {
        // if (isSafariMobile || isInstagramBrowser) return; // ← salir temprano en Safari iOS

        // Si hay un proyecto actual y el modelo aún no está cargado
        if (currentModel && !isModelLoaded) {
            const modelLocation = currentModel?.model;

            if (modelLocation !== "") {
                const loader = new GLTFLoader();
                loader.setMeshoptDecoder(MeshoptDecoder);

                // Guarda el ID antes de iniciar la carga asíncrona
                const projectId = currentModel._id;

                loader.load(modelLocation.url, (gltfLoaded) => {
                    setGltf(gltfLoaded);
                    setIsModelLoaded(true);
                    setIsLoadingScreenVisible(false); // Oculta la pantalla de carga
                    setCurrentModelUrl(modelLocation.url);
                    setCurrentModelId(projectId); // Usa la variable local
                    setPjname(currentModel.name) // Usa la variable local
                    setBackground360(currentModel.background360 || null);
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

            const loader = new GLTFLoader();
            loader.load(modelUrl, (gltfLoaded) => {
                setGltf(gltfLoaded);
                setIsModelLoaded(true);
                setCurrentModelUrl(modelUrl);
                setCurrentModelId(model.key);

                if (model.model.terrains.length > 0) {
                    setTerrains(model.model.terrains);
                    setAllTerrains(model.model.terrains);
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


    const saveTerrainsToDB = async () => {

        const modelID = currentModelId || idProyect;

        try {
            const response = await axios.post(`/api/controllers/visualizer/${idProyect}`, {
                modelID: modelID,
                terrains: allTerrains,
                view360Markers: view360Markers,
            });
            console.log('Terrenos guardados:', response.data);
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








    return (
        <div className="flex flex-col  items-center h-[100vh] overflow-hidden relative">
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

            {/* Canvas */}
            <div className="flex justify-between w-full pt-[15px] px-[15px] bg-transparent z-[10] absolute items-center gap-2 md:gap-4">
                <div>

                    {!isPublish ?
                        <Link href='/web/views/user/feed' >
                            <button type="button" className="pointer-events-auto flex justify-start px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-transparent  rounded-lg gap-x-2 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700">
                                <span>Regresar</span>
                            </button>
                        </Link> :

                        <div>
                            <Image
                                src='/logos/isotipo-full-color.png' // Ruta de la imagen
                                alt="My View Icon"
                                width={50} // Ancho de la imagen
                                height={50} // Altura de la imagen
                                className="rounded-full" // Clases adicionales de Tailwind CSS

                            />
                        </div>
                    }

                </div>
                <div>
                    {isModelLoaded &&
                        <Toolbar
                            onToggleLight={changeLight}
                            onMeasureDistance={() => setEditMarkersMode(!editMarkersMode)}
                            onMeasureArea={() => console.log('')}
                            onSelectMode={() => console.log('')}
                            onReset={handleResetMarkers}
                            lightMode={light}
                            showTerrains={toggleTerrains}
                        />}

                    {/* {currentTerrainMarkers.length > 2 && (
                            <Button onClick={handleAddTerrain} color="primary">
                                Añadir Terreno
                            </Button>
                        )}
                        <Button onClick={handleSaveButtonClick} color="primary"
                        >
                            Guardar Terrenos
                        </Button> */}
                </div>
                <div>
                    <InformationCard info={projectInfo} />
                </div>

            </div>





            {/* Se condiciona el renderizado general no safari */}

            {!isSafariMobile && isModelLoaded && (
                <div className='flex w-full h-full flex-col sm:flex-row'>
                    <div className='flex w-full h-full'>
                        <Suspense fallback={<LoadingScreen info={projectInfo} />}>
                            <Canvas dpr={1} ref={objectRef} camera={{ position: [0, 160, 0], fov: 75 }} gl={(gl) => {
                                gl.toneMapping = THREE.LinearToneMapping
                                gl.physicallyCorrectLights = true
                                gl.toneMappingExposure = 1.25 // súbele o bájale según lo oscuro/claro
                            }}>
                                {/* <Suspense fallback={null}> */}
                                {/* <gridHelper args={[500, 500, 'gray']}/>
                            <axesHelper args={[100, 10, 10]} /> */}
                                <ambientLight intensity={1} />
                                <directionalLight color="white" position={[0, 2, 50]} />

                                <CameraViewManager cameraView={cameraView} />
                                {/* <CameraDebugger /> */}

                                {editMarkersMode && <ClickHandler onAddMarker={handleAddMarker} objectRef={objectRef} />}
                                {/* {markers.map(marker => (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    label={marker.label}
                                    onClick={() => setSelectedMarker(marker.id)}
                                />
                            ))} */}
                                {isModelLoaded && currentTerrainMarkers.map(marker => (
                                    <Marker
                                        key={marker.id}
                                        position={marker.position}
                                        label={marker.label}
                                        onClick={() => setSelectedMarker(marker.id)}
                                    />
                                ))}
                                {showTerrains && view360Markers.map(marker => (
                                    <Marker360
                                        key={marker.id}
                                        position={marker.position}
                                        label={marker.label}
                                        color="orange" // O usa un icono diferente
                                        hidden={isPhoto360ModalOpen}
                                        picture={marker.lowpic}
                                        onClick={() => {
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
                                                onClick={() => setSelectedMarker(marker.id)}
                                            />
                                        ))}
                                        {terrain.markers.length > 2 && (
                                            <AreaVisual
                                                pjname={pjname}
                                                terrains={terrains}
                                                markers={terrain.markers}
                                                areaCalculated={handleAreaCalculated}

                                            />
                                        )}
                                    </React.Fragment>
                                ))}


                                {gltf && <ModelComponent gltf={gltf} ref={objectRef} />}
                                {/* <CameraPositioner /> */}
                                {/* <CameraController terrain={selectedTerrain} /> */}
                                <OrbitControls
                                    ref={orbitControlsRef}
                                    minDistance={0}
                                    minPolarAngle={0}
                                    maxPolarAngle={Math.PI / 2}
                                    enableDamping={true}
                                    dampingFactor={0.05}
                                />
                                {background360 ? (
                                    <>
                                        <Background360 url={background360} />
                                        <Environment preset={light} />
                                    </>
                                ) : (
                                    <Environment preset={light} background blur backgroundBlurriness />
                                )}

                                {/* </Suspense> */}
                            </Canvas>
                        </Suspense>


                        <div className="z-[9999]">
                            {isModelLoaded &&
                                <div className="fixed bottom-[calc(1vh+5px)] left-[calc(2vw+6px)] z-[9999] md:bottom-4 md:left-4">
                                    <div className="navigation-controls flex flex-col items-center mb-4 gap-2">
                                        <div className="flex flex-col items-center mb-1">
                                            <span className="text-[10px] uppercase tracking-tighter text-white/50 font-bold mb-1">
                                                Fecha de toma
                                            </span>
                                            <span className="text-center text-xs md:text-sm font-medium text-white bg-black/60 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full shadow-lg">
                                                {currentModel?.creation_date
                                                    ? new Date(currentModel.creation_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                                    : "Sin fecha"}
                                            </span>
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

                            <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4">
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
                    </div>

                    <Photo360Modal
                        url={photo360Url}
                        isOpen={isPhoto360ModalOpen}
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

            {isSafariMobile && isModelLoaded && (
                <div className='fixed inset-0 z-[100000000] bg-white w-full h-full'>
                    <Suspense fallback={<LoadingScreen info={projectInfo} />}>
                        <Canvas dpr={1} ref={objectRef} camera={{ position: [0, 160, 0], fov: 75 }} gl={(gl) => {
                            gl.toneMapping = THREE.LinearToneMapping
                            gl.physicallyCorrectLights = true
                            gl.toneMappingExposure = 1.25
                        }}>
                            <color attach="background" args={['#ffffff']} />
                            <ambientLight intensity={2} />
                            <directionalLight color="white" position={[0, 2, 50]} />

                            <CameraViewManager cameraView={cameraView} />

                            {editMarkersMode && <ClickHandler onAddMarker={handleAddMarker} objectRef={objectRef} />}

                            {isModelLoaded && currentTerrainMarkers.map(marker => (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    label={marker.label}
                                    onClick={() => setSelectedMarker(marker.id)}
                                />
                            ))}

                            {gltf && <ModelComponent gltf={gltf} ref={objectRef} />}

                            <OrbitControls
                                ref={orbitControlsRef}
                                minDistance={0}
                                minPolarAngle={0}
                                maxPolarAngle={Math.PI / 2}
                                enableDamping={true}
                                dampingFactor={0.05}
                            />
                            {/* Eliminado Environment para debugging de pantalla negra */}

                        </Canvas>
                        {/* Controls Overlay for Safari */}
                        <div className="absolute bottom-4 left-4 z-[100000001]">
                            <div className="flex flex-col items-center mb-1">
                                <span className="text-[10px] uppercase tracking-tighter text-black/50 font-bold mb-1">
                                    Fecha de toma
                                </span>
                                <span className="text-center text-xs md:text-sm font-medium text-black bg-white/80 backdrop-blur-md border border-black/10 px-4 py-1.5 rounded-full shadow-lg">
                                    {currentModel?.creation_date
                                        ? new Date(currentModel.creation_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                        : "Sin fecha"}
                                </span>
                            </div>
                        </div>
                    </Suspense>
                </div>
            )}

            {isInstagramBrowser && isModelLoaded && (
                <div className='fixed inset-0 z-[100000000] bg-white w-full h-full'>
                    <Suspense fallback={<LoadingScreen info={projectInfo} />}>
                        <Canvas dpr={1} ref={objectRef} camera={{ position: [0, 160, 0], fov: 75 }} gl={(gl) => {
                            gl.toneMapping = THREE.LinearToneMapping
                            gl.physicallyCorrectLights = true
                            gl.toneMappingExposure = 1.25
                        }}>
                            <ambientLight intensity={1} />
                            <directionalLight color="white" position={[0, 2, 50]} />

                            <CameraViewManager cameraView={cameraView} />

                            {editMarkersMode && <ClickHandler onAddMarker={handleAddMarker} objectRef={objectRef} />}

                            {isModelLoaded && currentTerrainMarkers.map(marker => (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    label={marker.label}
                                    onClick={() => setSelectedMarker(marker.id)}
                                />
                            ))}

                            {gltf && <ModelComponent gltf={gltf} ref={objectRef} />}

                            <OrbitControls
                                ref={orbitControlsRef}
                                minDistance={0}
                                minPolarAngle={0}
                                maxPolarAngle={Math.PI / 2}
                                enableDamping={true}
                                dampingFactor={0.05}
                            />
                            {background360 ? (
                                <>
                                    <Background360 url={background360} />
                                    <Environment preset={light} />
                                </>
                            ) : (
                                <Environment preset={light} />
                            )}

                        </Canvas>
                        {/* Controls Overlay for Instagram */}
                        <div className="absolute bottom-4 left-4 z-[100000001]">
                            <div className="flex flex-col items-center mb-1">
                                <span className="text-[10px] uppercase tracking-tighter text-black/50 font-bold mb-1">
                                    Fecha de toma
                                </span>
                                <span className="text-center text-xs md:text-sm font-medium text-black bg-white/80 backdrop-blur-md border border-black/10 px-4 py-1.5 rounded-full shadow-lg">
                                    {currentModel?.creation_date
                                        ? new Date(currentModel.creation_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                        : "Sin fecha"}
                                </span>
                            </div>
                        </div>
                    </Suspense>
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
