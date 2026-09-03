"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function MarketingShareMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      {/* Background Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 blur-2xl rounded-3xl opacity-75"></div>

      {/* Main Glassmorphic Share Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="relative bg-[#07121D]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-2xl overflow-hidden flex flex-col gap-3"
      >
        {/* Mockup Header: Share Simulator (WhatsApp / Web) */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Enlace Compartido</p>
              <p className="text-[10px] font-mono text-emerald-400">myview.com/proyectos/valle-real</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-[#0CDBFF] border border-cyan-500/30">
            WebGL 60 FPS
          </span>
        </div>

        {/* 3D Visualizer Preview Box */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 group">
          <Image
            src="/images/real_estate_3d_twin.png"
            alt="Marketing 3D Interactivo"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02121B]/90 via-transparent to-black/30" />

          {/* Floating Action Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-[#0CDBFF] text-black shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
            Visor 3D en Vivo
          </div>

          {/* Bottom Callout */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
            <div>
              <p className="text-xs font-bold leading-tight drop-shadow">Reserva Campestre</p>
              <p className="text-[10px] text-white/70 font-mono">Lotes 100% interactivos</p>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/20 text-white">
              Explorar →
            </span>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-[#02121B]/90 p-2 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-white/50 font-mono uppercase">Carga</p>
            <p className="text-xs font-extrabold text-[#0CDBFF] font-mono mt-0.5">1.2 seg</p>
          </div>
          <div className="bg-[#02121B]/90 p-2 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-white/50 font-mono uppercase">Conversión</p>
            <p className="text-xs font-extrabold text-emerald-400 font-mono mt-0.5">+300%</p>
          </div>
          <div className="bg-[#02121B]/90 p-2 rounded-xl border border-white/5 text-center">
            <p className="text-[10px] text-white/50 font-mono uppercase">Compatibilidad</p>
            <p className="text-xs font-extrabold text-white font-mono mt-0.5">Móvil & PC</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
