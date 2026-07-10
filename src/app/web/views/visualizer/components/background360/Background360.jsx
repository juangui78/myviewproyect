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

  useEffect(() => {
    // Cuando el componente se desmonta o cambia el URL, el texture anterior debería liberarse
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  return <primitive attach="background" object={texture} />;
}

export default Background360;