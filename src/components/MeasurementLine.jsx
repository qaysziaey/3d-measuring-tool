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
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshBasicMaterial color={active ? "#ffffff" : "#ef4444"} depthTest={false} transparent opacity={1} />
      </mesh>
      {end && (
        <>
          <mesh position={end}>
            <sphereGeometry args={[0.008, 16, 16]} />
            <meshBasicMaterial color={active ? "#ffffff" : "#ef4444"} depthTest={false} transparent opacity={1} />
          </mesh>
          <Line
            points={[start, end]}
            color={active ? '#ffffff' : color}
            lineWidth={1}
            transparent
            opacity={0.8}
            dashed={false}
          />
          {showLabel && (
              <Html position={midPoint} center distanceFactor={8} zIndexRange={[100, 0]}>
                <div 
                  className="measurement-tag glass-panel"
                  style={{
                    color: 'white',
                    background: active ? 'var(--accent-primary)' : 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '9px',
                    fontWeight: '700',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    border: active ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
