'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import styles from './Toolbar.module.css';
import RulerIcon from "@/web/global_components/icons/RulerIcon.jsx";
import MoonIcon from '@/web/global_components/icons/MoonIcon.jsx';
import SunIcon from '@/web/global_components/icons/SunIcon.jsx';
import MapMarkerDistance from '@/web/global_components/icons/MapMarkerDistance';
import DeleteIcon from '@/web/global_components/icons/DeleteIcon';
import { WireframeIcon } from '@/web/global_components/icons/WireframeIcon';
import { ElevationIcon } from '@/web/global_components/icons/ElevationIcon';
import { EditIcon } from "@/web/global_components/icons/EditIcon";

const CameraIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const RotateIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
  </svg>
);

const GridIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </svg>
);

const Toolbar = ({
  onToggleLight,
  onMeasureDistance,
  onMeasureArea,
  onSelectMode,
  onReset,
  lightMode,
  showTerrains,
  isWireframe,
  onToggleWireframe,
  isElevationMode,
  onToggleElevation,
  currentView,
  onChangeView,
  canEdit,
  isEditingMode,
  onToggleEditingMode,
  isAutoRotate,
  onToggleAutoRotate,
  showBackground360 = true,
  onToggleBackground360,
  hasBackground360 = false
}) => {
  const toolbarRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = () => {
    if (!toolbarRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = toolbarRef.current;
    setShowLeftFade(scrollLeft > 4);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = toolbarRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
    }
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const getMaskStyle = () => {
    if (showLeftFade && showRightFade) {
      return {
        maskImage: 'linear-gradient(to right, transparent 0px, #000 16px, #000 calc(100% - 16px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0px, #000 16px, #000 calc(100% - 16px), transparent 100%)'
      };
    }
    if (showLeftFade) {
      return {
        maskImage: 'linear-gradient(to right, transparent 0px, #000 16px, #000 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0px, #000 16px, #000 100%)'
      };
    }
    if (showRightFade) {
      return {
        maskImage: 'linear-gradient(to right, #000 0px, #000 calc(100% - 16px), transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, #000 0px, #000 calc(100% - 16px), transparent 100%)'
      };
    }
    return {};
  };

  return (

    <div 
      ref={toolbarRef}
      style={getMaskStyle()}
      className="flex h-10 gap-1 sm:gap-2 px-2.5 sm:px-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg items-center transition-all hover:bg-black/70 max-w-[calc(100vw-115px)] sm:max-w-none overflow-x-auto overflow-y-hidden scrollbar-hide flex-nowrap shrink-0 sm:shrink touch-pan-x"
    >
      <Tooltip content="Cambiar Iluminación" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <Button
          isIconOnly
          size="md"
          variant="light"
          aria-label="Iluminación"
          onClick={onToggleLight}
          className="text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0"
        >
          {lightMode === 'sunset' ? <SunIcon className="w-5 h-5 drop-shadow-sm" /> : <MoonIcon className="w-5 h-5 drop-shadow-sm" />}
        </Button>
      </Tooltip>

      {/* <Tooltip content="Tomar Medidas" placement='bottom'>
        <Button
          isIconOnly
          variant="flat"
          aria-label="Medir distancia"
          onClick={handleMeasureDistanceClick}
          className={isMeasuringDistance ? styles.activeButton : ''} // Aplica una clase condicional
        >
          <MapMarkerDistance className="w-4 h-4" />
        </Button>
      </Tooltip>


      <Tooltip content="Reiniciar Marcadores" placement='bottom'>
        <Button isIconOnly variant="flat" aria-label="Reiniciar" onClick={onReset}>
          <DeleteIcon className="w-4 h-4" />
        </Button>
      </Tooltip> */}

      <Tooltip content="Ocultar/Mostrar marcadores" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <Button
          isIconOnly
          size="md"
          variant="light"
          aria-label="Modo selección"
          onClick={showTerrains}
          className="text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0"
        >
          <RulerIcon className="w-5 h-5 drop-shadow-sm" />
        </Button>
      </Tooltip>

      <Tooltip content="Modo Wireframe" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <Button
          isIconOnly
          size="md"
          variant="light"
          aria-label="Wireframe"
          onClick={onToggleWireframe}
          className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0 ${isWireframe ? 'bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}
        >
          <WireframeIcon className="w-5 h-5 drop-shadow-sm" />
        </Button>
      </Tooltip>

      <Tooltip content="Espectro de Altura" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <Button
          isIconOnly
          size="md"
          variant="light"
          aria-label="Elevación"
          onClick={onToggleElevation}
          className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0 ${isElevationMode ? 'bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}
        >
          <ElevationIcon className="w-5 h-5 drop-shadow-sm" />
        </Button>
      </Tooltip>

      <Tooltip content={isAutoRotate ? "Pausar Autorrotación" : "Iniciar Autorrotación 360°"} placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <Button
          isIconOnly
          size="md"
          variant="light"
          aria-label="Autorrotación"
          onClick={onToggleAutoRotate}
          className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0 ${isAutoRotate ? 'bg-[#0CDBFF] text-black hover:bg-[#0CDBFF]/80 shadow-[0_0_10px_rgba(12,219,255,0.4)]' : ''}`}
        >
          <RotateIcon className="w-5 h-5 drop-shadow-sm" />
        </Button>
      </Tooltip>

      <Tooltip content={showBackground360 ? "Ver Rejilla 3D de Fondo" : "Ver Fondo Estándar / 360°"} placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <Button
          isIconOnly
          size="md"
          variant="light"
          aria-label="Fondo Rejilla 3D"
          onClick={onToggleBackground360}
          className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0 ${!showBackground360 ? 'bg-[#0CDBFF] text-black hover:bg-[#0CDBFF]/80 shadow-[0_0_10px_rgba(12,219,255,0.4)]' : ''}`}
        >
          <GridIcon className="w-5 h-5 drop-shadow-sm" />
        </Button>
      </Tooltip>

      <Tooltip content="Cambiar Vista" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <div className="shrink-0">
          <Dropdown placement="bottom-end" className="bg-black/90 backdrop-blur-md border border-white/10 text-white rounded-xl shadow-xl">
            <DropdownTrigger>
              <Button
                isIconOnly
                size="md"
                variant="light"
                aria-label="Cambiar Vista"
                className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0 ${currentView !== '3d' ? 'bg-[#0CDBFF] text-black hover:bg-[#0CDBFF]/80' : ''}`}
              >
                <CameraIcon className="w-5 h-5 drop-shadow-sm" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Opciones de Vista"
              variant="flat"
              onAction={(key) => onChangeView(key)}
              className="p-1.5"
            >
              <DropdownItem key="3d" className={`text-white hover:bg-white/15 rounded-lg text-xs ${currentView === '3d' ? 'bg-white/10 text-[#0CDBFF]' : ''}`}>
                🌐 Vista 3D Orbital
              </DropdownItem>
              <DropdownItem key="plant" className={`text-white hover:bg-white/15 rounded-lg text-xs ${currentView === 'plant' ? 'bg-white/10 text-[#0CDBFF]' : ''}`}>
                🔲 Vista de Planta (2D)
              </DropdownItem>
              <DropdownItem key="isometric" className={`text-white hover:bg-white/15 rounded-lg text-xs ${currentView === 'isometric' ? 'bg-white/10 text-[#0CDBFF]' : ''}`}>
                📐 Vista Isométrica
              </DropdownItem>
              <DropdownItem key="free" className={`text-white hover:bg-white/15 rounded-lg text-xs ${currentView === 'free' ? 'bg-white/10 text-[#0CDBFF]' : ''}`}>
                🎮 Vista Libre
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </Tooltip>

      {canEdit && (
        <Tooltip content="Gestionar Marcadores" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
          <Button
            isIconOnly
            size="md"
            variant="light"
            aria-label="Gestionar Marcadores"
            onClick={onToggleEditingMode}
            className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 shrink-0 ${isEditingMode ? 'bg-[#0CDBFF] text-black hover:bg-[#0CDBFF]/80' : ''}`}
          >
            <EditIcon className="w-5 h-5 drop-shadow-sm" />
          </Button>
        </Tooltip>
      )}
    </div>


  );
};

export default React.memo(Toolbar);