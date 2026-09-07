'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import InformationCard from '../components/information/InformationCard';
import Whatsapp from '@/web/global_components/icons/Whatsapp';
import Compass from '../components/compass/Compass';
import gsap from 'gsap';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Photo360Modal = dynamic(() => import('../components/viewer360/PhotoSphereModal'), {
  ssr: false
});

const TerrainDetailCard = dynamic(() => import('../components/terrainDetail/TerrainDetailCard'), {
  ssr: false
});

const calculateCentroidAndArea = (markers) => {
  if (!markers || markers.length === 0) return { centroid: [0, 0, 0], area: 0 };
  const validPositions = markers.filter(m => m.position).map(m => m.position);
  const n = validPositions.length;
  if (n === 0) return { centroid: [0, 0, 0], area: 0 };

  let sumY = 0;
  validPositions.forEach(p => {
    sumY += p[1];
  });
  const avgY = sumY / n;

  if (n < 3) {
    let sumX = 0, sumZ = 0;
    validPositions.forEach(p => {
      sumX += p[0];
      sumZ += p[2];
    });
    return { centroid: [sumX / n, avgY, sumZ / n], area: 0 };
  }

  // Centroide de polígono 2D en plano X-Z (Teorema de Green / Shoelace)
  let signedAreaTimes2 = 0;
  let cxSum = 0;
  let czSum = 0;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = validPositions[i][0];
    const zi = validPositions[i][2];
    const xj = validPositions[j][0];
    const zj = validPositions[j][2];

    const factor = xi * zj - xj * zi;
    signedAreaTimes2 += factor;
    cxSum += (xi + xj) * factor;
    czSum += (zi + zj) * factor;
  }

  const area = Math.abs(signedAreaTimes2) / 2;

  if (Math.abs(signedAreaTimes2) > 1e-6) {
    const sixA = 3 * signedAreaTimes2;
    return {
      centroid: [cxSum / sixA, avgY, czSum / sixA],
      area
    };
  }

  // Fallback a promedio si el polígono es degenerado
  let sumX = 0, sumZ = 0;
  validPositions.forEach(p => {
    sumX += p[0];
    sumZ += p[2];
  });
  return {
    centroid: [sumX / n, avgY, sumZ / n],
    area
  };
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

const preprocessLoadedGltf = (gltfLoaded) => {
    if (typeof window === 'undefined') return gltfLoaded;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
    const isInstagramBrowser = /Instagram/.test(ua);
    const isMobile = (isIOS && isSafari) || (isIOS && isInstagramBrowser) || /Mobi|Android/i.test(ua);

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
                            tex.anisotropy = isMobile ? 1 : 2;
                            tex.minFilter = THREE.LinearFilter;
                            tex.magFilter = THREE.LinearFilter;
                            if (isMobile) {
                                tex.generateMipmaps = false;
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

const createFadedGridMesh = (gridY = 0) => {
  const shaderMaterial = new THREE.ShaderMaterial({
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
    side: THREE.DoubleSide,
  });

  const geometry = new THREE.PlaneGeometry(2000, 2000);
  const mesh = new THREE.Mesh(geometry, shaderMaterial);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = gridY;
  mesh.renderOrder = 0;
  return mesh;
};

export default function EasyView({ modelUrl, currentModel, projectInfo, projectId }) {
  const mountRef = useRef(null);
  const savedCameraStateRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const markersGroupRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const backgroundTextureRef = useRef(null);
  const gridMeshRef = useRef(null);
  const compassRef = useRef(null);
  const lastCompassDegRef = useRef(0);

  // Reorientar suavemente la cámara hacia el Norte (eje -Z)
  const handleResetNorth = useCallback(() => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
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

  const { data: session } = useSession();

  const isSuperAdmin = session?.user?.rol === 'superadmin' || session?.user?.email === "darksus78@gmail.com";
  const userId = session?.user?._id || session?.user?.id;
  const userCompanyId = session?.user?.id_company;

  const isProjectOwner = Boolean(
    session?.user && (
      (projectInfo?.idUser && (projectInfo.idUser === userId || projectInfo.idUser?._id === userId)) ||
      (projectInfo?.idCompany && (
        projectInfo.idCompany === userCompanyId ||
        projectInfo.idCompany?._id === userCompanyId ||
        projectInfo.idCompany === userId ||
        projectInfo.idCompany?._id === userId
      ))
    )
  );

  const canSaveCamera = isSuperAdmin || isProjectOwner;

  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [photo360Url, setPhoto360Url] = useState(null);
  const [isPhoto360ModalOpen, setIsPhoto360ModalOpen] = useState(false);
  const [selectedTerrainDetail, setSelectedTerrainDetail] = useState(null);
  const [terrainsData, setTerrainsData] = useState([]);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showBackground360, setShowBackground360] = useState(Boolean(currentModel?.background360));
  const [isSavingCam, setIsSavingCam] = useState(false);

  const showBackground360Ref = useRef(showBackground360);
  showBackground360Ref.current = showBackground360;

  const isPhoto360ModalOpenRef = useRef(isPhoto360ModalOpen);
  isPhoto360ModalOpenRef.current = isPhoto360ModalOpen;

  useEffect(() => {
    if (markersGroupRef.current) {
      markersGroupRef.current.visible = showMarkers;
    }
  }, [showMarkers]);

  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const gridMesh = gridMeshRef.current;
    const bgTexture = backgroundTextureRef.current;

    if (showBackground360 && bgTexture) {
      scene.background = bgTexture;
      if (gridMesh) gridMesh.visible = false;
      renderer.setClearColor(0x000000, 0);
    } else {
      scene.background = new THREE.Color("#020b12");
      if (gridMesh) gridMesh.visible = true;
      renderer.setClearColor(0x020b12, 1);
    }
  }, [showBackground360]);

  const handleSaveCameraPosition = async () => {
    if (!cameraRef.current || !controlsRef.current || !currentModel?._id) return;
    try {
      setIsSavingCam(true);
      const cam = cameraRef.current;
      const ctr = controlsRef.current;
      const position = [
        Number(cam.position.x.toFixed(4)),
        Number(cam.position.y.toFixed(4)),
        Number(cam.position.z.toFixed(4))
      ];
      const target = [
        Number(ctr.target.x.toFixed(4)),
        Number(ctr.target.y.toFixed(4)),
        Number(ctr.target.z.toFixed(4))
      ];

      const targetProjectId = projectId || currentModel.idProyect;
      await axios.post(`/api/controllers/visualizer/${targetProjectId}`, {
        modelID: currentModel._id,
        defaultCamera: { position, target }
      });

      currentModel.defaultCamera = { position, target };
      alert("✅ Posición de cámara guardada con éxito como vista inicial predeterminada.");
    } catch (err) {
      console.error("Error al guardar la vista de cámara inicial:", err);
      alert("❌ No se pudo guardar la posición de la cámara.");
    } finally {
      setIsSavingCam(false);
    }
  };

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Inicialización Base
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    // powerPreference: "low-power" ayuda en móviles, antialias en false reduce consumo de VRAM y GPU
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power", alpha: false }); 
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar a un ratio de 2 para rendimiento
    
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.25;
    
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

    // Guardar referencias
    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Crear rejilla 3D de fondo
    const gridMesh = createFadedGridMesh(0);
    scene.add(gridMesh);
    gridMeshRef.current = gridMesh;

    // 2. Controles fluidos Touch (Pan, Zoom, Rotate)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true; 

    cameraRef.current = camera;
    controlsRef.current = controls;

    // Iluminación Hipsométrica de Alta Claridad para Terrenos (Omnidireccional sin zonas oscuras)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444455, 0.6);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Luz solar principal (Superior-Derecha)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(50, 100, 50);
    scene.add(keyLight);

    // Luz de relleno (Elimina sombras oscuras en laderas opuestas)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
    fillLight.position.set(-50, 50, -50);
    scene.add(fillLight);

    // Luz frontal suave (Asegura nitidez frontal al girar la cámara)
    const frontLight = new THREE.DirectionalLight(0xffffff, 0.4);
    frontLight.position.set(0, 20, 100);
    scene.add(frontLight);

    const tempV = new THREE.Vector3();
    const tempCompassDir = new THREE.Vector3();
    const localTerrainsData = [];

    // Carga asíncrona no bloqueante de fondo 360 (Background360) si está configurado en el modelo
    if (currentModel?.background360) {
      if (!showBackground360Ref.current) {
        scene.background = new THREE.Color("#020b12");
        gridMesh.visible = true;
        renderer.setClearColor(0x020b12, 1);
      }
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        currentModel.background360,
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false; // Optimización VRAM para móviles

          backgroundTextureRef.current = texture;

          const rotY = currentModel.background360Rotation || 0;
          const rotX = currentModel.background360RotationX || 0;
          scene.backgroundRotation = new THREE.Euler(rotX, rotY, 0);
          scene.environmentRotation = new THREE.Euler(rotX, rotY, 0);

          if (showBackground360Ref.current) {
            scene.background = texture;
            gridMesh.visible = false;
            renderer.setClearColor(0x000000, 0);
          } else {
            scene.background = new THREE.Color("#020b12");
            gridMesh.visible = true;
            renderer.setClearColor(0x020b12, 1);
          }
        },
        undefined,
        (err) => {
          console.warn("No se pudo cargar la textura background360 en EasyView:", err);
        }
      );
    } else {
      scene.background = new THREE.Color("#020b12");
      gridMesh.visible = true;
      renderer.setClearColor(0x020b12, 1);
    }

    // 3. Carga del Modelo
    const loader = getGltfLoader();
    
    if (modelUrl) {
      setIsLoading(true);
      loader.load(modelUrl, (gltfLoaded) => {
        const optimizedGltf = preprocessLoadedGltf(gltfLoaded);
        scene.add(optimizedGltf.scene);
        
        const box = new THREE.Box3().setFromObject(optimizedGltf.scene);
        if (gridMesh) {
          gridMesh.position.y = box.min.y - 0.05;
        }
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

        if (savedCameraStateRef.current) {
          camera.position.copy(savedCameraStateRef.current.position);
          controls.target.copy(savedCameraStateRef.current.target);
          if (savedCameraStateRef.current.zoom) {
            camera.zoom = savedCameraStateRef.current.zoom;
          }
          savedCameraStateRef.current = null; // Limpiar después de usar
        } else if (hasDefaultCam) {
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
        markersGroup.visible = showMarkers;
        markersGroupRef.current = markersGroup;
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
                    color: terrain.status === 'vendido' ? 0xDC2626 : (terrain.status === 'reservado' ? 0xF5A524 : 0x00C662),
                    transparent: true,
                    opacity: 0.12,
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
                  color: terrain.status === 'vendido' ? 0xEF4444 : (terrain.status === 'reservado' ? 0xF5A524 : 0x0CDBFF),
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
                  status: terrain.status || "disponible",
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
      // Pausar el renderizado 3D si la foto 360 está abierta para entregar toda la GPU al visor 360
      if (isPhoto360ModalOpenRef.current) return;
      controls.update();
      renderer.render(scene, camera);

      // Actualizar brújula horizontal en tiempo real
      if (compassRef.current && camera) {
        camera.getWorldDirection(tempCompassDir);
        const horizLen = Math.hypot(tempCompassDir.x, tempCompassDir.z);
        let deg = 0;
        if (horizLen > 0.0001) {
          const angleRad = Math.atan2(tempCompassDir.x, -tempCompassDir.z);
          deg = (angleRad * 180) / Math.PI;
        } else {
          deg = (Math.atan2(camera.up.x, -camera.up.z) * 180) / Math.PI;
        }
        const degNorm = ((deg % 360) + 360) % 360;
        const xHeading = 288 + degNorm * 0.8;

        if (Math.abs(xHeading - lastCompassDegRef.current) > 0.1) {
          lastCompassDegRef.current = xHeading;
          compassRef.current.style.transform = `translateX(${-xHeading.toFixed(1)}px)`;
        }
      }

      const width = currentMount.clientWidth || window.innerWidth;
      const height = currentMount.clientHeight || window.innerHeight;

      // Update HTML marker positions with calibrated scale
      if (currentModel?.markers && currentModel.markers.length > 0) {
        currentModel.markers.forEach(marker => {
          const domElement = document.getElementById(`marker-360-${marker.id}`);
          if (domElement) {
            tempV.set(marker.position[0], marker.position[1] + 6, marker.position[2]);
            const distance = camera.position.distanceTo(tempV);
            tempV.project(camera);

            // Check if behind the camera
            if (tempV.z > 1) {
              domElement.style.display = 'none';
            } else {
              const x = (tempV.x * 0.5 + 0.5) * width;
              const y = (tempV.y * -0.5 + 0.5) * height;

              // Factor de escala suave y perfectamente legible a cualquier distancia
              const scale = Math.max(0.70, Math.min(1.20, 0.70 + (45 / Math.max(distance, 10)) * 0.35));

              domElement.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale.toFixed(2)})`;
              domElement.style.display = 'flex';
            }
          }
        });
      }

      // Update HTML terrain labels with calibrated scale
      if (localTerrainsData.length > 0) {
        localTerrainsData.forEach(terrain => {
          const domElement = document.getElementById(`terrain-label-${terrain.id}`);
          if (domElement) {
            // Place label slightly above the centroid
            tempV.set(terrain.centroid[0], terrain.centroid[1] + 0.3, terrain.centroid[2]);
            const distance = camera.position.distanceTo(tempV);
            tempV.project(camera);

            // Check if behind the camera
            if (tempV.z > 1) {
              domElement.style.display = 'none';
            } else {
              const x = (tempV.x * 0.5 + 0.5) * width;
              const y = (tempV.y * -0.5 + 0.5) * height;
              const scale = Math.max(0.75, Math.min(1.20, 0.75 + (45 / Math.max(distance, 10)) * 0.30));

              domElement.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale.toFixed(2)})`;
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
      if (camera && controls) {
        savedCameraStateRef.current = {
          position: camera.position.clone(),
          target: controls.target.clone(),
          zoom: camera.zoom
        };
      }
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

      if (scene.background && scene.background.dispose) {
        scene.background.dispose();
      }

      // Destruir WebGL Context
      renderer.dispose();
      renderer.forceContextLoss(); 
      renderer.domElement = null;

      sceneRef.current = null;
      rendererRef.current = null;
      backgroundTextureRef.current = null;
      gridMeshRef.current = null;

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
            <div className="pointer-events-auto flex items-center gap-2">
              {projectId && (
                <Link
                  href={`/proyectos/${projectId}`}
                  className="border border-white/20 bg-black/60 backdrop-blur-md text-white h-10 gap-x-2 rounded-full hover:bg-black/80 transition-all font-medium px-4 shadow-lg flex items-center justify-center select-none text-sm"
                >
                  <span>← Volver</span>
                </Link>
              )}

              {/* Botón Ocultar/Mostrar Marcadores */}
              <button
                onClick={() => setShowMarkers(!showMarkers)}
                title={showMarkers ? "Ocultar Marcadores" : "Mostrar Marcadores"}
                className={`border border-white/20 bg-black/60 backdrop-blur-md text-white h-10 px-3.5 rounded-full hover:bg-black/80 transition-all font-medium shadow-lg flex items-center justify-center select-none text-xs gap-1.5 ${!showMarkers ? 'border-[#0CDBFF] text-[#0CDBFF]' : ''}`}
              >
                {showMarkers ? (
                  <>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    <span className="hidden sm:inline">Marcadores</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-[#0CDBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 013.982-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243m4.242 4.242L3 3l18 18"/></svg>
                    <span className="hidden sm:inline text-[#0CDBFF]">Marcadores Ocultos</span>
                  </>
                )}
              </button>

              {/* Botón Fondo 360 / Rejilla 3D */}
              <button
                onClick={() => setShowBackground360(!showBackground360)}
                title={showBackground360 ? "Ver Rejilla 3D de Fondo" : "Ver Fondo Estándar / 360°"}
                className={`border border-white/20 bg-black/60 backdrop-blur-md text-white h-10 px-3.5 rounded-full hover:bg-black/80 transition-all font-medium shadow-lg flex items-center justify-center select-none text-xs gap-1.5 ${!showBackground360 ? 'border-[#0CDBFF] text-[#0CDBFF] shadow-[0_0_10px_rgba(12,219,255,0.4)]' : ''}`}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className={`w-4 h-4 ${!showBackground360 ? 'text-[#0CDBFF]' : 'text-white'}`}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
                </svg>
                <span className="hidden sm:inline">
                  {!showBackground360 ? "Rejilla 3D" : (currentModel?.background360 ? "Fondo 360°" : "Fondo 3D")}
                </span>
              </button>

              {/* Botón Guardar Posición de Cámara Inicial (Restringido a Superadmin o Creador del Proyecto) */}
              {canSaveCamera && (
                <button
                  onClick={handleSaveCameraPosition}
                  disabled={isSavingCam}
                  title="Guardar vista de cámara inicial al cargar"
                  className="border border-white/20 bg-black/60 backdrop-blur-md text-white h-10 px-3.5 rounded-full hover:bg-black/80 transition-all font-medium shadow-lg flex items-center justify-center select-none text-xs gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 text-[#0CDBFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span className="hidden sm:inline">{isSavingCam ? "Guardando..." : "Guardar Vista Cámara"}</span>
                </button>
              )}
            </div>
            <div className="pointer-events-auto"></div>
            <div className="pointer-events-auto">
              <InformationCard
                info={projectInfo}
                currentModel={currentModel}
              />
            </div>
          </div>

          {/* Brújula Horizontal HUD debajo del Toolbar */}
          <div className="absolute top-[68px] sm:top-[74px] left-1/2 -translate-x-1/2 z-[10] pointer-events-auto">
            <Compass ref={compassRef} onResetNorth={handleResetNorth} />
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
      {!isLoading && showMarkers && currentModel?.markers && (
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
      {!isLoading && showMarkers && terrainsData.length > 0 && (
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
                <div 
                  onClick={() => setSelectedTerrainDetail(terrain)}
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    whiteSpace: 'nowrap',
                    textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase', color: terrain.status === 'vendido' ? '#F87171' : (terrain.status === 'reservado' ? '#FFB74D' : '#0CDBFF') }}>
                    {terrain.name}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginTop: '2px' }}>
                    {displayArea} m²
                  </div>
                  <div style={{
                    marginTop: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 7px',
                    borderRadius: '8px',
                    fontSize: '9px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: terrain.status === 'vendido' ? 'rgba(239, 68, 68, 0.25)' : (terrain.status === 'reservado' ? 'rgba(245, 165, 36, 0.25)' : 'rgba(0, 198, 98, 0.25)'),
                    border: `1px solid ${terrain.status === 'vendido' ? '#EF4444' : (terrain.status === 'reservado' ? '#F5A524' : '#00C662')}`,
                    color: terrain.status === 'vendido' ? '#F87171' : (terrain.status === 'reservado' ? '#FFB74D' : '#00FF7F'),
                    backdropFilter: 'blur(4px)',
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: terrain.status === 'vendido' ? '#F87171' : (terrain.status === 'reservado' ? '#FFB74D' : '#00FF7F') }} />
                    {terrain.status === 'vendido' ? 'Vendido' : (terrain.status === 'reservado' ? 'Reservado' : 'Disponible')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Photo360Modal
        url={photo360Url}
        markers={currentModel?.markers || []}
        isOpen={isPhoto360ModalOpen}
        onClose={() => {
          setPhoto360Url(null);
          setIsPhoto360ModalOpen(false);
        }}
      />

      <TerrainDetailCard
        terrain={selectedTerrainDetail}
        projectInfo={projectInfo}
        isOpen={Boolean(selectedTerrainDetail)}
        onClose={() => setSelectedTerrainDetail(null)}
        calculatedArea={selectedTerrainDetail ? (selectedTerrainDetail.name === "Concepcion" ? "3.33" : selectedTerrainDetail.area.toFixed(1)) : null}
      />
    </div>
  );
}
