"use client";
import { useEffect } from "react";
import {
  isStandalonePwa,
  warmupVisualizerAndOfflineShell,
  cleanupOrphanedOfflineFiles,
} from "./offlineStore";

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Solo activar el Service Worker cuando la app se abre desde el acceso directo instalado (standalone)
    if (!isStandalonePwa()) {
      return;
    }

    let isMounted = true;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });

        // Precalentar el shell del visor y limpiar archivos huérfanos en segundo plano
        if (isMounted && navigator.onLine) {
          setTimeout(() => {
            warmupVisualizerAndOfflineShell();
            cleanupOrphanedOfflineFiles();
          }, 2500);
        }
      } catch (err) {
        console.warn("SW registration skipped:", err);
      }
    };

    register();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
