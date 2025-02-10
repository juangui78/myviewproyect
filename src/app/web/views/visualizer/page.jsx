'use client'
import React, { forwardRef } from 'react';
import { Canvas, useThree } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import {Button} from "@nextui-org/react";
import { Environment, OrbitControls, useProgress, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Suspense, useEffect } from "react";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/react";
import {Switch} from "@nextui-org/react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SunIcon } from "@/web/global_components/icons/SunIcon"
import { MoonIcon } from "@/web/global_components/icons/MoonIcon";
import { MarkerIcon } from '@/web/global_components/icons/MarkerIcon';
import {Slider} from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import {Progress} from "@nextui-org/progress";
import Marker from "./components/markers/Markers";
import ClickHandler from "./components/clickhandler/ClickHandler";
import * as THREE from 'three';
import AreaVisual  from "./components/areaVisualizer/AreaVisual";
import Toolbar from "./components/toolbar/Toolbar";
import Terrains from "./components/tables/terrains/Terrains.jsx"
import History from "./components/tables/history/History.jsx"
import CameraController from './components/cameras/CameraController';

function LoadingScreen({ progress }) {
    return (
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <Progress aria-label="Loading..." label="Cargando Modelo..." value={progress} className="max-w-md" size="sm" color="success"/>
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

    const [light, setLight] = useState('lobby')
    const [quality, setQuality] = useState(0.8)
    const searchParams = useSearchParams();
    const idProyect = searchParams.get("id");
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
        setLight(prevLight => prevLight === 'lobby' ? 'sunset' : 'lobby');
        
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
        if (currentProject && !isModelLoaded) {
          const modelLocation = currentProject?.model?.folder;
          if (modelLocation) {
            const loader = new GLTFLoader();
            //Aqui va la URL dinamica de cada proyecto. De momento esta estatica para pruebas.
            loader.load(`https://myview-bucketdemo.s3.us-east-1.amazonaws.com/Conception/scene.gltf`, (gltfLoaded) => {
              setGltf(gltfLoaded);
              setIsModelLoaded(true);
            });
          }
        }
      }, [currentProject, isModelLoaded]);
    
      console.log('terrenos guardados: ', terrains);
      

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
            <div className='flex md:w-[86%] md:h-[100%] sm:w-[616px] sm:h-[700px]'> {/* Aquí se ajusta el tamaño del canvas */}
                    
                    <Canvas dpr={quality}>
                        <Suspense fallback={null}>
                            {/* <gridHelper args={[500, 500, 'gray']}/>
                            <axesHelper args={[100, 10, 10]} /> */}
                            <ambientLight intensity={1} />
                            <directionalLight color="white" position={[0, 2, 50]} />
                            { editMarkersMode && <ClickHandler onAddMarker={handleAddMarker} objectRef={objectRef}/>}
                            {/* {markers.map(marker => (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    label={marker.label}
                                    onClick={() => setSelectedMarker(marker.id)}
                                />
                            ))} */}
                            {currentTerrainMarkers.map(marker => (
                                <Marker
                                    key={marker.id}
                                    position={marker.position}
                                    label={marker.label}
                                    onClick={() => setSelectedMarker(marker.id)}
                                />
                            ))}
                            {terrains.map((terrain) => (
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
                            
                            {gltf && <ModelComponent gltf={gltf} ref={objectRef}/>}
                            <CameraPositioner />
                            <CameraController terrain={selectedTerrain} />
                            <OrbitControls minDistance={0}  target={[0, 0, 0]}/>
                            <Environment preset={light} background blur backgroundBlurriness />
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

                    {progress < 100 && <LoadingScreen progress={progress}/>}
             
                
            </div>

            <div className="flex flex-col items-center h-full p-4 max-w-[14%]">


                    
                    <div className='py-4 md:m-w-[295px] sm:min-w-[10px] '>

                        <p className="text-xs font-black italic">Terrenos</p>
                        {currentTerrainMarkers.length > 2 && (
                            <Button onClick={handleAddTerrain} color="primary">
                                Añadir Terreno
                            </Button>
                        )}
                        <Terrains terrains={terrains} onSelectTerrain={setSelectedTerrain}/>
                        
                        <p className="text-xs font-black italic">Información</p>
                        <h3 className='text-xs break-words '>
                            {currentProject?.description ? currentProject.description : "Cargando..."}
                            <p> Lorem ipsum dolor sit, amet consectetur adipisicing elit. Deleniti, ipsam ab harum aliquid, minus ducimus tempore ullam, hic nostrum molestiae impedit provident delectus repellendus? Maiores illum iure in asperiores nobis.</p>
                        </h3>
                        <br />
                        <h3 className='italic text-xs'>{currentProject?.creation_date ? formatDate(currentProject?.creation_date) : null} </h3>
                        <h3 className='italic text-xs text-gray-500 border-b-1 border-l-red-950 pb-4'>Fecha de Subida: </h3>  

                        <p className="text-xs font-black pt-4 italic">Tools</p>      
                            

                            

                            
                    
                        <div>
                            
                            

                            <div className=" md:gap-4 md:px-9 md:py-3 sm:gap-3 sm:p-3">
                                <Slider size="md"  showSteps maxValue={1} minValue={0} step={0.2} color="warning"
                                label="Calidad"  
                                
                                value={quality}
                                onChange={(value) => setQuality(value)}

                                >

                                </Slider>
                            </div>

                            <div>
                                <p className="text-xs font-black italic">Area Delimitada</p>
                                <h3 className='italic text-md text-gray-500  pb-4'>{areaCalculated.toFixed(2)} m²</h3>
                                <p className="text-xs  font-black italic">Distancia (A - B)</p>
                                <h3 className='italic text-md text-gray-500 border-b-1 border-l-red-950 pb-4'>{distanceCalculated.toFixed(2)} mts</h3>
                            </div>

                            <p className="text-xs font-black italic pt-4">Historial</p>
                            <History></History>

                        </div>
                        
                    </div>
                 
                </div> 
        </div>
    </div>
  );
}

export default function WrappedApp() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <App/>
        </Suspense>
    )
}