import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function BoundingBoxGrid({ scene }) {
  const { box, size, center } = useMemo(() => {
    // Determine the precise unscaled local bounds of the native GLB rig
    const b = new THREE.Box3().setFromObject(scene);
    
    // Add 5% mathematical padding so lines don't tightly z-fight with skin geometry
    const padX = (b.max.x - b.min.x) * 0.05;
    const padY = (b.max.y - b.min.y) * 0.05;
    const padZ = (b.max.z - b.min.z) * 0.05;
    
    b.min.sub(new THREE.Vector3(padX, padY, padZ));
    b.max.add(new THREE.Vector3(padX, padY, padZ));

    const s = new THREE.Vector3();
    const c = new THREE.Vector3();
    b.getSize(s);
    b.getCenter(c);
    
    return { box: b, size: s, center: c };
  }, [scene]);

  const lineColor = "rgba(255, 255, 255, 0.4)";
  const textColor = "#ffffff";

  // Mathematically build grid planes crossing X, Y, Z axes
  const createGridLines = (divsWidth, divsHeight, planeType) => {
    const points = [];
    
    let w, h, sX, sY, depth;
    if (planeType === 'back') {
      w = size.x; h = size.y; sX = box.min.x; sY = box.min.y; depth = box.min.z;
    } else if (planeType === 'left') {
      w = size.z; h = size.y; sX = box.min.z; sY = box.min.y; depth = box.min.x;
    } else if (planeType === 'right') {
      w = size.z; h = size.y; sX = box.min.z; sY = box.min.y; depth = box.max.x;
    } else if (planeType === 'bottom') {
      w = size.x; h = size.z; sX = box.min.x; sY = box.min.z; depth = box.min.y;
    } else if (planeType === 'top') {
      w = size.x; h = size.z; sX = box.min.x; sY = box.min.z; depth = box.max.y;
    }

    const stepW = w / divsWidth;
    const stepH = h / divsHeight;

    for (let i = 0; i <= divsWidth; i++) {
        const cw = sX + i * stepW;
        if (planeType === 'back') {
            points.push(new THREE.Vector3(cw, sY, depth));
            points.push(new THREE.Vector3(cw, sY + h, depth));
        } else if (planeType === 'left' || planeType === 'right') {
            points.push(new THREE.Vector3(depth, sY, cw));
            points.push(new THREE.Vector3(depth, sY + h, cw));
        } else if (planeType === 'bottom' || planeType === 'top') {
            points.push(new THREE.Vector3(cw, depth, sY));
            points.push(new THREE.Vector3(cw, depth, sY + h));
        }
    }

    for (let i = 0; i <= divsHeight; i++) {
        const ch = sY + i * stepH;
        if (planeType === 'back') {
            points.push(new THREE.Vector3(sX, ch, depth));
            points.push(new THREE.Vector3(sX + w, ch, depth));
        } else if (planeType === 'left' || planeType === 'right') {
            points.push(new THREE.Vector3(depth, ch, sX));
            points.push(new THREE.Vector3(depth, ch, sX + w));
        } else if (planeType === 'bottom' || planeType === 'top') {
            points.push(new THREE.Vector3(sX, depth, ch));
            points.push(new THREE.Vector3(sX + w, depth, ch));
        }
    }

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  };

  const divsX = 4;
  const divsY = 8;
  const backGeo = useMemo(() => createGridLines(divsX, divsY, 'back'), [size]);
  const leftGeo = useMemo(() => createGridLines(divsX, divsY, 'left'), [size]);
  const rightGeo = useMemo(() => createGridLines(divsX, divsY, 'right'), [size]);
  const bottomGeo = useMemo(() => createGridLines(divsX, divsX, 'bottom'), [size]);
  const topGeo = useMemo(() => createGridLines(divsX, divsX, 'top'), [size]);

  // Generate generic Y markers
  const yTicks = [0, 500, 1000, 1500];
  const stepY = size.y / 3;

  return (
    <group>
      {/* Structural Cage Wireframes */}
      <lineSegments geometry={backGeo}>
        <lineBasicMaterial color={lineColor} transparent opacity={0.3} />
      </lineSegments>
      <lineSegments geometry={leftGeo}>
        <lineBasicMaterial color={lineColor} transparent opacity={0.3} />
      </lineSegments>
      <lineSegments geometry={rightGeo}>
        <lineBasicMaterial color={lineColor} transparent opacity={0.3} />
      </lineSegments>
      <lineSegments geometry={bottomGeo}>
        <lineBasicMaterial color={lineColor} transparent opacity={0.3} />
      </lineSegments>
      <lineSegments geometry={topGeo}>
        <lineBasicMaterial color={lineColor} transparent opacity={0.3} />
      </lineSegments>

      {/* Primary Axis Master Labels */}
      {/* Top Header Labels */}
      <Text position={[center.x, box.max.y + (size.y * 0.1), box.min.z]} fontSize={size.y * 0.03} color={textColor} fontWeight="800">X</Text>
      <Text position={[box.min.x - (size.x * 0.15), box.max.y, box.min.z]} fontSize={size.y * 0.03} color={textColor} fontWeight="800">Y</Text>
      <Text position={[box.max.x + (size.x * 0.15), box.max.y, box.min.z]} fontSize={size.y * 0.03} color={textColor} fontWeight="800">Y</Text>

      {/* Side Labels */}
      <Text position={[box.max.x, center.y, box.max.z + (size.z * 0.15)]} fontSize={size.y * 0.03} color={textColor} fontWeight="800" rotation={[0, Math.PI/2, 0]}>Z</Text>
      <Text position={[box.min.x, center.y, box.max.z + (size.z * 0.15)]} fontSize={size.y * 0.03} color={textColor} fontWeight="800" rotation={[0, -Math.PI/2, 0]}>Z</Text>

      {/* Bottom Labels */}
      <Text position={[center.x, box.min.y - (size.y * 0.05), box.min.z]} fontSize={size.y * 0.03} color={textColor} fontWeight="800">X</Text>
      <Text position={[box.max.x + (size.x * 0.1), box.min.y, box.min.z]} fontSize={size.y * 0.03} color={textColor} fontWeight="800">Y</Text>

      {/* Y Axis Height Markers Mapping */}
      {yTicks.map((val, i) => (
        <React.Fragment key={`ytick-${i}`}>
          {/* Left Wall Y Markers */}
          <Text position={[box.min.x - (size.x * 0.08), box.min.y + (stepY * i), box.min.z]} fontSize={size.y * 0.018} color={textColor}>{val}</Text>
          {/* Right Wall Y Markers */}
          <Text position={[box.max.x + (size.x * 0.08), box.min.y + (stepY * i), box.min.z]} fontSize={size.y * 0.018} color={textColor}>{val}</Text>
        </React.Fragment>
      ))}

      {/* X Axis Width Markers Mapping (Top edge of back wall) */}
      {[-400, -200, 0, 200, 400].map((val, i) => {
        const stepX = size.x / 4;
        return (
          <React.Fragment key={`xtick-${i}`}>
          <Text position={[box.min.x + (stepX * i), box.max.y + (size.y * 0.05), box.min.z]} fontSize={size.y * 0.015} color={textColor}>{val}</Text>
          <Text position={[box.min.x + (stepX * i), box.min.y - (size.y * 0.02), box.min.z]} fontSize={size.y * 0.015} color={textColor}>{val}</Text>
          </React.Fragment>
        );
      })}

    </group>
  );
}
