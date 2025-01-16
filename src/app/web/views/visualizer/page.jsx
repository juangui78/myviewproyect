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




const App = () => {

    const [light, setLight] = useState('lobby')
    const [quality, setQuality] = useState(0.6)
    const searchParams = useSearchParams();
    const idProyect = searchParams.get("id");
    const [currentProject, setCurrentProject] = useState(null);
    const [gltf, setGltf] = useState(null);
    const { progress } = useProgress();
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [markers, setMarkers] = useState([]);
    const objectRef = React.useRef();
    const [editMarkersMode, setEditMarkersMode] = useState(false)
    

    // const markers = [
    //     { id: 1, position: [1, 0, 2], label: 'Parcela 1' },
    //     { id: 2, position: [-2, 0, -1], label: 'Parcela 2' },
    //     // Agrega más marcadores con sus coordenadas específicas
    // ];

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
            id: markers.length + 1, // Genera un nuevo ID basado en la longitud del array actual
            position,
            label: `Parcela ${markers.length + 1}` // Etiqueta dinámica
        };

        // Calcular distancia entre dos markers
        if (markers.length > 0) {
            const lastMarkerPosition = new THREE.Vector3(...markers[markers.length - 1].position);
            const newMarkerPosition = new THREE.Vector3(...position);
            const distance = lastMarkerPosition.distanceTo(newMarkerPosition);
            console.log('Distancia entre el último marcador y el nuevo:', distance);
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
        if (currentProject) {
          const modelLocation = currentProject?.model?.folder;
          if (modelLocation) {
            const loader = new GLTFLoader();
            loader.load(`/modelers${modelLocation}/scene.gltf`, (gltfLoaded) => {
              setGltf(gltfLoaded);
            });
          }
        }
      }, [currentProject]);
    

  return (
    <div className=" flex flex-col justify-center items-center h-[100vh] overflow-hidden ">

        <div className=" pointer-events-none absolute z-50 flex items-start w-full h-full p-4">
                <Link href='/web/views/feed'>
                    <button type="button" className=" pointer-events-auto flex justify-start w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-transparent border rounded-lg gap-x-2 sm:w-auto dark:hover:bg-gray-800 dark:bg-gray-900 hover:bg-gray-100 dark:text-gray-200 dark:border-gray-700">
                        
                        <span>Feed</span>
                    </button>
                </Link>
            
        </div>
        

        <div className='flex md:w-[100%] justify-center md:h-[100vh] flex-col sm:flex-row'>
            <div className='flex md:w-[85%] md:h-[100%] sm:w-[616px] sm:h-[700px]'> {/* Aquí se ajusta el tamaño del canvas */}
                    
                    <Canvas dpr={quality}>
                    <Suspense fallback={null}>
                        {/* <gridHelper args={[500, 500, 'gray']}/>
                        <axesHelper args={[100, 10, 10]} /> */}
                        <ambientLight intensity={1} />
                        <directionalLight color="white" position={[0, 2, 50]} />
                        { editMarkersMode && <ClickHandler onAddMarker={handleAddMarker} objectRef={objectRef}/>}
                        {markers.map(marker => (
                            <Marker
                                key={marker.id}
                                position={marker.position}
                                label={marker.label}
                                onClick={() => setSelectedMarker(marker.id)}
                            />
                        ))}
                        
                        {gltf && <ModelComponent gltf={gltf} ref={objectRef}/>}
                        <OrbitControls />
                        <Environment preset={light} background blur backgroundBlurriness />
                    </Suspense>
                    </Canvas>

                    {progress < 100 && <LoadingScreen progress={progress}/>}
             
                
            </div>

            <div className=' md:h-full md:w-[18%] flex flex-col md:gap-2 items-center md:p-4 sm:p-0 sm:gap-0 sm:w-[100px]'>
                    
                    <div className='py-4 md:m-w-[295px] sm:min-w-[10px] '>
                        
                        <h3>
                            {currentProject?.description}
                        </h3>
                        <br />
                        <h3 className='italic text-sm'>{formatDate(currentProject?.creation_date)} </h3>
                        <h3 className='italic text-sm'>Fecha de Subida: </h3>        
                            <Switch
                                defaultSelected
                                size="lg"
                                color="warning"
                                thumbIcon={({ isSelected, className }) =>
                                isSelected ? (
                                    <SunIcon className={className} />
                                ) : (
                                    <MoonIcon className={className} />
                                )
                                }
                                

                                className=' py-4'
                                onChange={changeLight}
                            >
                                Iluminación
                            
                            </Switch>

                            <div className="flex flex-col gap-2 items-center m-4 justify-center">
                                <Button color="danger" variant="bordered" onClick={handleEditMarkersMode} type="button" endContent={<MarkerIcon/>}>
                                    {editMarkersMode ? "Guardar Marcadores" : "Crear Marcador"}
                                </Button>    
                                <Button onClick={handleResetMarkers} type="button">
                                    Borrar Marcadores
                                </Button> 
                            </div>
                    
                        <div>
                            <p className="text-tiny uppercase font-bold">Detalles</p>
                            

                            <div className=" md:gap-8 md:p-9 sm:gap-3 sm:p-3">
                                <Slider size="lg"  showSteps maxValue={1} minValue={0} step={0.2} color="warning"
                                label="Calidad"  marks={[
                                    {
                                    value: 0,
                                    label: "Peor Calidad",
                                    },
                                    {
                                    value: 50,
                                    label: "50%",
                                    },
                                    {
                                    value: 1,
                                    label: "Maxima Calidad",
                                    },
                                ]}
                                
                                value={quality}
                                onChange={(value) => setQuality(value)}

                                >

                                </Slider>
                            </div>
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