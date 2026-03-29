import { Ruler } from 'lucide-react';
import React, { useMemo } from 'react';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';

export function MeasurementLine({ start, end, label, color = '#56a432', active = false, showLabel = true, onClick, labelScale = 1.0 }) {
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
                  className="measurement-tag"
                  style={{
                    color: active ? 'white' : 'black',
                    background: active ? 'var(--accent-primary)' : 'white',
                    padding: `${3 * labelScale}px`,
                    borderRadius: `${4 * labelScale}px`,
                    fontSize: `${7 * labelScale}px`, // tiny font
                    fontWeight: 'normal',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    border: 'none', // Removed border
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: `${4 * labelScale}px`
                  }}
                >
                  <Ruler size={8 * labelScale} />
                  {label ? label : `${(distance * 15).toFixed(1)} cm`}
                </div>
              </Html>
          )}
        </>
      )}
    </group>
  );
}
