import { TextureLoader } from 'three';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from '@react-three/drei';

const Background360 = ({ url }) => {
  const texture = useLoader(TextureLoader, url);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return <primitive attach="background" object={texture} />;
}


export default Background360;