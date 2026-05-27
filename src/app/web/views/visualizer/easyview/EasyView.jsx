'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import InformationCard from '../components/information/InformationCard';
import Whatsapp from '@/web/global_components/icons/Whatsapp';
import Link from 'next/link';

export default function EasyView({ modelUrl, currentModel, projectInfo }) {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Inicialización Base
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    // powerPreference: "low-power" ayuda en móviles, antialias en false reduce consumo de VRAM y GPU
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" }); 
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar a un ratio de 2 para rendimiento
    
    const updateSize = () => {
      const width = mountRef.current.clientWidth || window.innerWidth;
      const height = mountRef.current.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    updateSize();
    renderer.setClearColor(0xf0f0f0); // Color de fondo por defecto
    mountRef.current.appendChild(renderer.domElement);

    // 2. Controles fluidos Touch (Pan, Zoom, Rotate)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true; 

    // Iluminación básica
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 3. Carga del Modelo
    const loader = new GLTFLoader();
    
    if (modelUrl) {
      setIsLoading(true);
      loader.load(modelUrl, (gltf) => {
        scene.add(gltf.scene);
        
        // Centrar el modelo y ajustar la cámara dinámicamente
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
        cameraZ *= 1.5; // Zoom out inicial
        
        camera.position.set(center.x, center.y, center.z + cameraZ);
        controls.target.set(center.x, center.y, center.z);
        controls.update();
        
        setIsLoading(false);
      }, (xhr) => {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      }, (error) => {
        console.error('Error al cargar el modelo 3D:', error);
        setIsLoading(false);
      });
    } else {
      // Posición por defecto si no hay modelo aún
      camera.position.set(0, 2, 5);
    }

    // 4. Render Loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 5. Manejo de redimensionamiento
    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    // 6. LIMPIEZA ESTRICTA (GARBAGE COLLECTION PARA EVITAR CRASHEOS EN IOS)
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      // Liberar todos los recursos de la GPU recorriendo la escena
      scene.traverse((object) => {
        if (object.isMesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => {
                if (material.map) material.map.dispose();
                if (material.lightMap) material.lightMap.dispose();
                if (material.bumpMap) material.bumpMap.dispose();
                if (material.normalMap) material.normalMap.dispose();
                if (material.specularMap) material.specularMap.dispose();
                if (material.envMap) material.envMap.dispose();
                material.dispose();
              });
            } else {
              const material = object.material;
              if (material.map) material.map.dispose();
              if (material.lightMap) material.lightMap.dispose();
              if (material.bumpMap) material.bumpMap.dispose();
              if (material.normalMap) material.normalMap.dispose();
              if (material.specularMap) material.specularMap.dispose();
              if (material.envMap) material.envMap.dispose();
              material.dispose();
            }
          }
        }
      });

      // Destruir WebGL Context
      renderer.dispose();
      renderer.forceContextLoss(); 
      renderer.domElement = null;

      if (mountRef.current) {
        mountRef.current.innerHTML = ''; // Remover el canvas del DOM explícitamente
      }
    };
  }, [modelUrl]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          backgroundColor: '#f0f0f0', zIndex: 10, color: '#333', fontFamily: 'sans-serif'
        }}>
          <div style={{
            width: '50px', height: '50px', border: '4px solid #ccc',
            borderTop: '4px solid #333', borderRadius: '50%',
            animation: 'spin 1s linear infinite', marginBottom: '16px'
          }} />
          <p>Cargando modelo 3D... {progress}%</p>
          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}

      {/* UI Overlay */}
      {!isLoading && (
        <>
          <div className="flex justify-between w-full pt-[15px] px-[15px] bg-transparent z-[10] absolute items-center gap-2 md:gap-4 pointer-events-none">
            <div className="pointer-events-auto"></div>
            <div className="pointer-events-auto"></div>
            <div className="pointer-events-auto">
              <InformationCard
                info={projectInfo}
                currentModel={currentModel}
              />
            </div>
          </div>

          <div className="z-[9999] pointer-events-none">
            <div className="fixed bottom-[calc(1vh+5px)] left-[calc(2vw+6px)] z-[9999] md:bottom-4 md:left-4 pointer-events-auto">
                <div className="navigation-controls flex flex-col items-center mb-4 gap-2">
                    <div className="flex flex-col items-center mb-1">
                        <span className="text-[12px] uppercase tracking-wider text-black font-bold mb-0.5 drop-shadow-md">
                            {projectInfo?.name || "Proyecto"}
                        </span>
                        <span className="text-[9px] uppercase tracking-tighter text-black/60 font-medium mb-1">
                            Fecha de toma
                        </span>
                        <span className="text-center text-xs md:text-sm font-medium text-white bg-black/60 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full shadow-lg min-w-0 h-auto">
                            {currentModel?.creation_date
                                ? new Date(currentModel.creation_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                                : "Sin fecha"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-[calc(1vh+14px)] right-[calc(2vw+10px)] z-[9999] md:bottom-4 md:right-4 pointer-events-auto">
                <a
                    href="https://wa.me/+573019027822"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-[40px] h-[40px] bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
                >
                    <Whatsapp className="text-white text-3xl md:text-4xl " />
                </a>
            </div>
          </div>

          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none">
              <span className="text-[10px] text-black/40 font-medium tracking-widest uppercase">
                  by <span className="text-black/70">MyView_</span>
              </span>
          </div>
        </>
      )}

      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
    </div>
  );
}
