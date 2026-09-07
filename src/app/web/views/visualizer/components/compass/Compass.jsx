"use client";

import React, { useMemo, useRef, forwardRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Compass Component (Cinta Horizontal / HUD Ribbon):
 * Brújula horizontal ultra-optimizada ubicada debajo del toolbar.
 * Muestra el rumbo azimutal actual de la cámara en tiempo real con
 * marcas cardinales (N en rojo, S, O) y un ícono solar dorado en el Este (☀️ Salida del sol).
 * Cero re-renders de React; se anima por hardware CSS transform en el DOM.
 */
export const Compass = React.memo(forwardRef(function Compass({ onResetNorth, className = "" }, ref) {
  // Configuración de cinta: 360 grados = 288px (0.8px por grado)
  const pxPerDeg = 0.8;
  const cycleWidth = 360 * pxPerDeg; // 288px

  // Generar marcas para un ciclo de 360 grados
  const renderCycle = (baseX, cycleKey) => {
    const ticks = [];

    // Marcas intermedias cada 15° y 30°
    for (let deg = 0; deg < 360; deg += 15) {
      if (deg % 90 === 0) continue; // Los cardinales tienen su propio render
      const x = baseX + deg * pxPerDeg;
      const isMajor = deg % 30 === 0;
      ticks.push(
        <line
          key={`${cycleKey}-tick-${deg}`}
          x1={x}
          y1={isMajor ? 18 : 20}
          x2={x}
          y2={isMajor ? 26 : 24}
          stroke={isMajor ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.2)"}
          strokeWidth={isMajor ? 1.2 : 0.8}
          strokeLinecap="round"
        />
      );
    }

    return (
      <g key={cycleKey}>
        {ticks}

        {/* 0° / 360° : NORTE (N en Rojo carmesí) */}
        <text
          x={baseX}
          y={20}
          textAnchor="middle"
          fill="#EF4444"
          fontSize="10"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          className="select-none"
        >
          N
        </text>
        <circle cx={baseX} cy={25} r={1.2} fill="#EF4444" />

        {/* 90° : ESTE / SALIDA DEL SOL (☀️) */}
        <g transform={`translate(${baseX + 90 * pxPerDeg}, 15)`}>
          {/* Halo suave solar */}
          <circle cx="0" cy="0" r="4.2" fill="rgba(245, 158, 11, 0.3)" />
          {/* Rayos del sol */}
          <line x1="0" y1="-5" x2="0" y2="-3.6" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="0" y1="3.6" x2="0" y2="5" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-5" y1="0" x2="-3.6" y2="0" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="3.6" y1="0" x2="5" y2="0" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-3.4" y1="-3.4" x2="-2.4" y2="-2.4" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
          <line x1="2.4" y1="2.4" x2="3.4" y2="3.4" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
          <line x1="2.4" y1="-2.4" x2="3.4" y2="-3.4" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
          <line x1="-3.4" y1="3.4" x2="-2.4" y2="2.4" stroke="#FBBF24" strokeWidth="1" strokeLinecap="round" />
          {/* Núcleo dorado del sol */}
          <circle cx="0" cy="0" r="2.5" fill="url(#sunGlowHUD)" />
        </g>
        <text
          x={baseX + 90 * pxPerDeg}
          y={27}
          textAnchor="middle"
          fill="#FBBF24"
          fontSize="6"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="select-none"
        >
          E
        </text>

        {/* 180° : SUR (S) */}
        <text
          x={baseX + 180 * pxPerDeg}
          y={20}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.65)"
          fontSize="9"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="select-none"
        >
          S
        </text>
        <circle cx={baseX + 180 * pxPerDeg} cy={25} r={1} fill="rgba(255, 255, 255, 0.4)" />

        {/* 270° : OESTE (O) */}
        <text
          x={baseX + 270 * pxPerDeg}
          y={20}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.65)"
          fontSize="9"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="select-none"
        >
          O
        </text>
        <circle cx={baseX + 270 * pxPerDeg} cy={25} r={1} fill="rgba(255, 255, 255, 0.4)" />
      </g>
    );
  };

  return (
    <button
      type="button"
      onClick={onResetNorth}
      title="Orientar al Norte | ☀️ Salida del sol por el Este (Clic para reiniciar vista)"
      aria-label="Brújula de orientación horizontal"
      className={`relative w-[210px] sm:w-[250px] h-[30px] rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/20 hover:border-[#0CDBFF]/60 shadow-lg hover:shadow-[0_0_15px_rgba(12,219,255,0.25)] flex items-center justify-center cursor-pointer select-none transition-all duration-200 active:scale-98 group overflow-hidden ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 18%, black 82%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 18%, black 82%, transparent)',
      }}
    >
      {/* Indicador central superior (cursor rojo que señala el rumbo actual) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-t-[5px] border-t-[#EF4444] z-20 pointer-events-none drop-shadow-[0_0_4px_rgba(239,68,68,0.9)]" />

      {/* Línea sutil de referencia central */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-red-500/20 z-10 pointer-events-none" />

      {/* Cinta horizontal deslizable conectada a la referencia DOM */}
      <div
        ref={ref}
        className="absolute top-0 bottom-0 h-full flex items-center pointer-events-none"
        style={{
          left: '50%',
          width: `${cycleWidth * 3}px`,
          transform: `translateX(-${cycleWidth}px)`, // Posición inicial mirando al Norte
          willChange: 'transform',
        }}
      >
        <svg
          viewBox={`0 0 ${cycleWidth * 3} 30`}
          width={cycleWidth * 3}
          height="30"
          className="w-full h-full"
        >
          <defs>
            <radialGradient id="sunGlowHUD" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="40%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>

          {/* 3 ciclos para scroll horizontal infinito sin saltos visuales */}
          {renderCycle(0, 'c0')}
          {renderCycle(cycleWidth, 'c1')}
          {renderCycle(cycleWidth * 2, 'c2')}
        </svg>
      </div>
    </button>
  );
}));

Compass.displayName = "Compass";

/**
 * Sincronizador de brújula horizontal para React Three Fiber (<Canvas>)
 * Lee el rumbo de la cámara en cada frame mediante useFrame y traslada
 * la cinta horizontalmente en el DOM sin provocar re-renders en React.
 */
export function CompassSync({ compassRef }) {
  const { camera } = useThree();
  const lastXRef = useRef(null);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const cycleWidth = 360 * 0.8; // 288px

  useFrame(() => {
    if (!compassRef?.current) return;
    camera.getWorldDirection(forward);

    const horizLen = Math.hypot(forward.x, forward.z);
    let deg = 0;
    if (horizLen > 0.0001) {
      // Ángulo azimutal en grados
      const angleRad = Math.atan2(forward.x, -forward.z);
      deg = (angleRad * 180) / Math.PI;
    } else {
      deg = (Math.atan2(camera.up.x, -camera.up.z) * 180) / Math.PI;
    }

    // Normalizar a rango [0, 360)
    const degNorm = ((deg % 360) + 360) % 360;

    // Posición centrada en el segundo ciclo (c1)
    const xHeading = cycleWidth + degNorm * 0.8;

    if (lastXRef.current === null || Math.abs(xHeading - lastXRef.current) > 0.1) {
      lastXRef.current = xHeading;
      compassRef.current.style.transform = `translateX(${-xHeading.toFixed(1)}px)`;
    }
  });

  return null;
}

export default Compass;
