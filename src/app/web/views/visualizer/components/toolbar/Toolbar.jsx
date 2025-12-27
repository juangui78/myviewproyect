'use client'
import React, { useState } from 'react';
import { Button, Tooltip } from "@nextui-org/react";
import styles from './Toolbar.module.css';
import RulerIcon from "@/web/global_components/icons/RulerIcon.jsx";
import MoonIcon from '@/web/global_components/icons/MoonIcon.jsx';
import SunIcon from '@/web/global_components/icons/SunIcon.jsx';
import MapMarkerDistance from '@/web/global_components/icons/MapMarkerDistance';
import DeleteIcon from '@/web/global_components/icons/DeleteIcon';

const Toolbar = ({
  onToggleLight,
  onMeasureDistance,
  onMeasureArea,
  onSelectMode,
  onReset,
  lightMode,
  showTerrains
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
    </div>


  );
};

export default Toolbar;