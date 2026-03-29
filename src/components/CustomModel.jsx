import React, { useEffect, useMemo } from 'react';
import { useGLTF, Outlines } from '@react-three/drei';
import { createPortal } from '@react-three/fiber';
import * as THREE from 'three';

export function CustomModel({ onPointerDown, onPointerMove, onPointerOut, scale = 2.2, isTransparent = false }) {
  const { scene } = useGLTF('/new-rigg.glb');

  const meshes = useMemo(() => {
    const list = [];
    scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        list.push(child);
      }
    });
    return list;
  }, [scene]);

  useEffect(() => {
    meshes.forEach((child) => {
      child.material = new THREE.MeshStandardMaterial({
        color: '#9ca3af',
        roughness: 0.6,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: isTransparent,
        opacity: isTransparent ? 0.3 : 1
      });
      child.castShadow = !isTransparent;
      child.receiveShadow = !isTransparent;
    });
  }, [meshes, isTransparent]);

  return (
    <group
      position={[0, -scale * 0.8, 0]}
      scale={scale}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
    >
      <primitive object={scene} />
      {meshes.map((mesh) => 
        createPortal(<Outlines thickness={0.015} color="#56a432" opacity={1} />, mesh)
      )}
    </group>
  );
}

useGLTF.preload('/new-rigg.glb');
