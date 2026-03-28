import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function CustomModel({ onPointerDown, onPointerMove, onPointerOut, scale = 2.2 }) {
  // Leverages bleeding-edge GLTF mapping pulling internal animations, armatures, and rigged bones efficiently
  const { scene } = useGLTF('/RiggedBody.glb');

  // Traverse hierarchical internal sub-meshes mapping continuous SaaS Slate style identical to base geometry limits
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        // Intercept both fixed Meshes and Rigged SkinnedMeshes gracefully
        if (child.isMesh || child.isSkinnedMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#9ca3af',
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return (
    <primitive 
      object={scene} 
      position={[0, -scale * 0.8, 0]} 
      scale={scale} 
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
    />
  );
}

// Caches skeletal file locally ensuring instant swapping and preventing memory thrashing
useGLTF.preload('/RiggedBody.glb');
