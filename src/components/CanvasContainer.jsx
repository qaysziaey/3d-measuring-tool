import { useThree, Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Line, Html, useGLTF } from '@react-three/drei';
import { CustomModel } from './CustomModel';
import { MeasurementLine } from './MeasurementLine';
import React, { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Generates a responsive bounding Ring perfectly sized over hovering slices
function ContourRing({ id, center, radius, label, color = "#14b8a6", showLabel = true, unit = 'cm', onSelect }) {
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
    <group 
      onPointerDown={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(id);
      }}
      cursor="pointer"
    >
      <Line
        points={points}
        color={color}
        lineWidth={6} // Thicker for easier clicking
        dashed={false}
        transparent
        opacity={0.8}
      />
      
        {showLabel && (
          <Html position={[center.x + r, center.y, center.z]} center distanceFactor={8} zIndexRange={[100, 0]}>
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
              {label ? label : `Curve: ${formatLabel(exactCircumference * 15)} ${unit}`}
            </div>
          </Html>
        )}
    </group>
  );
}

function CursorFollower({ tempPoints }) {
  if (!tempPoints || tempPoints.length === 0) return null;
  return (
    <>
      {tempPoints.map((pt, i) => (
        <mesh key={i} position={pt}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshBasicMaterial color="#ef4444" depthTest={false} transparent opacity={1} />
        </mesh>
      ))}
    </>
  );
}


export function CanvasContainer({ 
  measurements, 
  activeMeasurement, 
  tempPoints, 
  onPointClick,
  onCurveCapture,
  horizRotation,
  vertRotation,
  lockState,
  onCameraChange,
  showLabels,
  modelScale,
  zoom,
  unit = 'cm',
  cameraTargetY = 0,
  onSelectMeasurement,
  isTransparent,
  theme = 'light' 
}) {
  const [hoverData, setHoverData] = useState(null);
  const orbitRef = useRef();
  const isInternalUpdate = useRef(false);

  // Synchronize 3D Camera with UI Sliders
  useEffect(() => {
    if (!orbitRef.current || isInternalUpdate.current) return;
    
    // We update the camera position based on the spherical coordinates from the sliders
    const controls = orbitRef.current;
    const distance = controls.object.position.distanceTo(controls.target);
    
    // Convert azimuthal/polar to Cartesian relative to target
    const x = distance * Math.sin(vertRotation) * Math.sin(horizRotation);
    const y = distance * Math.cos(vertRotation);
    const z = distance * Math.sin(vertRotation) * Math.cos(horizRotation);
    
    controls.object.position.set(
      controls.target.x + x,
      controls.target.y + y,
      controls.target.z + z
    );
    controls.update();
  }, [horizRotation, vertRotation]);

  const format3DLabel = (cmVal) => {
    if (!cmVal) return '';
    const v = parseFloat(cmVal);
    return unit === 'mm' ? `${(v * 10).toFixed(0)} mm` : `${v.toFixed(1)} cm`;
  };
  
  // Robust skeletal extraction traversing the entire GLTF tree for deep rig architectures
  const { scene, nodes } = useGLTF('/new-rigg.glb');
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

    // We now unify all 3D capturing through onPointClick (handles 2-point and 3-point scans)
    onPointClick(e.point.toArray());
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
      style={{ background: theme === 'dark' ? '#0a0a0a' : '#f3f4f6' }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Environment preset="city" />

      <Suspense fallback={null}>
        <CustomModel 
          onPointerDown={handlePointerDown} 
          onPointerMove={handlePointerMove}
          onPointerOut={handlePointerOut}
          scale={modelScale}
          isTransparent={isTransparent}
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
            onClick={() => onSelectMeasurement(m.id)}
          />
        );
      })}

      {/* Captured Circumferences */}
      {measurements.filter(m => m.type === 'circumference').map((m) => {
        if (!m.center || !m.radius) return null;
        return (
          <ContourRing 
             key={m.id} 
             id={m.id}
             center={m.center} 
             radius={m.radius}
             label={`${m.name}: ${format3DLabel(m.value)}`} 
             color="#14b8a6"
             showLabel={showLabels}
             unit={unit}
             onSelect={onSelectMeasurement}
          />
        );
      })}
      
      {/* Dynamic Procedural Hover Math rendering */}
      {activeIsCurve && hoverData && tempPoints.length === 0 && (
          <ContourRing center={hoverData.center} radius={hoverData.radius} showLabel={showLabels} unit={unit} />
      )}
      
      {tempPoints && <CursorFollower tempPoints={tempPoints} />}

      <OrbitControls 
        ref={orbitRef}
        enableRotate={true}
        enablePan={true}
        enableZoom={true} 
        minPolarAngle={lockState.vert ? vertRotation : 0} 
        maxPolarAngle={lockState.vert ? vertRotation : Math.PI} 
        minAzimuthAngle={lockState.horiz ? horizRotation : -Infinity}
        maxAzimuthAngle={lockState.horiz ? horizRotation : Infinity}
        minDistance={zoom * 0.5} 
        maxDistance={zoom * 2} 
        makeDefault 
        target={[0, cameraTargetY, 0]}
        onChange={(e) => {
           if (orbitRef.current && onCameraChange) {
              const az = orbitRef.current.getAzimuthalAngle();
              const pol = orbitRef.current.getPolarAngle();
              
              // Prevent feedback loops during slider-driven updates
              if (Math.abs(az - horizRotation) > 0.01 || Math.abs(pol - vertRotation) > 0.01) {
                  isInternalUpdate.current = true;
                  onCameraChange(az, pol);
                  // Release the lock after state has likely propagated
                  setTimeout(() => { isInternalUpdate.current = false; }, 50);
              }
           }
        }}
      />
      <ContactShadows position={[0, -modelScale * 0.8, 0]} opacity={0.4} scale={10} blur={2} />
    </Canvas>
  );
}

// Ensures cached memory mapping identical to child meshes bypassing recursive loading lags
useGLTF.preload('/new-rigg.glb');
