import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';

const AreaVisual = ({ markers, areaCalculated }) => {
  // Crear los puntos para el contorno 2D, tomando solo X y Y
  const points = useMemo(() => {
    return markers.map(marker => new THREE.Vector3(marker.position[0], marker.position[1], marker.position[2])); // Usamos X, Y, Z
  }, [markers]);

  // Asegurarnos de que la línea sea cerrada (vuelve al primer punto)
  if (points.length > 1) {
    points.push(points[0]); // Conectar el último punto con el primero
  }

  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [points]);

  // Función para calcular el área de un polígono en 2D (algoritmo del shoelace)
  const calculateArea = (points) => {
    let area = 0;
    const n = points.length;

    for (let i = 0; i < n - 1; i++) {
      area += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    return area;
  };

  // Calcular el área delimitada por los puntos
  const area = useMemo(() => calculateArea(points), [points]);
  console.log('el area delimitada mide: ' + area);

  useEffect(() => {
    if (areaCalculated) {
      areaCalculated(area); // Llamamos a la función `areaCalculated` para pasar el área
    }
  }, [area, areaCalculated]);


  // Material de la línea (puedes cambiar el color o el grosor)
  const material = useMemo(() => new THREE.LineBasicMaterial({
    color: 0xff0000,     // Color rojo para contrastar con el verde
    linewidth: 100,        // Grosor de la línea
  }), []);

  return (
    <line geometry={geometry} material={material} />
  );
};

export default AreaVisual;

