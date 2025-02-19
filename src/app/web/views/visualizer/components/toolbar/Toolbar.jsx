'use client'
import React, { useState } from 'react';
import { Button, Tooltip } from "@nextui-org/react";
import styles from './Toolbar.module.css';
import RulerIcon from "@/web/global_components/icons/RulerIcon.jsx";
import MoonIcon  from '@/web/global_components/icons/MoonIcon.jsx';
import SunIcon from '@/web/global_components/icons/SunIcon.jsx';
import MapMarkerDistance from '@/web/global_components/icons/MapMarkerDistance';
import DeleteIcon from '@/web/global_components/icons/DeleteIcon';
import InformationCard from '../information/InformationCard.jsx';

const Toolbar = ({ 
  onToggleLight,
  onMeasureDistance,
  onMeasureArea,
  onSelectMode,
  onReset,
  lightMode
}) => {
  const [isMeasuringDistance, setIsMeasuringDistance] = useState(false);

  const handleMeasureDistanceClick = () => {
    setIsMeasuringDistance(!isMeasuringDistance); // Cambia el estado activo
    onMeasureDistance(); // Llama a la función proporcionada por el padre
  };

  return (
    
    <div className={styles.toolbarContainer}>

        
        <Tooltip content="Cambiar Iluminación" placement='bottom'>
            <Button isIconOnly variant="flat" aria-label="Iluminación" onClick={onToggleLight}>
                {lightMode === 'sunset' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </Button>
        </Tooltip>

      
      <Tooltip content="Tomar Medidas" placement='bottom'>
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
      </Tooltip>
      

      <Button isIconOnly variant="flat" aria-label="Modo selección" onClick={onSelectMode}>
        <RulerIcon className="w-4 h-4" />
      </Button>
      
      
    </div>

    
  );
};

export default Toolbar;