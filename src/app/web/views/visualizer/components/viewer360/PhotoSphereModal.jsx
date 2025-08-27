import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

const Photo360Modal = ({ url, isOpen, onClose }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // ⚡️ Crear el viewer SOLO UNA VEZ
    viewerRef.current = new Viewer({
      container: containerRef.current,
      panorama:
        "https://myview-bucketdemo.s3.us-east-1.amazonaws.com/test360/Explanacion_lowres.jpg",
      loadingImg:
        "https://colombiarents.com/wp-content/uploads/2023/09/medellin-casas-vacaciones-8.jpg",
      navbar: ["zoom", "fullscreen"],
      useXmpData: false,
      webgl: {
        context: "webgl",
        preserveDrawingBuffer: false,
      },
    });
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999] transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative w-[90vw] h-[90vh] bg-black rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-white bg-black/60 px-3 py-1 rounded"
        >
          Cerrar
        </button>
        {/* Este div SIEMPRE está en el DOM */}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default Photo360Modal;
