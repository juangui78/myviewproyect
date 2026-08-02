'use client'
import React, { useState } from 'react';
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
  onToggleEditingMode
}) => {
  const [isMeasuringDistance, setIsMeasuringDistance] = useState(false);

  const handleMeasureDistanceClick = () => {
    setIsMeasuringDistance(!isMeasuringDistance); // Cambia el estado activo
    onMeasureDistance(); // Llama a la función proporcionada por el padre
  };

  return (

    <div className="flex h-10 gap-2 px-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg items-center transition-all hover:bg-black/70">
      <Tooltip content="Cambiar Iluminación" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <Button
          isIconOnly
          size="md"
          variant="light"
          aria-label="Iluminación"
          onClick={onToggleLight}
          className="text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8"
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
          className="text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8"
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
          className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 ${isWireframe ? 'bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}
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
          className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 ${isElevationMode ? 'bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.3)]' : ''}`}
        >
          <ElevationIcon className="w-5 h-5 drop-shadow-sm" />
        </Button>
      </Tooltip>

      <Tooltip content="Cambiar Vista" placement='bottom' className="text-black bg-white/90 backdrop-blur shadow-sm">
        <div>
          <Dropdown placement="bottom-end" className="bg-black/90 backdrop-blur-md border border-white/10 text-white rounded-xl shadow-xl">
            <DropdownTrigger>
              <Button
                isIconOnly
                size="md"
                variant="light"
                aria-label="Cambiar Vista"
                className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 ${currentView !== '3d' ? 'bg-[#0CDBFF] text-black hover:bg-[#0CDBFF]/80' : ''}`}
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
            className={`text-white hover:bg-white/20 rounded-full transition-colors h-8 w-8 ${isEditingMode ? 'bg-[#0CDBFF] text-black hover:bg-[#0CDBFF]/80' : ''}`}
          >
            <EditIcon className="w-5 h-5 drop-shadow-sm" />
          </Button>
        </Tooltip>
      )}
    </div>


  );
};

export default Toolbar;