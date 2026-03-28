import React, { useMemo } from 'react';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export function MeasurementLine({ start, end, label, color = '#3b82f6', active = false, showLabel = true, onClick }) {
  const distance = useMemo(() => {
    if (!start || !end) return 0;
    const p1 = new THREE.Vector3(...start);
    const p2 = new THREE.Vector3(...end);
    return p1.distanceTo(p2);
  }, [start, end]);

  const midPoint = useMemo(() => {
    if (!start || !end) return [0,0,0];
    return [
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2,
      (start[2] + end[2]) / 2,
    ];
  }, [start, end]);

  if (!start) return null;

  return (
    <group 
      onPointerDown={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      <mesh position={start}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color={active ? '#ef4444' : color} depthTest={false} transparent opacity={0.8} />
      </mesh>
      {end && (
        <>
          <mesh position={end}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color={active ? '#ef4444' : color} depthTest={false} transparent opacity={0.8} />
          </mesh>
          <Line
            points={[start, end]}
            color={active ? '#ef4444' : color}
            lineWidth={6}
            dashed={false}
          />
          {showLabel && (
              <Html position={midPoint} center distanceFactor={4} zIndexRange={[100, 0]}>
                <div style={{
                  background: '#ffffff',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  color: '#000000',
                  fontSize: '9px',
                  fontWeight: '600',
                  pointerEvents: 'none',
                  transform: 'translate3d(0, -10px, 0)'
                }}>
                  {label ? label : `${(distance * 10).toFixed(1)} cm`}
                </div>
              </Html>
          )}
        </>
      )}
    </group>
  );
}
