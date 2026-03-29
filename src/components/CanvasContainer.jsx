import { useThree, Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Line, Html, useGLTF, Center } from '@react-three/drei';
import { CustomModel } from './CustomModel';
import { MeasurementLine } from './MeasurementLine';
import React, { Suspense, useState, useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CircleDashed } from 'lucide-react';

// Generates a responsive bounding Ring perfectly sized over hovering slices
function ContourRing({ id, center, radius, label, color = "#56a432", showLabel = true, unit = 'cm', onSelect, normal = [0, 1, 0], active = false, labelScale = 1.0 }) {
  if (!center) return null;

  const formatLabel = (val) => {
    const v = parseFloat(val);
    return unit === 'mm' ? (v * 10).toFixed(0) : v.toFixed(1);
  };

  const exactCircumference = Math.PI * 2 * radius;
  
  const orientationRef = useRef();
  useEffect(() => {
    if (orientationRef.current) {
        if (normal) {
            const n = new THREE.Vector3(...(Array.isArray(normal) ? normal : [normal.x, normal.y, normal.z])).normalize();
            orientationRef.current.lookAt(new THREE.Vector3().addVectors(orientationRef.current.position, n));
        } else {
            orientationRef.current.rotation.set(Math.PI / 2, 0, 0);
        }
    }
  }, [normal, center]);

  return (
    <group 
      ref={orientationRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(id);
      }}
      cursor="pointer"
      position={[center.x, center.y, center.z]}
    >
      <mesh>
        <torusGeometry args={[radius, 0.005, 12, 128]} />
        <meshStandardMaterial 
          color={active ? "#ffffff" : "#56a432"} 
          emissive={active ? "#ffffff" : "#56a432"}
          emissiveIntensity={active ? 1 : 0.5}
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
        {showLabel && (
          <Html position={[radius + 0.05, 0, 0]} center distanceFactor={8} zIndexRange={[100, 0]}>
            <div 
              className="measurement-tag glass-panel"
              style={{
                color: 'white',
                background: active ? 'var(--accent-primary)' : 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                padding: `${4 * labelScale}px ${10 * labelScale}px`,
                borderRadius: `${12 * labelScale}px`,
                fontSize: `${10 * labelScale}px`,
                fontWeight: '700',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                border: active ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CircleDashed size={10} />
                {label ? label : `${formatLabel(exactCircumference * 15)} ${unit}`}
              </div>
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
          <sphereGeometry args={[0.008, 16, 16]} />
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
  modelPos,
  unit = 'cm',
  cameraTargetY = 0,
  labelScale = 1.0,
  onSelectMeasurement,
  isTransparent,
  theme = 'light' 
}) {
  const [hoverData, setHoverData] = useState(null);
  const orbitRef = useRef();
  // Flag set ONLY when a UI element (slider/button) drives camera change
  // — prevents the OrbitControls onChange from echo-looping the state back.
  const programmaticUpdate = useRef(false);

  // Synchronize 3D Camera with UI Sliders & Perspective Buttons
  useEffect(() => {
    if (!orbitRef.current) return;
    
    const controls = orbitRef.current;
    const distance = controls.object.position.distanceTo(controls.target);
    
    // Convert spherical (azimuth + polar) → Cartesian offset from target
    const x = distance * Math.sin(vertRotation) * Math.sin(horizRotation);
    const y = distance * Math.cos(vertRotation);
    const z = distance * Math.sin(vertRotation) * Math.cos(horizRotation);
    
    programmaticUpdate.current = true;
    controls.object.position.set(
      controls.target.x + x,
      controls.target.y + y,
      controls.target.z + z
    );
    controls.update();
    // Release the echo-guard after React state has propagated
    setTimeout(() => { programmaticUpdate.current = false; }, 60);
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
    // We intentionally removed the wobbly raycasted auto-ring hover feature here.
    // The user will cleanly use the stable 3-point dot method to define circumferences.
    e.stopPropagation();
  };

  const handlePointerOut = () => setHoverData(null);
  const activeIsCurve = activeMeasurement?.type === 'circumference';

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      clock={new THREE.Timer()}
      camera={{ position: [0, 2, 8], fov: 45 }}
      style={{ 
        background: 'radial-gradient(circle at center, #56a432 0%, #4a8d2b 100%)' 
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Environment preset="city" />
      
      <ContactShadows 
        position={[modelPos.x, modelPos.y, modelPos.z]}
        opacity={0.4} 
        blur={2.5} 
        far={10} 
        resolution={1024} 
        color="#1a340f" 
      />

      <Suspense fallback={null}>
        {/* No <Center> — it shifts the mesh BBOX origin and breaks the orbit pivot.
            The group position drives placement; model sits at origin so OrbitControls
            target always points to the model centre. */}
        <group position={[modelPos.x, modelPos.y + 0, modelPos.z]}>
          <CustomModel 
            onPointerDown={handlePointerDown} 
            onPointerMove={handlePointerMove}
            onPointerOut={handlePointerOut}
            modelPath="/new-rigg.glb" 
            scale={modelScale} 
            isTransparent={isTransparent}
          />
        </group>
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
            labelScale={labelScale}
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
             normal={m.normal}
             label={`${m.name}: ${format3DLabel(m.value)}`} 
             color="#14b8a6"
             showLabel={showLabels}
             unit={unit}
             labelScale={labelScale}
             onSelect={onSelectMeasurement}
          />
        );
      })}
      
      {/* Dynamic Procedural Hover Math rendering */}
      {activeIsCurve && hoverData && tempPoints.length === 0 && (
          <ContourRing center={hoverData.center} radius={hoverData.radius} showLabel={showLabels} unit={unit} labelScale={labelScale} />
      )}
      
      {tempPoints && <CursorFollower tempPoints={tempPoints} />}

      <OrbitControls 
        ref={orbitRef}
        enableRotate={true}
        enablePan={false}
        enableZoom={true}
        // Tilt (polar) is ALWAYS pinned to the slider value — mouse cannot change it.
        // Only the "Tilt" slider drives the vertical angle.
        minPolarAngle={vertRotation}
        maxPolarAngle={vertRotation}
        // Horizontal orbit is free unless the user has locked it.
        minAzimuthAngle={lockState.horiz ? horizRotation : -Infinity}
        maxAzimuthAngle={lockState.horiz ? horizRotation : Infinity}
        minDistance={zoom * 0.5} 
        maxDistance={zoom * 2} 
        makeDefault 
        // Target ONLY tracks the vertical body part focus (cameraTargetY).
        // It does NOT track modelPos. This allows modelPos to act as a true visual pan!
        target={[0, cameraTargetY, 0]}
        onChange={() => {
           // Only echo the azimuth back to state when the user is dragging.
           // Polar angle is always slider-driven so we never echo it.
           if (programmaticUpdate.current) return;
           if (orbitRef.current && onCameraChange) {
              const az = orbitRef.current.getAzimuthalAngle();
              // Pass current vertRotation unchanged — tilt never comes from mouse
              onCameraChange(az, vertRotation);
           }
        }}
      />

    </Canvas>
  );
}

// Ensures cached memory mapping identical to child meshes bypassing recursive loading lags
useGLTF.preload('/new-rigg.glb');
