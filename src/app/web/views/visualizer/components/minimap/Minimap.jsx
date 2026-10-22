'use client';
import React, { useState, useMemo, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { getCameraWorldAzimuthDeg, normalizeDegrees } from '../../utils/northUtils';

/**
 * Normaliza y extrae las coordenadas 2D (plano X-Z de Three.js) desde los marcadores del terreno.
 */
function extractPoints2D(markers) {
  if (!Array.isArray(markers)) return [];
  return markers.map(marker => {
    if (Array.isArray(marker?.position)) {
      return { x: Number(marker.position[0]), z: Number(marker.position[2]) };
    }
    if (marker && typeof marker.x === 'number' && typeof marker.z === 'number') {
      return { x: Number(marker.x), z: Number(marker.z) };
    }
    if (Array.isArray(marker) && marker.length >= 3) {
      return { x: Number(marker[0]), z: Number(marker[2]) };
    }
    if (marker?.position && typeof marker.position.x === 'number') {
      return { x: Number(marker.position.x), z: Number(marker.position.z) };
    }
    return { x: 0, z: 0 };
  });
}

/**
 * Colores de estado para el minimapa
 */
const STATUS_COLORS = {
  disponible: {
    fill: 'rgba(16, 185, 129, 0.35)',
    stroke: '#10B981',
    hoverFill: 'rgba(16, 185, 129, 0.7)',
    text: '#A7F3D0'
  },
  reservado: {
    fill: 'rgba(245, 158, 11, 0.35)',
    stroke: '#F59E0B',
    hoverFill: 'rgba(245, 158, 11, 0.7)',
    text: '#FDE68A'
  },
  vendido: {
    fill: 'rgba(156, 163, 175, 0.25)',
    stroke: '#9CA3AF',
    hoverFill: 'rgba(156, 163, 175, 0.55)',
    text: '#E5E7EB'
  }
};

/**
 * MinimapSync: corre dentro de <Canvas> vía useFrame.
 * Actualiza la posición y orientación del radar directamente en el elemento SVG ref sin re-renders.
 */
export function MinimapSync({ radarRef, bounds }) {
  const { camera, controls } = useThree();
  const lastState = useRef({ x: null, y: null, angle: null });

  useFrame(() => {
    if (!radarRef?.current || !bounds) return;

    const { centerX, centerZ, scale } = bounds;
    if (!scale || scale <= 0) return;

    // El puntero sigue el foco de la cámara (controls.target) en modo orbital para que al rotar la cámara
    // el puntero permanezca fijo en su sitio y solo gire el cono; en vista libre sigue camera.position
    const useTarget = controls && controls.enabled !== false && controls.target;
    const trackX = useTarget ? controls.target.x : camera.position.x;
    const trackZ = useTarget ? controls.target.z : camera.position.z;

    // Proyección 2D consistente con Three.js (X hacia la derecha, -Z hacia arriba en el SVG)
    const rawSvgX = 100 + (trackX - centerX) * scale;
    const rawSvgY = 100 + (trackZ - centerZ) * scale;
    const svgX = Math.max(8, Math.min(192, rawSvgX));
    const svgY = Math.max(8, Math.min(192, rawSvgY));

    // Rumbo azimutal en el espacio del mundo (0° = -Z arriba, 90° = +X derecha, 180° = +Z abajo, 270° = -X izquierda)
    const angleDeg = getCameraWorldAzimuthDeg(camera);

    // Comprobar cambio mínimo para evitar trabajo innecesario
    const prev = lastState.current;
    const angleDelta = prev.angle === null
      ? Infinity
      : Math.abs(((angleDeg - prev.angle) % 360 + 540) % 360 - 180);

    if (
      prev.x === null ||
      Math.abs(svgX - prev.x) > 0.2 ||
      Math.abs(svgY - prev.y) > 0.2 ||
      angleDelta > 0.25
    ) {
      lastState.current = { x: svgX, y: svgY, angle: angleDeg };
      radarRef.current.setAttribute(
        'transform',
        `translate(${svgX.toFixed(1)}, ${svgY.toFixed(1)}) rotate(${angleDeg.toFixed(1)})`
      );
    }
  });

  return null;
}

/**
 * Minimap: Componente HUD 2D interactivo flotante en pantalla
 */
export default function Minimap({
  terrains = [],
  bounds,
  radarRef,
  onTeleport,
  onResetView,
  northOffset = 0,
  isModelLoaded = true,
  projectName = '',
  className = 'relative mb-1.5'
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(navigator.userAgent);
      return !isMobile;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(navigator.userAgent);
      if (isMobile) {
        setIsExpanded(false);
      }
    }
  }, []);
  const [hoveredTerrain, setHoveredTerrain] = useState(null);
  const svgRef = useRef(null);

  // Procesar polígonos de terrenos a coordenadas SVG
  const processedTerrains = useMemo(() => {
    if (!bounds || !bounds.scale) return [];

    const { centerX, centerZ, scale } = bounds;

    return terrains.map((t, idx) => {
      const rawPoints = extractPoints2D(t.markers || []);
      if (rawPoints.length < 3) return null;

      const svgPoints = rawPoints.map(p => {
        const sx = 100 + (p.x - centerX) * scale;
        const sy = 100 + (p.z - centerZ) * scale;
        return `${sx.toFixed(1)},${sy.toFixed(1)}`;
      }).join(' ');

      // Calcular centroide para clic directo
      const cX = rawPoints.reduce((acc, p) => acc + p.x, 0) / rawPoints.length;
      const cZ = rawPoints.reduce((acc, p) => acc + p.z, 0) / rawPoints.length;

      return {
        id: t.id || idx + 1,
        name: t.name || `Lote ${t.id || idx + 1}`,
        status: (t.status || 'disponible').toLowerCase(),
        svgPoints,
        area: t.areaCalculated,
        worldX: cX,
        worldZ: cZ
      };
    }).filter(Boolean);
  }, [terrains, bounds]);

  // Manejar clic en el lienzo SVG para teletransportarse
  const handleSvgClick = (e) => {
    if (!svgRef.current || !bounds || !onTeleport) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 200;
    const svgY = ((e.clientY - rect.top) / rect.height) * 200;

    // Convertir de SVG a coordenadas Three.js en el mundo (X, Z)
    const { centerX, centerZ, scale } = bounds;
    const targetX = centerX + (svgX - 100) / scale;
    const targetZ = centerZ + (svgY - 100) / scale;

    onTeleport(targetX, targetZ);
  };

  if (!isModelLoaded) return null;

  return (
    <div className={`pointer-events-auto select-none font-sans z-[50] ${className}`}>
      {!isExpanded ? (
        // Botón Colapsado
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-xl transition-all hover:scale-105 active:scale-95 hover:border-[#0CDBFF] group"
          title="Abrir Minimapa 2D"
        >
          <span className="w-2 h-2 rounded-full bg-[#0CDBFF] animate-pulse" />
          <span>🗺️ Minimapa 2D</span>
          {processedTerrains.length > 0 && (
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-white/70">
              {processedTerrains.length}
            </span>
          )}
        </button>
      ) : (
        // Panel Expandido del Minimapa
        <div className="flex flex-col bg-black/80 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 shadow-2xl w-[210px] transition-all animate-in fade-in duration-200">
          {/* Header del Minimapa */}
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-white">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1.5 hover:opacity-75 transition-opacity cursor-pointer group"
              title="Minimizar"
            >
              <span className="text-xs">🗺️</span>
              <span className="text-[11px] font-bold tracking-wide text-white group-hover:text-[#0CDBFF] transition-colors">MINIMAPA 2D</span>
            </button>
            <div className="flex items-center gap-1">
              {onResetView && (
                <button
                  type="button"
                  onClick={onResetView}
                  className="p-1 rounded-md text-white/60 hover:text-[#0CDBFF] hover:bg-white/10 transition-colors"
                  title="Restablecer Vista"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Minimizar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          {/* Lienzo Interactivo SVG */}
          <div className="relative mt-2 rounded-xl overflow-hidden bg-slate-950/80 border border-white/10 cursor-crosshair group aspect-square">
            <svg
              ref={svgRef}
              viewBox="0 0 200 200"
              onClick={handleSvgClick}
              className="w-full h-full block"
            >
              {/* Cuadrícula arquitectónica de fondo */}
              <defs>
                <pattern id="minimap-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="200" height="200" fill="url(#minimap-grid)" />

              {/* Ejes centrales referenciales */}
              <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" strokeWidth="0.6" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" strokeWidth="0.6" />

              {/* Si no hay lotes: dibujar huella real y perímetro exacto del modelo 3D */}
              {processedTerrains.length === 0 && bounds && (() => {
                const { centerX = 0, centerZ = 0, width = 100, depth = 100, scale = 1, footprint = [] } = bounds;
                const boxW = Math.min(Math.max(width * scale, 16), 184);
                const boxH = Math.min(Math.max(depth * scale, 16), 184);
                const boxX = 100 - boxW / 2;
                const boxY = 100 - boxH / 2;

                const footprintPoints = Array.isArray(footprint) && footprint.length >= 3
                  ? footprint.map(pt => {
                      const sx = 100 + (pt.x - centerX) * scale;
                      const sy = 100 + (pt.z - centerZ) * scale;
                      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
                    }).join(' ')
                  : null;

                return (
                  <g>
                    <rect
                      x={boxX.toFixed(1)}
                      y={boxY.toFixed(1)}
                      width={boxW.toFixed(1)}
                      height={boxH.toFixed(1)}
                      rx="4"
                      fill="rgba(12, 219, 255, 0.03)"
                      stroke="rgba(12, 219, 255, 0.45)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    {footprintPoints && (
                      <polygon
                        points={footprintPoints}
                        fill="rgba(12, 219, 255, 0.14)"
                        stroke="#0CDBFF"
                        strokeWidth="1.2"
                      />
                    )}
                    <text
                      x="100"
                      y="103"
                      textAnchor="middle"
                      fill="rgba(255, 255, 255, 0.55)"
                      fontSize="6.5"
                      fontFamily="sans-serif"
                    >
                      Planta General del Proyecto
                    </text>
                  </g>
                );
              })()}

              {/* Polígonos de Terrenos/Lotes */}
              {processedTerrains.map(t => {
                const style = STATUS_COLORS[t.status] || STATUS_COLORS.disponible;
                const isHovered = hoveredTerrain?.id === t.id;

                return (
                  <polygon
                    key={t.id}
                    points={t.svgPoints}
                    fill={isHovered ? style.hoverFill : style.fill}
                    stroke={style.stroke}
                    strokeWidth={isHovered ? 1.5 : 0.8}
                    className="transition-all duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredTerrain(t)}
                    onMouseLeave={() => setHoveredTerrain(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTeleport(t.worldX, t.worldZ);
                    }}
                  />
                );
              })}

              {/* Indicador de Norte sincronizado en la esquina superior derecha (Opción A: Rosa de los vientos dinámica) */}
              <g
                transform={`translate(182, 18) rotate(${normalizeDegrees(northOffset)})`}
                onClick={(e) => {
                  if (onResetView) {
                    e.stopPropagation();
                    onResetView();
                  }
                }}
                className="cursor-pointer"
              >
                <title>{`Norte (${Math.round(normalizeDegrees(northOffset))}°) — Clic para orientar al Norte`}</title>
                <circle cx="0" cy="0" r="7" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
                <path d="M 0 -5 L -2 1 L 0 0 L 2 1 Z" fill="#0CDBFF" />
                <path d="M 0 5 L -2 -1 L 0 0 L 2 -1 Z" fill="#64748B" />
                <text x="0" y="-7.5" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="bold">N</text>
              </g>

              {/* Radar: Marcador de Cámara y Cono de Visión ("Tú Estás Aquí") */}
              <g ref={radarRef} transform="translate(100, 100) rotate(0)">
                {/* Cono de Visión (Abanico de 60°) */}
                <polygon
                  points="0,0 -22,-44 22,-44"
                  fill="rgba(12, 219, 255, 0.28)"
                  stroke="#0CDBFF"
                  strokeWidth="0.8"
                  strokeOpacity="0.8"
                />
                {/* Ondas tipo radar */}
                <circle cx="0" cy="0" r="7" fill="none" stroke="#0CDBFF" strokeWidth="0.8" opacity="0.4" />
                {/* Punto luminoso central */}
                <circle cx="0" cy="0" r="3.5" fill="#0CDBFF" stroke="#FFFFFF" strokeWidth="1.2" />
              </g>
            </svg>

            {/* Tooltip flotante al pasar el mouse por un lote */}
            {hoveredTerrain && (
              <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/90 backdrop-blur border border-white/20 text-[9px] text-white shadow-md pointer-events-none">
                <span className="font-bold text-[#0CDBFF]">{hoveredTerrain.name}</span>
                {hoveredTerrain.area ? <span className="text-white/70 ml-1">({hoveredTerrain.area} m²)</span> : null}
              </div>
            )}
          </div>

          {/* Footer del minimapa: leyenda interactiva rápida */}
          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-[9px] text-white/60">
            <span className="hover:text-white">Clic para teletransportarte</span>
            <span className="text-[#0CDBFF] font-medium">
              {processedTerrains.length > 0 ? `${processedTerrains.length} Lotes` : 'Vista 3D'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
