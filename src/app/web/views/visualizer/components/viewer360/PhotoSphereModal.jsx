import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
// import "photo-sphere-viewer/dist/photo-sphere-viewer.css";

const Photo360Modal = ({ url, onClose }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // if (!url || !containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: "https://myview-bucketdemo.s3.us-east-1.amazonaws.com/test360/Explanaci%C3%B3n.jpg",
      loadingImg: "https://colombiarents.com/wp-content/uploads/2023/09/medellin-casas-vacaciones-8.jpg",
      navbar: ["zoom", "fullscreen"],
      touchmoveTwoFingers: true,
      
      // plugins: [] // Sin plugins
    });

    return () => {
      viewer.destroy();
    };
  }, [url]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[99999]">
      <div className="relative w-[90vw] h-[90vh] bg-black rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 text-white bg-black/60 px-3 py-1 rounded"
        >
          Cerrar
        </button>
        <img src={url} alt="debug" style={{ maxWidth: 200, maxHeight: 200, position: "absolute", top: 10, left: 10, zIndex: 10000 }} />
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

export default Photo360Modal;