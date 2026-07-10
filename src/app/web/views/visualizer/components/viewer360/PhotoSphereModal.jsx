import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import * as THREE from 'three';
import { useTexture } from "@react-three/drei";
import "@photo-sphere-viewer/core/index.css";
import "@photo-sphere-viewer/markers-plugin/index.css";

const Photo360Modal = ({ url, isOpen, onClose, markers = [], isEditMode = false, onSaveYawOffset }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [activeUrl, setActiveUrl] = useState(null);
  
  // Local state to handle real-time manual orientation adjustment (in degrees)
  const [localOffsetDegrees, setLocalOffsetDegrees] = useState(0);
  const [isSaved, setIsSaved] = useState(true);

  // Toggle edit/calibration mode directly inside the modal
  const [isLocalEditMode, setIsLocalEditMode] = useState(isEditMode);

  // Sync isLocalEditMode with parent isEditMode prop
  useEffect(() => {
    setIsLocalEditMode(isEditMode);
  }, [isEditMode, isOpen]);

  // Find current marker object based on activeUrl
  const activeMarker = markers.find(m => m.photo360 === activeUrl);

  // Sync slider value when current active marker changes
  useEffect(() => {
    if (activeMarker) {
      const currentOffsetRad = activeMarker.yawOffset !== undefined ? activeMarker.yawOffset : 0;
      setLocalOffsetDegrees(currentOffsetRad * (180 / Math.PI));
      setIsSaved(true);
    }
  }, [activeUrl, activeMarker]);

  // SECUENTIAL NAVIGATION HANDLERS (Arrows on left/right edges of the screen)
  const activeIndex = markers.findIndex(m => m.photo360 === activeUrl);
  const hasMultipleMarkers = markers.length > 1;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (activeIndex > 0) {
      setActiveUrl(markers[activeIndex - 1].photo360);
    } else {
      setActiveUrl(markers[markers.length - 1].photo360); // Loop to end
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (activeIndex < markers.length - 1) {
      setActiveUrl(markers[activeIndex + 1].photo360);
    } else {
      setActiveUrl(markers[0].photo360); // Loop to start
    }
  };

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value);
    setLocalOffsetDegrees(value);
    setIsSaved(false);
  };

  const handleSave = () => {
    if (activeMarker && onSaveYawOffset) {
      const radValue = localOffsetDegrees * (Math.PI / 180);
      onSaveYawOffset(activeMarker.id, radValue);
      setIsSaved(true);
      
      // Confirm with a popup, as requested by the user
      alert(`¡Alineación guardada localmente para "${activeMarker.label || 'este mirador'}"!\n\nÁngulo guardado: ${Math.round(localOffsetDegrees)}°.\n\n⚠️ IMPORTANTE: Esta alineación aún no se ha subido al servidor. Para guardarla permanentemente en la base de datos, debes cerrar este modal y pulsar el botón "Guardar" de la barra de herramientas.`);
    }
  };

  // 1. Manage Viewer Lifecycle: Instantiate on open, destroy on close
  useEffect(() => {
    if (!isOpen || !url) {
      // Destroy viewer if active when modal closes
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      setActiveUrl(null);
      return;
    }

    // Set activeUrl on open
    setActiveUrl(url);

    // Initialize clean viewer instance
    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama: url,
      loadingImg: "",
      navbar: ["zoom", "fullscreen"],
      useXmpData: false,
      webgl: {
        context: "webgl",
        preserveDrawingBuffer: false,
      },
      defaultZoomLvl: 0,
      plugins: [
        [MarkersPlugin, {}]
      ]
    });

    const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);

    // Event handler when a hotspot marker is clicked
    const onClickMarker = (event) => {
      const destinationMarker = event.marker.data?.markerData;
      if (destinationMarker && destinationMarker.photo360) {
        setActiveUrl(destinationMarker.photo360);
      }
    };

    markersPlugin.addEventListener('select-marker', onClickMarker);

    // Cleanup on unmount/close
    return () => {
      if (viewerRef.current) {
        markersPlugin.removeEventListener('select-marker', onClickMarker);
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [isOpen, url]);

  // 2. Update panorama and calculate hotspots when activeUrl, markers list, localOffsetDegrees, or isSaved changes
  useEffect(() => {
    let isCurrent = true; // Tracks if this effect run is the most recent one

    if (!viewerRef.current || !activeUrl || !isOpen) return;

    const markersPlugin = viewerRef.current.getPlugin(MarkersPlugin);
    
    // Clear old hotspots instantly before the transition starts
    if (markersPlugin) {
      markersPlugin.clearMarkers();
    }

    viewerRef.current.setPanorama(activeUrl, {
      zoom: 0,
      transition: true,
      showLoader: false,
    }).then(() => {
      // If a new transition started while this one was loading, do not modify markers
      if (!isCurrent) return;

      const activeMarkerObj = markers.find(m => m.photo360 === activeUrl);
      
      if (markersPlugin && activeMarkerObj && activeMarkerObj.position) {
        markersPlugin.clearMarkers(); // Ensure we have a completely clean slate
        
        const currentPos = new THREE.Vector3(...activeMarkerObj.position);
        
        markers.forEach((marker) => {
          // Ignore ourselves and markers without photo URL or position
          if (marker.id === activeMarkerObj.id || !marker.photo360 || !marker.position) return;
          
          const targetPos = new THREE.Vector3(...marker.position);
          const direction = new THREE.Vector3().subVectors(targetPos, currentPos);
          const distance = direction.length();
          
          // Calculate Yaw (angle in horizontal plane) and Pitch (elevation vertical angle)
          const baseYaw = Math.atan2(direction.x, -direction.z);
          const pitch = Math.asin(direction.y / distance);
          
          // Use parent's saved yawOffset if the slider hasn't been modified (isSaved is true)
          // otherwise use the local slider's value in real-time.
          const yawOffsetRad = isSaved 
            ? (activeMarkerObj.yawOffset || 0) 
            : (localOffsetDegrees * (Math.PI / 180));
          const yaw = baseYaw + yawOffsetRad;
          
          // Prevent PSVError: cannot find marker by checking getMarkers() array first
          const markerId = `hotspot-${marker.id}`;
          const exists = markersPlugin.getMarkers().some(m => m.id === markerId);
          if (!exists) {
            markersPlugin.addMarker({
              id: markerId,
              position: { yaw, pitch },
              html: `
                <div class="custom-hotspot" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.6)); transition: transform 0.2s ease;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="rgba(0, 0, 0, 0.65)" stroke="#0CDBFF" stroke-width="2"/>
                    <path d="M12 8L16 12L12 16M16 12H8" stroke="#0CDBFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div style="background: rgba(0,0,0,0.8); color: white; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; font-family: system-ui, sans-serif; white-space: nowrap; margin-top: 4px; border: 1px solid rgba(255,255,255,0.25); box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    ${marker.label || 'Mirador'}
                  </div>
                </div>
              `,
              anchor: 'bottom center',
              tooltip: {
                content: marker.label || 'Ver mirador',
                position: 'top center',
              },
              data: {
                markerData: marker
              }
            });
          }
        });
      }
    }).catch(error => {
      console.error("Error al cargar panorama:", error);
    });

    return () => {
      isCurrent = false; // Mark this hook run as inactive on cleanup/next run
    };
  }, [activeUrl, isOpen, markers, localOffsetDegrees, isSaved]);

  // 3. Preload adjacent panorama textures in the background to ensure instant transition
  useEffect(() => {
    if (!activeUrl || !markers.length || !isOpen) return;

    const activeMarkerObj = markers.find(m => m.photo360 === activeUrl);
    if (!activeMarkerObj || !activeMarkerObj.position) return;

    const currentPos = new THREE.Vector3(...activeMarkerObj.position);

    markers.forEach((marker) => {
      // Ignore ourselves and markers without photo URL or position
      if (marker.id === activeMarkerObj.id || !marker.photo360 || !marker.position) return;

      const targetPos = new THREE.Vector3(...marker.position);
      const distance = currentPos.distanceTo(targetPos);

      // Preload adjacent node textures (within 20 meters)
      if (distance <= 20) {
        try {
          // Preload using Drei's useTexture cache
          useTexture.preload(marker.photo360);

          // Preload using standard Image constructor to populate the browser's HTTP cache
          // ensuring the Photo Sphere Viewer's separate context receives it instantly from cache
          const img = new Image();
          img.src = marker.photo360;
        } catch (e) {
          console.warn("Failed to preload texture:", marker.photo360, e);
        }
      }
    });
  }, [activeUrl, markers, isOpen]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <style>{`
        .custom-hotspot:hover {
          transform: scale(1.2) !important;
        }
      `}</style>

      <div 
        className="relative w-[90vw] h-[90vh] bg-black rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Card */}
        {activeMarker && (
          <div className="absolute top-4 left-4 z-10 bg-black/60 border border-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-white pointer-events-none select-none">
            <div className="text-[10px] uppercase tracking-wider text-[#0CDBFF] font-bold">Tour Virtual 360</div>
            <div className="text-sm font-semibold">{activeMarker.label || "Mirador Activo"}</div>
          </div>
        )}

        {/* Top Header Buttons Container */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {isEditMode && onSaveYawOffset && (
            <button
              onClick={() => setIsLocalEditMode(!isLocalEditMode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all backdrop-blur-md ${
                isLocalEditMode 
                  ? "bg-[#0CDBFF] text-black border-[#0CDBFF] hover:bg-[#0CDBFF]/80" 
                  : "bg-black/60 text-white border-white/20 hover:bg-black/80"
              }`}
            >
              {isLocalEditMode ? "Modo Vista" : "Calibrar Puntos"}
            </button>
          )}

          <button
            onClick={onClose}
            className="text-white bg-black/60 border border-white/20 px-4 py-2 rounded-lg hover:bg-black/80 transition-colors backdrop-blur-md text-sm font-semibold"
          >
            Cerrar
          </button>
        </div>

        {/* Prev Sidebar Arrow Button */}
        {hasMultipleMarkers && (
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, transform 0.2s',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.8)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.5)'}
          >
            ←
          </button>
        )}

        {/* Next Sidebar Arrow Button */}
        {hasMultipleMarkers && (
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, transform 0.2s',
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.8)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.5)'}
          >
            →
          </button>
        )}

        {/* Calibration Panel (visible only in edit mode) */}
        {isLocalEditMode && activeMarker && (
          <div 
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid rgba(12, 219, 255, 0.4)',
              backdropFilter: 'blur(8px)',
              padding: '12px 24px',
              borderRadius: '16px',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '320px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#0CDBFF', marginBottom: '4px', letterSpacing: '0.05em' }}>
              Calibración de Giro 360
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: '8px', lineHeight: '1.2' }}>
              Arrastra para alinear las flechas con la foto.
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '10px' }}>
              <input
                type="range"
                min="-180"
                max="180"
                value={Math.round(localOffsetDegrees)}
                onChange={handleSliderChange}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  accentColor: '#0CDBFF',
                }}
              />
              <span style={{ fontSize: '12px', fontWeight: 'bold', width: '45px', textAlign: 'right', fontFamily: 'monospace' }}>
                {Math.round(localOffsetDegrees)}°
              </span>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaved}
              style={{
                marginTop: '10px',
                backgroundColor: isSaved ? 'rgba(255,255,255,0.1)' : '#0CDBFF',
                color: isSaved ? 'rgba(255,255,255,0.4)' : 'black',
                border: 'none',
                padding: '5px 14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: isSaved ? 'default' : 'pointer',
                transition: 'background-color 0.2s',
              }}
            >
              {isSaved ? "Alineación Guardada" : "Guardar Alineación"}
            </button>
          </div>
        )}

        {/* 360 Viewer Container */}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default Photo360Modal;