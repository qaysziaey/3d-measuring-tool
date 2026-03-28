import { useThree, Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Line, Html, useGLTF } from '@react-three/drei';
import { CustomModel } from './CustomModel';
import { MeasurementLine } from './MeasurementLine';
import React, { Suspense, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

// Generates a responsive bounding Ring perfectly sized over hovering slices
function ContourRing({ center, radius, label, color = "#14b8a6", showLabel = true, unit = 'cm' }) {
  if (!center) return null;

  const formatLabel = (val) => {
    const v = parseFloat(val);
    return unit === 'mm' ? (v * 10).toFixed(0) : v.toFixed(1);
  };

  const segments = 64;
  const points = [];
  const r = radius + 0.05; 
  
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push([
      center.x + r * Math.cos(theta),
      center.y,
      center.z + r * Math.sin(theta)
    ]);
  }

  const exactCircumference = Math.PI * 2 * radius;

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={3}
        dashed={false}
        transparent
        opacity={0.8}
      />
      
      {showLabel && (
          <Html position={[center.x + r, center.y, center.z]} center distanceFactor={4} zIndexRange={[100, 0]}>
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
              transform: 'translate3d(10px, 0, 0)',
              whiteSpace: 'nowrap'
            }}>
              {label ? label : `Curve: ${formatLabel(exactCircumference * 15)} ${unit}`}
            </div>
          </Html>
      )}
    </group>
  );
}

function CursorFollower({ tempPoint }) {
  if (!tempPoint) return null;
  return (
    <mesh position={tempPoint}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={0.8} />
    </mesh>
  );
}

function CameraUpdate({ zoom }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, zoom * 0.2, zoom);
    camera.lookAt(0, 0, 0);
  }, [zoom, camera]);
  return null;
}

export function CanvasContainer({ 
  measurements, 
  activeMeasurement, 
  tempPoint, 
  onPointClick,
  onCurveCapture,
  isCameraLocked,
  showLabels,
  modelScale,
  zoom,
  unit = 'cm',
  cameraTargetY = 0
}) {
  const [hoverData, setHoverData] = useState(null);

  const format3DLabel = (cmVal) => {
    if (!cmVal) return '';
    const v = parseFloat(cmVal);
    return unit === 'mm' ? `${(v * 10).toFixed(0)} mm` : `${v.toFixed(1)} cm`;
  };
  
  // Robust skeletal extraction traversing the entire GLTF tree for deep rig architectures
  const { scene, nodes } = useGLTF('/RiggedBody.glb');
  const skeletonBones = useMemo(() => {
    const bones = [];
    scene.traverse(node => {
      if (node.isBone) bones.push(node);
    });
    return bones.length > 0 ? bones : Object.values(nodes).filter(n => n.type === 'Bone' || n.isBone);
  }, [scene, nodes]);
  
  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (!activeMeasurement) return;

    if (activeMeasurement.type === 'circumference' && hoverData) {
      onCurveCapture(hoverData.center, hoverData.radius);
    } else if (activeMeasurement.type === 'distance') {
      onPointClick(e.point.toArray());
    }
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (activeMeasurement?.type === 'circumference' && e.face) {
        
        // ANATOMICAL ISOLATION MATRIX: 
        // Blocks Ring rendering if intersection occurs maliciously far away from targeted Armature bone!
        if (activeMeasurement.targetBones && skeletonBones.length > 0) {
            let closestBone = null;
            let minDist = Infinity;
            const tempVec = new THREE.Vector3();
            
            // Loop internal Rig determining absolute nearest biological center structure
            skeletonBones.forEach(bone => {
                bone.getWorldPosition(tempVec);
                const dist = e.point.distanceTo(tempVec);
                if (dist < minDist) {
                    minDist = dist;
                    closestBone = bone;
                }
            });
            
            // Reject Physics Engine mapping if hovered biological mesh doesn't explicitly match schema string constraints
            if (closestBone) {
                const boneName = closestBone.name.toLowerCase();
                // Professional matching handles mixamorig_ prefixes and anatomical variants (e.g. ArmL -> leftarm)
                const isAllowed = activeMeasurement.targetBones.some(target => {
                    const t = target.toLowerCase();
                    return boneName.includes(t) || 
                           (t.includes('left') && boneName.includes('left')) ||
                           (t.includes('right') && boneName.includes('right'));
                });
                
                if (!isAllowed) {
                    setHoverData(null); 
                    return;
                }
            }
        }
        
        const normal = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize();
        const reverseDir = normal.clone().negate();
        const origin = e.point.clone().add(reverseDir.clone().multiplyScalar(0.01));
        const raycaster = new THREE.Raycaster(origin, reverseDir);
        const intersects = raycaster.intersectObject(e.object, true);
        
        if (intersects.length > 0) {
            const oppositePoint = intersects[0].point;
            const center = e.point.clone().add(oppositePoint).multiplyScalar(0.5);
            const radius = e.point.distanceTo(oppositePoint) / 2;
            setHoverData({ center, radius });
        }
    }
  };

  const handlePointerOut = () => setHoverData(null);
  const activeIsCurve = activeMeasurement?.type === 'circumference';

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 8], fov: 45 }}
      style={{ background: '#f3f4f6' }}
    >
      <CameraUpdate zoom={zoom} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Environment preset="city" />

      <Suspense fallback={null}>
        <CustomModel 
          onPointerDown={handlePointerDown} 
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          scale={modelScale}
        />
      </Suspense>

      {/* Standard Point-to-Point Distances */}
      {measurements.filter(m => m.type === 'distance').map((m) => {
        if (!m.startPoint || !m.endPoint) return null;
        return (
          <MeasurementLine 
            key={m.id} 
            start={m.startPoint} 
            end={m.endPoint} 
            label={`${m.name}: ${format3DLabel(m.value)}`} 
            color="#3b82f6" 
            showLabel={showLabels}
          />
        );
      })}

      {/* Captured Circumferences */}
      {measurements.filter(m => m.type === 'circumference').map((m) => {
        if (!m.center || !m.radius) return null;
        return (
          <ContourRing 
             key={m.id} 
             center={m.center} 
             radius={m.radius}
             label={`${m.name}: ${format3DLabel(m.value)}`} 
             color="#14b8a6"
             showLabel={showLabels}
             unit={unit}
          />
        );
      })}
      
      {/* Dynamic Procedural Hover Math rendering */}
      {activeIsCurve && hoverData && (
          <ContourRing center={hoverData.center} radius={hoverData.radius} showLabel={showLabels} unit={unit} />
      )}
      
      {tempPoint && <CursorFollower tempPoint={tempPoint} />}

      <OrbitControls 
        enableRotate={!isCameraLocked}
        enablePan={!isCameraLocked}
        enableZoom={true} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.5} 
        minDistance={2} 
        maxDistance={20} 
        makeDefault 
        target={[0, cameraTargetY, 0]}
      />
      <ContactShadows position={[0, -modelScale * 0.8, 0]} opacity={0.4} scale={10} blur={2} />
    </Canvas>
  );
}

// Ensures cached memory mapping identical to child meshes bypassing recursive loading lags
useGLTF.preload('/RiggedBody.glb');
