import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

const Photo360Modal = ({ url, isOpen, onClose }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  // Crear el viewer una sola vez
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

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
    });

    // Cleanup al desmontar
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Actualizar el panorama cuando cambia la URL
  useEffect(() => {
    if (viewerRef.current && url && isOpen) {
      viewerRef.current.setPanorama(url, {
        zoom: 0,
        transition: false,
      }).catch(error => {
        console.error("Error al cargar panorama:", error);
      });
    }
  }, [url, isOpen]);

  console.log('vista actual: ', url);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose} // Cierra al hacer clic fuera
    >
      <div 
        className="relative w-[90vw] h-[90vh] bg-black rounded-lg"
        onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer clic dentro
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-white bg-black/60 px-3 py-1 rounded hover:bg-black/80 transition-colors"
        >
          Cerrar
        </button>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default Photo360Modal;