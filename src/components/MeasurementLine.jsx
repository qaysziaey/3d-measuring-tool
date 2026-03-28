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
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={0.9} />
      </mesh>
      {end && (
        <>
          <mesh position={end}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={0.9} />
          </mesh>
          <Line
            points={[start, end]}
            color={active ? '#ef4444' : color}
            lineWidth={2.5}
            dashed={false}
          />
          {showLabel && (
              <Html position={midPoint} center distanceFactor={8} zIndexRange={[100, 0]}>
                <div style={{
                  background: '#ffffff',
                  padding: '1px 2px',
                  borderRadius: '2px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  color: '#000000',
                  fontSize: '7px',
                  fontWeight: '600',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
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
