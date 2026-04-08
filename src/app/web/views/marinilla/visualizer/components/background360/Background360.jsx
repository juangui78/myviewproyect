import React, { useEffect } from 'react';
import { TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';

const Background360 = ({ url }) => {
  const texture = useLoader(TextureLoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;

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