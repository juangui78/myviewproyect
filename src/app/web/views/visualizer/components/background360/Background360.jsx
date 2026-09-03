import React, { useEffect } from 'react';
import { TextureLoader } from 'three';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Background360 = ({ url, rotation = 0, rotationX = 0 }) => {
  const texture = useLoader(TextureLoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  useFrame((state) => {
    const scene = state.scene;
    if (scene) {
      if (!scene.backgroundRotation) {
        scene.backgroundRotation = new THREE.Euler();
      }
      if (!scene.environmentRotation) {
        scene.environmentRotation = new THREE.Euler();
      }
      scene.backgroundRotation.y = rotation;
      scene.backgroundRotation.x = rotationX;
      scene.environmentRotation.y = rotation;
      scene.environmentRotation.x = rotationX;
    }
  });

  const { scene } = useThree();

  useEffect(() => {
    // Cuando el componente se desmonta o cambia el URL, restablecer el fondo de la escena y liberar textura
    return () => {
      if (scene) {
        scene.background = null;
      }
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture, scene]);

  return <primitive attach="background" object={texture} />;
}

export default Background360;