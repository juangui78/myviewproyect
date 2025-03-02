'use client'
import React, { forwardRef, useRef } from 'react';
import { Canvas, useThree } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { Button } from "@nextui-org/react";
import { Environment, Stage, OrbitControls, useProgress, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useEffect } from "react";
import { Card, CardHeader, CardBody, CardFooter, Accordion, AccordionItem } from "@nextui-org/react";
import { Switch } from "@nextui-org/react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SunIcon } from "@/web/global_components/icons/SunIcon"
import { MoonIcon } from "@/web/global_components/icons/MoonIcon";
import { MarkerIcon } from '@/web/global_components/icons/MarkerIcon';
import { Slider } from "@nextui-org/react";
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

function LoadingScreen({ progress }) {
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Progress aria-label="Loading..." label="Cargando Modelo..." value={progress} className="max-w-md" size="sm" color="success" />
        </div>
    );
}


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
    const searchParams = useSearchParams();
    const idProyect = decrypt(searchParams.get("id"));
    const [currentProject, setCurrentProject] = useState(null);
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
            console.log('Distancia entre el último marcador y el nuevo:', distance);
            setDistanceCalculated(distance);
        }

        // Añadir el nuevo marcador al estado
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    };

    const changeQuality = (value) => {
        setQuality(value)
    }

    const changeLight = () => {
        setLight(prevLight => prevLight === 'sunset' ? 'lobby' : 'sunset')
    }

    // Función para recibir el área calculada desde AreaVisual
    const handleAreaCalculated = (calculatedArea) => {
        setAreaCalculated(calculatedArea);
    };

    const getModel = async () => {
        try {
            const response = await axios.get(`/api/controllers/visualizer/${idProyect}`)
            if (response.data != undefined) {
                setCurrentProject(response.data)
                if (response.data.terrains) {
                    setTerrains(response.data.terrains);
                    setAllTerrains(response.data.terrains);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const formatDate = (date) => {
        const opciones = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true, // Para formato de 24 horas
        };
        return new Date(date).toLocaleString("es-ES", opciones);
    };

    useEffect(() => {
        getModel();
    }, [])

    useEffect(() => {
        //NOTA: PARRA,
        //ACUERDESE DE TRAER AQUI EL MODELO MAS ACTUAL
        //ESE ES EL QUE SE CARGA SIEMPRE PRIMERO
        //=============================================
        //============================================
        //========================================

        //============================

        if (currentProject && !isModelLoaded) {
            const modelLocation = currentProject?.model;
            if (modelLocation !== "") {
                const loader = new GLTFLoader();
                //Aqui va la URL dinamica de cada proyecto. De momento esta estatica para pruebas. Parcela Concepcion: https://myview-bucketdemo.s3.us-east-1.amazonaws.com/Conception/scene.gltf
                loader.load(modelLocation.url, (gltfLoaded) => {
                    setGltf(gltfLoaded);
                    setIsModelLoaded(true);
                });
            }else{
                alert("no existe modelo")
            }
        }
    }, [currentProject, isModelLoaded]);

    console.log('terrenos guardados: ', terrains);

    const saveTerrainsToDB = async () => {
        try {
            const response = await axios.post(`/api/controllers/visualizer/${idProyect}`, {
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

    console.log('allTerrains:', allTerrains);

    return (
        <div className=" flex flex-col justify-center items-center h-[100vh] overflow-hidden relative">
            <div className="pointer-events-none absolute z-50 flex justify-between w-full h-full p-4">
                <Link href='/web/views/user/feed'>
                    <button type="button" className="pointer-events-auto flex justify-start px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-transparent border rounded-lg gap-x-2 dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700">
                        <span>Feed</span>
                    </button>
                    
                </Link>
            </div>
            <div className='flex md:w-[100%] md:h-[100vh] flex-col sm:flex-row'>
                <div className='flex md:w-[85%] md:h-[100%] sm:w-[616px] sm:h-[700px]'> {/* Aquí se ajusta el tamaño del canvas */}

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
                            {isModelLoaded && terrains.map((terrain) => (
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
                                            terrains={terrains}
                                            markers={terrain.markers}
                                            areaCalculated={handleAreaCalculated}
                                        />
                                    )}
                                </React.Fragment>
                            ))}

                            {/* {markers.length > 2 && <AreaVisual terrains={terrains} markers={markers} areaCalculated={handleAreaCalculated} />} */}

                            {gltf && <ModelComponent gltf={gltf} ref={objectRef} />}
                            <CameraPositioner />
                            <CameraController terrain={selectedTerrain}  />
                            <OrbitControls minDistance={0} />
                            <Environment preset={light} background blur backgroundBlurriness />
                            {/* <Stage preset="rembrandt" shadows></Stage> */}
                            
                        </Suspense>
                    </Canvas>

                    {/* Contenedor del Toolbar ajustado */}
                    <div className="pointer-events-auto relative" style={{ right: '0.2rem', top: '0.2rem' }}>
                        <Toolbar
                            onToggleLight={changeLight}
                            onMeasureDistance={() => setEditMarkersMode(!editMarkersMode)}
                            onMeasureArea={() => console.log('')}
                            onSelectMode={() => console.log('')}
                            onReset={handleResetMarkers}
                            lightMode={light}
                        />

                        
                        
                    </div>

                    <div className="pointer-events-auto relative dark" style={{ right: '0.2rem', top: '0.2rem' }}>
                        <InformationCard/>   
                    </div>
                    
                        
                    
                    
                    {progress < 100 && <LoadingScreen progress={progress} />}
                </div>

                {/* side bar */}
                {/* ====================================== */}
                {/* here is the information from a model */}
                {/* ====================================== */}

                <div className="flex flex-col items-center h-full p-2 max-w-[15%] w-[15%] overflow-auto bg-[url(/images/op22.webp)] bg-cover bg-center px-2 ">

                
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

                        {/* <Accordion variant="bordered" className="text-white">
                            <AccordionItem key="1" aria-label="Accordion 1" title="Accordion 1" className='text-white'>
                                hola
                            </AccordionItem>
                            <AccordionItem key="2" aria-label="Accordion 2" title="Accordion 2">
                            </AccordionItem>
                            <AccordionItem key="3" aria-label="Accordion 3" title="Accordion 3">

                            </AccordionItem>
                        </Accordion> */}

                        <p className="text-base italic text-white font-semibold tracking-wide">Información</p>
                        <h3 className='text-xs break-words text-white '>
                            {currentProject?.description ? currentProject.description : "Cargando..."}
                            <p> Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, ipsam ab harum aliquid, minus ducimus tempore ullam, hic nostrum molestiae impedit provident delectus repellendus? Maiores illum iure in asperiores nobis.</p>
                        </h3>
                        <br />
                        <h3 className='italic text-xs text-white'>{currentProject?.creation_date ? formatDate(currentProject?.creation_date) : null} </h3>
                        <h3 className='italic text-xs text-gray-500 border-b-1 border-l-red-950 pb-4'>Fecha de Subida: </h3>

                        <p className="text-xs pt-4 italic text-white font-semibold tracking-wide">Tools</p> 
                         <div>
                            <div className=" md:gap-4 md:px-9 md:py-3 sm:gap-3 sm:p-3 text-white">
                                <Slider
                                    size="md"
                                    showSteps
                                    maxValue={1}
                                    minValue={0}
                                    step={0.2}
                                    color="primary"
                                    label="Calidad"
                                    value={quality}
                                    onChange={(value) => setQuality(value)}
                                >
                                </Slider>
                            </div>
                            <div>
                                <p className="text-xs font-black italic text-white">Area Delimitada</p>
                                <h3 className='italic text-md text-gray-400  pb-4'>{areaCalculated.toFixed(2)} m²</h3>
                                <p className="text-xs  font-black italic text-white">Distancia (A - B)</p>
                                <h3 className='italic text-md text-gray-400 border-b-1 border-l-red-950 pb-4'>{distanceCalculated.toFixed(2)} mts</h3>
                            </div>

                            <p className="text-base font-semibold italic pt-4 text-white tracking-wide">Historial</p>
                            <History />
                            
                            <Toaster richColors position='bottom-left'
                            toastOptions={{
                                className: 'font-custom', // Aplica una clase personalizada
                                style: {
                                    fontFamily: 'Work Sans, sans-serif', // Asegúrate de que esta fuente esté cargada en tu proyecto
                                },
                            }}/>
      <button className="btn text-white" onClick={() => toast.success('My first toast')}>
        Give me a toast
      </button>
    
      
                            
                        </div>
                    </div>
                </div>
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