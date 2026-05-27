'use client';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export default function EasyView({ modelUrl }) {
  const mountRef = useRef(null);

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
      }, undefined, (error) => {
        console.error('Error al cargar el modelo 3D:', error);
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

  return <div ref={mountRef} style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative' }} />;
}
