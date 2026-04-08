'use client'
import React, { useState } from 'react';
import { Button, Tooltip } from "@nextui-org/react";
import styles from './Toolbar.module.css';
import RulerIcon from "@/web/global_components/icons/RulerIcon.jsx";
import MoonIcon from '@/web/global_components/icons/MoonIcon.jsx';
import SunIcon from '@/web/global_components/icons/SunIcon.jsx';
import MapMarkerDistance from '@/web/global_components/icons/MapMarkerDistance';
import DeleteIcon from '@/web/global_components/icons/DeleteIcon';
import { WireframeIcon } from '@/web/global_components/icons/WireframeIcon';
import { ElevationIcon } from '@/web/global_components/icons/ElevationIcon';

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
  onToggleElevation
}) => {
  const [isMeasuringDistance, setIsMeasuringDistance] = useState(false);

  const handleMeasureDistanceClick = () => {
    setIsMeasuringDistance(!isMeasuringDistance); // Cambia el estado activo
    onMeasureDistance(); // Llama a la función proporcionada por el padre
  };

  return (

    <div className="flex h-10 gap-2 px-3 rounded-[16px] bg-[#252117]/90 backdrop-blur-md border border-[#3D3425] shadow-[0_4px_10px_rgba(139,94,60,0.15)] items-center transition-all hover:bg-[#1E1B14]/90">
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
    </div>


  );
};

export default Toolbar;