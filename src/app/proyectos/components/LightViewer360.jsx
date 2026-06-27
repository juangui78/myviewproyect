'use client';
import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

const LightViewer360 = ({ url }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    // Destruir instancia anterior si existe
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    try {
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
    } catch (error) {
      console.error("Error al inicializar el visor 360 ligero:", error);
    }

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden border border-white/10 glass-card">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full pointer-events-none border border-white/10">
        🖱️ Arrastra para girar la vista 360°
      </div>
    </div>
  );
};

export default LightViewer360;
