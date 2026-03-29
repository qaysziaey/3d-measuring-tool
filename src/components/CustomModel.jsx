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

  // Auto-lift: measure the GLB's bounding box in its own local space (scale=1),
  // then offset Y so the model's lowest point sits exactly at y=0.
  const yOffset = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    // box.min.y is the foot level in the GLB's local (unscaled) space.
    // Negate so the group position pushes feet up to world y=0.
    return -box.min.y;
  }, [scene]);

  return (
    <group
      // yOffset is in local units; multiply by scale to convert to world units.
      position={[0, yOffset * scale, 0]}
      scale={scale}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
    >
      <primitive object={scene} />
      {meshes.map((mesh) => 
        createPortal(
          <Outlines thickness={0.0025} color={isTransparent ? "#4b5563" : "#ffd700"} opacity={1} angle={Math.PI} />, 
          mesh
        )
      )}
    </group>
  );
}

useGLTF.preload('/new-rigg.glb');
