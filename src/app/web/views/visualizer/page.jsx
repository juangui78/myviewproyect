'use client'
import React, { forwardRef, useRef } from 'react';
import { Canvas, useThree } from "@react-three/fiber";
import { Button } from "@nextui-org/react";
import { Environment, OrbitControls, useProgress, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { Progress } from "@nextui-org/progress";
import Marker from "./components/markers/Markers";
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
import { useSession, signOut } from "next-auth/react";

const ModelComponent = forwardRef(({ gltf }, ref) => {
    return (
        <primitive object={gltf.scene} ref={ref} scale={1} />
    );
});

ModelComponent.displayName = 'ModelComponent';

const CameraPositioner = () => {
    const { camera } = useThree();
    const [isCameraInitialized, setIsCameraInitialized] = useState(false);

    useEffect(() => {
        // Solo establece la cámara la primera vez que se carga el proyecto
        if (!isCameraInitialized) {
            camera.position.set(0, 200, 0); // Posición inicial
            camera.lookAt(0, 0, 0); // Mira al origen
            setIsCameraInitialized(true); // Marca que la cámara ya fue inicializada
        }
    }, [camera, isCameraInitialized]);

    return null; // Este componente no renderiza nada, solo maneja la cámara
};

const App = () => {
    const [light, setLight] = useState('sunset')
    const [quality, setQuality] = useState(1)
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

    //search Params to validate info
    const searchParams = useSearchParams();
    const idProyect = decrypt(searchParams.get("id"));


    const { data: session } = useSession();

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


    useEffect(() => {

        const getModel = async () => {
            try {
                const response = await axios.get(`/api/controllers/visualizer/${idProyect}`)

                if (response.data != undefined && response.data.model !== undefined ) {
                    setcurrentModel(response.data.model)
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

        getModel();

    }, [])

    // useEffect para cargar el modelo inicial
    useEffect(() => {
        // Si hay un proyecto actual y el modelo aún no está cargado
        if (currentModel && !isModelLoaded) {
            const modelLocation = currentModel?.model;
            console.log('model: ', currentModel);
            
            if (modelLocation !== "") {
                const loader = new GLTFLoader();

                // Guarda el ID antes de iniciar la carga asíncrona
                const projectId = currentModel._id;

                loader.load(modelLocation.url, (gltfLoaded) => {
                    setGltf(gltfLoaded);
                    setIsModelLoaded(true);
                    setCurrentModelUrl(modelLocation.url);
                    setCurrentModelId(projectId); // Usa la variable local
                    setPjname(currentModel.name) // Usa la variable local
                    // console.log('ID CARGADA:', projectId); // Usa la variable local

                    // Si necesitas hacer algo con los terrenos después de cargar
                    if (currentModel.terrains) {
                        setTerrains(currentModel.terrains);
                        setAllTerrains(currentModel.terrains);
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

        // Asegúrate de que model.model.url existe
        if (model && model.model && model.model.url) {
            const modelUrl = model.model.url;

            if (modelUrl === currentModelUrl) {
                console.log("El modelo ya está cargado.");
                return;
            }

            setTerrains([]); // Limpiar terrenos
            setAllTerrains([]); // Limpiar todos los terrenos

            const loader = new GLTFLoader();
            loader.load(modelUrl, (gltfLoaded) => {
                setGltf(gltfLoaded);
                setIsModelLoaded(true);
                setCurrentModelUrl(modelUrl);
                setCurrentModelId(model.key);

                // Actualizar terrenos y delimitaciones
                if (model.model.terrains.length > 0) {
                    setTerrains(model.model.terrains);
                    setAllTerrains(model.model.terrains);
                }

                console.log('Modelo cargado correctamente. ID:', model.key);
            });
        } else {
            console.error("Estructura del modelo inválida o URL no definida", model);
        }
    };

    const saveTerrainsToDB = async () => {

        const modelID = currentModelId || idProyect;

        try {
            const response = await axios.post(`/api/controllers/visualizer/${idProyect}`, {
                modelID: modelID,
                terrains: allTerrains
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
            <div className="flex justify-between ... w-[85%] pt-[15px] bg-transparent z-[10] absolute">
                <div>
                    {!isPublish &&
                        <Link href='/web/views/user/feed'>
                            <button type="button" className="pointer-events-auto flex justify-start px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-transparent border rounded-lg gap-x-2 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700">
                                <span>Regresar</span>
                            </button>
                        </Link>
                    }
                </div>
                <div>
                    <Toolbar
                        onToggleLight={changeLight}
                        onMeasureDistance={() => setEditMarkersMode(!editMarkersMode)}
                        onMeasureArea={() => console.log('')}
                        onSelectMode={() => console.log('')}
                        onReset={handleResetMarkers}
                        lightMode={light}
                        showTerrains={toggleTerrains}
                    />
                    {currentTerrainMarkers.length > 2 && (
                            <Button onClick={handleAddTerrain} color="primary">
                                Añadir Terreno
                            </Button>
                        )}
                        <Button onClick={handleSaveButtonClick} color="primary"
                        >
                            Guardar Terrenos
                        </Button>
                </div>

                <div>
                    <InformationCard info={projectInfo} />
                </div>

            </div>
            <div className='flex w-full h-full flex-col sm:flex-row'>
                <div className='flex w-full h-full'> {/* Aquí se ajusta el tamaño del canvas */}

                    <Canvas dpr={quality}>
                        <Suspense fallback={null}>
                            {/* <gridHelper args={[500, 500, 'gray']}/>
                            <axesHelper args={[100, 10, 10]} /> */}
                            <ambientLight intensity={1} />
                            <directionalLight color="white" position={[0, 2, 50]} />
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
                            <CameraPositioner />
                            <CameraController terrain={selectedTerrain} />
                            <OrbitControls minDistance={0} />
                            <Environment preset={light} background blur backgroundBlurriness />

                        </Suspense>
                    </Canvas>

                    {/* Contenedor del Toolbar ajustado */}

                    {progress < 100 &&
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <Progress aria-label="Loading..." label="Cargando Modelo..." value={progress} className="max-w-md" size="sm" color="success" />
                        </div>
                    }
                </div>           

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


                        <div className='pt-4'>

                            <div>
                                <p className="text-xs font-black italic text-white">Area Delimitada</p>
                                <h3 className='italic text-md text-gray-400  pb-4'>{areaCalculated.toFixed(2)} m²</h3>
                                <p className="text-xs  font-black italic text-white">Distancia (A - B)</p>
                                <h3 className='italic text-md text-gray-400 border-b-1 border-l-red-950 pb-4'>{distanceCalculated.toFixed(2)} mts</h3>
                            </div>

                            <p className="text-base font-semibold italic pt-4 text-white tracking-wide">Historial</p>
                            <History idProyect={idProyect} onModelSelect={loadModel} />

                            <Toaster richColors position='bottom-left'
                                toastOptions={{
                                    className: 'font-custom', // Aplica una clase personalizada
                                    style: {
                                        fontFamily: 'Work Sans, sans-serif', // Asegúrate de que esta fuente esté cargada en tu proyecto
                                    },
                                }} />
                            <button className="btn text-white" onClick={() => toast.success('My first toast')}>
                                Give me a toast
                            </button>



                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    );
}

export default function WrappedApp() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <App />
        </Suspense>
    )
}