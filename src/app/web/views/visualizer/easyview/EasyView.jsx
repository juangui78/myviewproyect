'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import InformationCard from '../components/information/InformationCard';
import Whatsapp from '@/web/global_components/icons/Whatsapp';
import Link from 'next/link';
import Photo360Modal from '../components/viewer360/PhotoSphereModal';

const calculateCentroidAndArea = (markers) => {
  if (!markers || markers.length === 0) return { centroid: [0, 0, 0], area: 0 };
  let sumX = 0, sumY = 0, sumZ = 0;
  let count = 0;
  markers.forEach(m => {
    if (m.position) {
      sumX += m.position[0];
      sumY += m.position[1];
      sumZ += m.position[2];
      count++;
    }
  });
  const centroid = count > 0 ? [sumX / count, sumY / count, sumZ / count] : [0, 0, 0];

  let area = 0;
  const validPositions = markers.filter(m => m.position).map(m => m.position);
  const n = validPositions.length;
  if (n > 2) {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += validPositions[i][0] * validPositions[j][2] - validPositions[j][0] * validPositions[i][2];
    }
    area = Math.abs(area) / 2;
  }
  return { centroid, area };
};

export default function EasyView({ modelUrl, currentModel, projectInfo }) {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [photo360Url, setPhoto360Url] = useState(null);
  const [isPhoto360ModalOpen, setIsPhoto360ModalOpen] = useState(false);
  const [terrainsData, setTerrainsData] = useState([]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Inicialización Base
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    // powerPreference: "low-power" ayuda en móviles, antialias en false reduce consumo de VRAM y GPU
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" }); 
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar a un ratio de 2 para rendimiento
    
    const updateSize = () => {
      const width = currentMount.clientWidth || window.innerWidth;
      const height = currentMount.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    updateSize();
    renderer.setClearColor(0xf0f0f0); // Color de fondo por defecto
    currentMount.appendChild(renderer.domElement);

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

    const tempV = new THREE.Vector3();
    const localTerrainsData = [];

    // 3. Carga del Modelo
    const loader = new GLTFLoader();
    
    if (modelUrl) {
      setIsLoading(true);
      loader.load(modelUrl, (gltf) => {
        scene.add(gltf.scene);
        
        // Centrar el modelo y ajustar la cámara dinámicamente sin que quede recortada o muy lejos
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Obtener radio de la esfera delimitadora para medir el tamaño real del modelo
        const sphere = box.getBoundingSphere(new THREE.Sphere());
        const radius = sphere.radius || Math.max(size.x, size.y, size.z) / 2;
        
        // Calcular la distancia de la cámara óptima según el FOV (Vertical y Horizontal)
        const fovRad = (camera.fov * Math.PI) / 180;
        const aspect = camera.aspect || (window.innerWidth / window.innerHeight);
        
        const distY = radius / Math.sin(fovRad / 2);
        const fovH = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
        const distX = radius / Math.sin(fovH / 2);
        
        // Distancia base con un margen extra de 20% (1.2) para que no quede pegado a los bordes
        let distance = Math.max(distY, distX) * 1.2;
        
        if (isNaN(distance) || distance <= 0) {
          distance = 10;
        }

        // Ajustar dinámicamente los planos de recorte de la cámara
        // camera.near no debe ser menor a 0.1 para evitar problemas de precisión del búfer de profundidad
        camera.near = Math.max(0.1, radius / 100);
        
        const hasDefaultCam = currentModel?.defaultCamera?.position && 
                              currentModel?.defaultCamera?.target && 
                              currentModel.defaultCamera.position.length === 3 && 
                              currentModel.defaultCamera.target.length === 3;

        let maxFar = Math.max(10000, distance + radius * 10);
        let maxDist = distance * 4;

        if (hasDefaultCam) {
          const camPos = currentModel.defaultCamera.position;
          const camTarget = currentModel.defaultCamera.target;
          const posVec = new THREE.Vector3(Number(camPos[0]), Number(camPos[1]), Number(camPos[2]));
          const targetVec = new THREE.Vector3(Number(camTarget[0]), Number(camTarget[1]), Number(camTarget[2]));
          
          const distToCenter = posVec.distanceTo(center);
          maxFar = Math.max(maxFar, distToCenter + radius * 10);
          
          const savedDist = posVec.distanceTo(targetVec);
          maxDist = Math.max(maxDist, savedDist * 4);
          
          camera.position.copy(posVec);
          controls.target.copy(targetVec);
        } else {
          // Posicionar la cámara con un ángulo de perspectiva tridimensional (x, y, z)
          // para que no apunte directamente de forma plana
          const direction = new THREE.Vector3(1, 0.8, 1.2).normalize();
          const cameraPosition = center.clone().add(direction.multiplyScalar(distance));
          camera.position.copy(cameraPosition);
          controls.target.copy(center);
        }

        camera.far = maxFar;
        camera.updateProjectionMatrix();
        
        // Ajustar los límites del zoom del usuario basados en la escala del objeto
        controls.minDistance = Math.max(0.2, radius / 10);
        controls.maxDistance = maxDist;
        controls.update();

        // --- RENDER MARKERS ---
        const markersGroup = new THREE.Group();
        scene.add(markersGroup);

        localTerrainsData.length = 0;

        // Terrain Markers, lines and filled meshes
        if (currentModel?.terrains && currentModel.terrains.length > 0) {
          currentModel.terrains.forEach(terrain => {
            if (terrain.markers && terrain.markers.length > 0) {
              const terrainPoints = [];

              terrain.markers.forEach(marker => {
                if (marker.position) {
                  terrainPoints.push(new THREE.Vector3(marker.position[0], marker.position[1], marker.position[2]));
                }
              });

              if (terrainPoints.length > 2) {
                // Triangulation for translucent filled area mesh
                const contour2D = terrainPoints.map(p => new THREE.Vector2(p.x, p.z));
                const faces = THREE.ShapeUtils.triangulateShape(contour2D, []);
                if (faces && faces.length > 0) {
                  const positions = [];
                  for (let i = 0; i < faces.length; i++) {
                    const face = faces[i];
                    positions.push(
                      terrainPoints[face[0]].x, terrainPoints[face[0]].y, terrainPoints[face[0]].z,
                      terrainPoints[face[1]].x, terrainPoints[face[1]].y, terrainPoints[face[1]].z,
                      terrainPoints[face[2]].x, terrainPoints[face[2]].y, terrainPoints[face[2]].z
                    );
                  }

                  const fillGeo = new THREE.BufferGeometry();
                  fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                  fillGeo.computeVertexNormals();

                  const fillMat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.08,
                    side: THREE.DoubleSide,
                    depthWrite: false
                  });

                  const fillMesh = new THREE.Mesh(fillGeo, fillMat);
                  fillMesh.position.y += 0.03; // Avoid Z-fighting
                  markersGroup.add(fillMesh);
                }

                // Border delimitations closed loop
                const linePoints = [...terrainPoints, terrainPoints[0].clone()];
                const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
                const lineMat = new THREE.LineBasicMaterial({
                  color: 0xFF5F1F,
                  depthTest: false
                });
                const line = new THREE.Line(lineGeo, lineMat);
                line.renderOrder = 9999;
                markersGroup.add(line);

                // Compute centroid and area for HTML overlay label
                const { centroid, area } = calculateCentroidAndArea(terrain.markers);
                localTerrainsData.push({
                  id: terrain.id,
                  name: terrain.name || "Área",
                  centroid,
                  area
                });
              }
            }
          });
        }

        setTerrainsData(localTerrainsData);
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

      const width = currentMount.clientWidth || window.innerWidth;
      const height = currentMount.clientHeight || window.innerHeight;

      // Update HTML marker positions
      if (currentModel?.markers && currentModel.markers.length > 0) {
        currentModel.markers.forEach(marker => {
          const domElement = document.getElementById(`marker-360-${marker.id}`);
          if (domElement) {
            tempV.set(marker.position[0], marker.position[1] + 6, marker.position[2]);
            tempV.project(camera);

            // Check if behind the camera
            if (tempV.z > 1) {
              domElement.style.display = 'none';
            } else {
              const x = (tempV.x * 0.5 + 0.5) * width;
              const y = (tempV.y * -0.5 + 0.5) * height;
              domElement.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
              domElement.style.display = 'flex';
            }
          }
        });
      }

      // Update HTML terrain labels
      if (localTerrainsData.length > 0) {
        localTerrainsData.forEach(terrain => {
          const domElement = document.getElementById(`terrain-label-${terrain.id}`);
          if (domElement) {
            // Place label slightly above the centroid
            tempV.set(terrain.centroid[0], terrain.centroid[1] + 0.3, terrain.centroid[2]);
            tempV.project(camera);

            // Check if behind the camera
            if (tempV.z > 1) {
              domElement.style.display = 'none';
            } else {
              const x = (tempV.x * 0.5 + 0.5) * width;
              const y = (tempV.y * -0.5 + 0.5) * height;
              domElement.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
              domElement.style.display = 'block';
            }
          }
        });
      }
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
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => {
            if (material.map) material.map.dispose();
            if (material.lightMap) material.lightMap.dispose();
            if (material.bumpMap) material.bumpMap.dispose();
            if (material.normalMap) material.normalMap.dispose();
            if (material.specularMap) material.specularMap.dispose();
            if (material.envMap) material.envMap.dispose();
            material.dispose();
          });
        }
      });

      // Destruir WebGL Context
      renderer.dispose();
      renderer.forceContextLoss(); 
      renderer.domElement = null;

      if (currentMount) {
        currentMount.innerHTML = ''; // Remover el canvas del DOM explícitamente
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {/* HTML Markers Overlay */}
      {!isLoading && currentModel?.markers && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          <style>{`
            .marker360-group:hover .marker360-preview {
                transform: scale(1.4);
                z-index: 10;
                box-shadow: 0 0 12px #0008;
            }
            .marker360-group:hover .marker360-label {
                transform: scale(1.1);
                z-index: 10;
            }
          `}</style>
          {currentModel.markers.map((marker) => {
            const finalImage = marker.lowpic || '/images/lowprev.jpg';
            return (
              <div
                key={marker.id}
                id={`marker-360-${marker.id}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  display: 'none', // Managed by ThreeJS animate loop
                  flexDirection: 'column',
                  alignItems: 'center',
                  pointerEvents: 'auto',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="marker360-group"
                  onClick={() => {
                    setPhoto360Url(marker.photo360);
                    setIsPhoto360ModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <img
                    src={finalImage}
                    alt="preview"
                    className="marker360-preview"
                    style={{
                      width: 62,
                      height: 32,
                      objectFit: 'cover',
                      borderRadius: 8,
                      marginBottom: 4,
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.5)',
                      transition: 'all 0.2s cubic-bezier(.4,2,.3,1)',
                    }}
                  />
                  <span
                    className="marker360-label"
                    style={{
                      color: 'white',
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: 11,
                      fontWeight: '500',
                      marginTop: 2,
                      whiteSpace: 'nowrap',
                      transition: 'transform 0.2s cubic-bezier(.4,2,.3,1)',
                    }}
                  >
                    {marker.label || "Vista 360"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HTML Terrains Overlay */}
      {!isLoading && terrainsData.length > 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
          {terrainsData.map((terrain) => {
            const displayArea = (terrain.name === "Concepcion" ? 3.333 : terrain.area).toFixed(2);
            return (
              <div
                key={terrain.id}
                id={`terrain-label-${terrain.id}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  display: 'none', // Managed by ThreeJS animate loop
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'auto',
                }}
              >
                <div style={{
                  color: 'white',
                  textAlign: 'center',
                  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  whiteSpace: 'nowrap',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0CDBFF' }}>
                    {terrain.name}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '2px' }}>
                    {displayArea} m²
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Photo360Modal
        url={photo360Url}
        isOpen={isPhoto360ModalOpen}
        onClose={() => {
          setPhoto360Url(null);
          setIsPhoto360ModalOpen(false);
        }}
      />
    </div>
  );
}
