"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Whatsapp from "./web/global_components/icons/Whatsapp";

export default function FloatingWhatsapp() {
  const [showBubble, setShowBubble] = useState(false);

  // Show a welcome tooltip after 2.5 seconds to capture attention without being aggressive
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const whatsappUrl =
    "https://wa.me/573054023539?text=" +
    encodeURIComponent(
      "Hola MyView, me gustaría recibir más información y una demostración de recorridos 3D para mi proyecto."
    );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-auto select-none">
      {/* Interactive Tooltip Bubble */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative bg-[#07121D]/95 backdrop-blur-xl border border-emerald-500/30 text-white px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center gap-3 max-w-xs"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Ayuda
              </span>
              <p className="text-xs text-white/90 mt-0.5 leading-snug">
                ¿Tienes dudas sobre cómo digitalizar tu proyecto en 3D?
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowBubble(false);
              }}
              className="text-white/40 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Cerrar mensaje"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Bubble Arrow Tail */}
            <div className="absolute -bottom-1.5 right-7 w-3 h-3 bg-[#07121D] border-r border-b border-emerald-500/30 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:shadow-[0_0_35px_rgba(37,211,102,0.8)] transition-all duration-300 border-2 border-white/20"
        aria-label="Contactar por WhatsApp"
      >
        {/* Pulsing ring indicator */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none"></span>

        <div className="w-8 h-8 flex items-center justify-center text-white">
          <Whatsapp />
        </div>
      </motion.a>
    </div>
  );
}
