"use client";
import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";

export default function BeforeAfterTimeline() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Interactive Before/After Split Viewer */}
      <div
        ref={containerRef}
        className="relative aspect-video w-full rounded-2xl overflow-hidden glass-card glow-card-hover border border-white/10 select-none cursor-ew-resize group shadow-2xl bg-[#02121B]"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Background Image: Despues - Modelo 3D */}
        <div className="absolute inset-0">
          <Image
            src="/images/Despues-landing.jpg"
            alt="Después: Modelo 3D del Proyecto"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
            priority
          />
          <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#02121B]/80 text-[#0CDBFF] border border-[#0CDBFF]/40 backdrop-blur-md shadow-lg">
            Después · Modelo 3D
          </div>
        </div>

        {/* Foreground Clipped Image: Antes - Terreno Inicial */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <Image
            src="/images/Antes-landing.jpg"
            alt="Antes: Terreno y Estado Inicial"
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
            priority
          />
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#02121B]/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md shadow-lg">
            Antes · Estado Inicial
          </div>
        </div>

        {/* Draggable Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 w-0.5 bg-gradient-to-b from-[#0CDBFF] via-white to-[#0CDBFF] shadow-[0_0_12px_#0CDBFF]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#02121B] border-2 border-[#0CDBFF] shadow-[0_0_15px_rgba(12,219,255,0.8)] flex items-center justify-center text-white text-xs font-mono font-extrabold group-hover:scale-110 transition-transform">
            <svg className="w-4 h-4 text-[#0CDBFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
            </svg>
          </div>
        </div>

        {/* Subtle bottom cue */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-3 py-0.5 rounded-full text-[10px] font-mono text-white/70 bg-black/60 backdrop-blur-sm pointer-events-none">
          Desliza para comparar la evolución temporal
        </div>
      </div>

      {/* Quick Timeline Selector Buttons */}
      <div className="flex items-center justify-between gap-2 bg-[#02121B]/80 border border-white/5 p-1.5 rounded-xl text-xs font-mono">
        <button
          onClick={() => setSliderPosition(10)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
            sliderPosition < 30 ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30" : "text-white/60 hover:text-white"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Antes (Inicial)
        </button>
        <button
          onClick={() => setSliderPosition(50)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
            sliderPosition >= 30 && sliderPosition <= 70 ? "bg-white/15 text-white font-bold border border-white/20" : "text-white/60 hover:text-white"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
          Comparativa 50/50
        </button>
        <button
          onClick={() => setSliderPosition(90)}
          className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all flex items-center justify-center gap-1.5 ${
            sliderPosition > 70 ? "bg-cyan-500/20 text-[#0CDBFF] font-bold border border-cyan-500/30" : "text-white/60 hover:text-white"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#0CDBFF]"></span>
          Después (Modelo 3D)
        </button>
      </div>
    </div>
  );
}
