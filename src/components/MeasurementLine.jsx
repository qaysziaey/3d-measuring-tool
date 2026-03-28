import React, { useMemo } from 'react';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export function MeasurementLine({ start, end, label, color = '#56a432', active = false, showLabel = true, onClick }) {
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
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={0.9} />
      </mesh>
      {end && (
        <>
          <mesh position={end}>
            <sphereGeometry args={[0.015, 16, 16]} />
            <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={0.9} />
          </mesh>
          <Line
            points={[start, end]}
            color={active ? '#ef4444' : color}
            lineWidth={1.5}
            dashed={false}
          />
          {showLabel && (
              <Html position={midPoint} center distanceFactor={8} zIndexRange={[100, 0]}>
                <div 
                  className="measurement-tag shadow-glow"
                  style={{
                    color: 'white',
                    background: '#56a432',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '7px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    opacity: 0.9
                  }}
                >
                  {label ? label : `${(distance * 15).toFixed(1)} cm`}
                </div>
              </Html>
          )}
        </>
      )}
    </group>
  );
}
