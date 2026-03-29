import React, { useState } from 'react';
import { CanvasContainer } from './components/CanvasContainer';
import { Ruler, CheckCircle, RotateCcw, CircleDashed, Lock, Unlock, Settings2, Plus, Minus, UserRound, ChevronUp, ChevronDown, Eye, EyeOff, Maximize, ZoomIn, Download, X, Ghost, Sun, Moon } from 'lucide-react';
import * as THREE from 'three';
import './App.css';

const translations = {
  en: {
    title: "Anthropometric Workstation",
    description: "Surgical-grade 3D measurement suite for clinical body analysis and data extraction.",
    status_idle: "Select a section below to begin analysis",
    status_capturing: "Capturing...",
    status_awaiting: "Awaiting Data",
    status_ready: "Scan Ready",
    generate_report: "Create Report",
    label_size: "Label Size",
    modal_title: "Spatial Identity Report",
    modal_desc: "Comprehensive biometric data extracted from clinical 3D reconstruction.",
    export_json: "Export Clinical JSON",
    reset_system: "Reset System",
    manual_override: "Manual Override",
    calibration: "Calibration",
    axis_x: "Axis X",
    axis_y: "Axis Y",
    axis_z: "Axis Z",
    recalibrate: "Recalibrate Point",
    view_config: "View Configuration",
    model_transform: "Model Transform",
    camera_orbit: "Camera & Orbit",
    perspectives: "Perspectives",
    visibility_units: "Visibility & Units",
    scale: "Scale",
    pos_x: "Pos X",
    pos_y: "Pos Y",
    pos_z: "Pos Z",
    zoom: "Zoom",
    orbit: "Orbit",
    tilt: "Tilt",
    labels: "Labels",
    xray: "X-Ray",
    unit: "Unit",
    language: "Language",
    front: "Front",
    back: "Back",
    right: "Right",
    left: "Left",
    categories: {
      torso: "Torso & Core",
      arms: "Arms",
      legs: "Legs",
      hands_feet: "Hands & Feet",
      head_face: "Head & Face"
    },
    measurements: {
      cf: "Center Front Length",
      cb: "Center Back Length",
      rise: "Total Rise",
      shoulder: "Across Shoulder",
      hps_apex: "HPS to Apex",
      neck: "Neck Girth",
      chest: "Full Bust / Chest",
      waist: "Waist",
      belly: "Belly",
      hip: "Full Hip",
      armhole: "Armhole Straight",
      leftBicep: "Left Bicep",
      rightBicep: "Right Bicep",
      leftElbow: "Left Elbow",
      rightElbow: "Right Elbow",
      leftWrist: "Left Wrist",
      rightWrist: "Right Wrist",
      leftThigh: "Left Thigh",
      rightThigh: "Right Thigh",
      leftKnee: "Left Knee",
      rightKnee: "Right Knee",
      leftCalf: "Left Calf",
      rightCalf: "Right Calf",
      leftAnkle: "Left Ankle",
      rightAnkle: "Right Ankle",
      leftHand: "Left Hand Length",
      rightHand: "Right Hand Length",
      leftFootLen: "Left Foot Length",
      rightFootLen: "Right Foot Length",
      leftFootHeight: "Left Foot Height",
      rightFootHeight: "Right Foot Height",
      headCirc: "Head Circumference",
      faceLen: "Total Face Length"
    }
  },
  de: {
    title: "Anthropometrische Workstation",
    description: "Chirurgische 3D-Mess-Suite für klinische Körperanalyse und Datenextraktion.",
    status_idle: "Wählen Sie unten einen Abschnitt aus, um die Analyse zu starten",
    status_capturing: "Erfassung...",
    status_awaiting: "Warte auf Daten",
    status_ready: "Scan bereit",
    generate_report: "Bericht erstellen",
    label_size: "Etikett-Größe",
    modal_title: "Räumlicher Identitätsbericht",
    modal_desc: "Umfassende biometrische Daten, extrahiert aus klinischer 3D-Rekonstruktion.",
    export_json: "Klinisches JSON exportieren",
    reset_system: "System zurücksetzen",
    manual_override: "Manueller Override",
    calibration: "Kalibrierung",
    axis_x: "Achse X",
    axis_y: "Achse Y",
    axis_z: "Achse Z",
    recalibrate: "Punkt rekalibrieren",
    view_config: "Ansichtskonfiguration",
    model_transform: "Modell-Transformation",
    camera_orbit: "Kamera & Orbit",
    perspectives: "Perspektiven",
    visibility_units: "Sichtbarkeit & Einheiten",
    scale: "Skalierung",
    pos_x: "Pos X",
    pos_y: "Pos Y",
    pos_z: "Pos Z",
    zoom: "Zoom",
    orbit: "Orbit",
    tilt: "Neigung",
    labels: "Beschriftungen",
    xray: "Röntgen",
    unit: "Einheit",
    language: "Sprache",
    front: "Vorne",
    back: "Hinten",
    right: "Rechts",
    left: "Links",
    categories: {
      torso: "Torso & Rumpf",
      arms: "Arme",
      legs: "Beine",
      hands_feet: "Hände & Füße",
      head_face: "Kopf & Gesicht"
    },
    measurements: {
      cf: "Vordere Mittellänge",
      cb: "Hintere Mittellänge",
      rise: "Gesamte Leibhöhe",
      shoulder: "Schulterbreite",
      hps_apex: "HPS zu Apex",
      neck: "Halsumfang",
      chest: "Brustumfang",
      waist: "Taille",
      belly: "Bauchumfang",
      hip: "Hüftumfang",
      armhole: "Armloch gerade",
      leftBicep: "Linker Bizeps",
      rightBicep: "Rechter Bizeps",
      leftElbow: "Linker Ellbogen",
      rightElbow: "Rechter Ellbogen",
      leftWrist: "Linkes Handgelenk",
      rightWrist: "Rechtes Handgelenk",
      leftThigh: "Linker Oberschenkel",
      rightThigh: "Rechter Oberschenkel",
      leftKnee: "Linkes Knie",
      rightKnee: "Rechtes Knie",
      leftCalf: "Linke Wade",
      rightCalf: "Rechte Wade",
      leftAnkle: "Linker Knöchel",
      rightAnkle: "Rechter Knöchel",
      leftHand: "Linke Handlänge",
      rightHand: "Rechte Handlänge",
      leftFootLen: "Linke Fußlänge",
      rightFootLen: "Rechte Fußlänge",
      leftFootHeight: "Linke Fußhöhe",
      rightFootHeight: "Rechte Fußhöhe",
      headCirc: "Kopfumfang",
      faceLen: "Gesamte Gesichtslänge"
    }
  }
};

// All schema items now possess `.targetBones` securely mapping them specifically to standard Mixamo Rig properties
const initialMeasurements = [
  // Torso / Core Distances
  { id: 'cf', category: 'Torso & Core', name: 'Center Front Length', type: 'distance', targetBones: ['spine', 'hips', 'neck'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'cb', category: 'Torso & Core', name: 'Center Back Length', type: 'distance', targetBones: ['spine', 'hips', 'neck'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'rise', category: 'Torso & Core', name: 'Total Rise', type: 'distance', targetBones: ['spine', 'hips'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'shoulder', category: 'Torso & Core', name: 'Across Shoulder', type: 'distance', targetBones: ['spine', 'neck', 'shoulder'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'hps_apex', category: 'Torso & Core', name: 'HPS to Apex', type: 'distance', targetBones: ['spine', 'neck'], value: null, startPoint: null, endPoint: null, completed: false },

  // Torso / Core Circumferences
  { id: 'neck', category: 'Torso & Core', name: 'Neck Girth', type: 'circumference', targetBones: ['neck', 'head'], value: null, center: null, radius: null, completed: false },
  { id: 'chest', category: 'Torso & Core', name: 'Full Bust / Chest', type: 'circumference', targetBones: ['spine2', 'spine1', 'spine'], value: null, center: null, radius: null, completed: false },
  { id: 'waist', category: 'Torso & Core', name: 'Waist', type: 'circumference', targetBones: ['spine', 'spine1'], value: null, center: null, radius: null, completed: false },
  { id: 'belly', category: 'Torso & Core', name: 'Belly', type: 'circumference', targetBones: ['spine', 'hips'], value: null, center: null, radius: null, completed: false },
  { id: 'hip', category: 'Torso & Core', name: 'Full Hip', type: 'circumference', targetBones: ['hips', 'upleg'], value: null, center: null, radius: null, completed: false },

  // Arms
  { id: 'armhole', category: 'Arms', name: 'Armhole Straight', type: 'distance', targetBones: ['arm', 'shoulder', 'spine'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'leftBicep', category: 'Arms', name: 'Left Bicep', type: 'circumference', targetBones: ['leftarm'], value: null, center: null, radius: null, completed: false },
  { id: 'rightBicep', category: 'Arms', name: 'Right Bicep', type: 'circumference', targetBones: ['rightarm'], value: null, center: null, radius: null, completed: false },
  { id: 'leftElbow', category: 'Arms', name: 'Left Elbow', type: 'circumference', targetBones: ['leftforearm', 'leftarm'], value: null, center: null, radius: null, completed: false },
  { id: 'rightElbow', category: 'Arms', name: 'Right Elbow', type: 'circumference', targetBones: ['rightforearm', 'rightarm'], value: null, center: null, radius: null, completed: false },
  { id: 'leftWrist', category: 'Arms', name: 'Left Wrist', type: 'circumference', targetBones: ['leftforearm', 'lefthand'], value: null, center: null, radius: null, completed: false },
  { id: 'rightWrist', category: 'Arms', name: 'Right Wrist', type: 'circumference', targetBones: ['rightforearm', 'righthand'], value: null, center: null, radius: null, completed: false },

  // Legs
  { id: 'leftThigh', category: 'Legs', name: 'Left Thigh (Tight)', type: 'circumference', targetBones: ['leftupleg'], value: null, center: null, radius: null, completed: false },
  { id: 'rightThigh', category: 'Legs', name: 'Right Thigh (Tight)', type: 'circumference', targetBones: ['rightupleg'], value: null, center: null, radius: null, completed: false },
  { id: 'leftKnee', category: 'Legs', name: 'Left Knee', type: 'circumference', targetBones: ['leftleg', 'leftupleg'], value: null, center: null, radius: null, completed: false },
  { id: 'rightKnee', category: 'Legs', name: 'Right Knee', type: 'circumference', targetBones: ['rightleg', 'rightupleg'], value: null, center: null, radius: null, completed: false },
  { id: 'leftCalf', category: 'Legs', name: 'Left Calf (Max Girth)', type: 'circumference', targetBones: ['leftleg'], value: null, center: null, radius: null, completed: false },
  { id: 'rightCalf', category: 'Legs', name: 'Right Calf (Max Girth)', type: 'circumference', targetBones: ['rightleg'], value: null, center: null, radius: null, completed: false },
  { id: 'leftAnkle', category: 'Legs', name: 'Left Ankle (Min Girth)', type: 'circumference', targetBones: ['leftleg', 'leftfoot'], value: null, center: null, radius: null, completed: false },
  { id: 'rightAnkle', category: 'Legs', name: 'Right Ankle (Min Girth)', type: 'circumference', targetBones: ['rightleg', 'rightfoot'], value: null, center: null, radius: null, completed: false },

  // Hands & Feet
  { id: 'leftHand', category: 'Hands & Feet', name: 'Left Hand Length', type: 'distance', targetBones: ['lefthand', 'leftmiddle'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'rightHand', category: 'Hands & Feet', name: 'Right Hand Length', type: 'distance', targetBones: ['righthand', 'rightmiddle'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'leftFootLen', category: 'Hands & Feet', name: 'Left Foot Length', type: 'distance', targetBones: ['leftfoot', 'lefttoe'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'rightFootLen', category: 'Hands & Feet', name: 'Right Foot Length', type: 'distance', targetBones: ['rightfoot', 'righttoe'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'leftFootHeight', category: 'Hands & Feet', name: 'Left Foot Height', type: 'distance', targetBones: ['leftfoot', 'leftleg'], value: null, startPoint: null, endPoint: null, completed: false },
  { id: 'rightFootHeight', category: 'Hands & Feet', name: 'Right Foot Height', type: 'distance', targetBones: ['rightfoot', 'rightleg'], value: null, startPoint: null, endPoint: null, completed: false },

  // Head & Neck Extensions
  { id: 'headCirc', category: 'Head & Face', name: 'Head Circumference', type: 'circumference', targetBones: ['head'], value: null, center: null, radius: null, completed: false },
  { id: 'faceLen', category: 'Head & Face', name: 'Total Face Length', type: 'distance', targetBones: ['head'], value: null, startPoint: null, endPoint: null, completed: false },
];

function App() {
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [activeId, setActiveId] = useState(null);
  const [activeEditId, setActiveEditId] = useState(null);
  const [labelScale, setLabelScale] = useState(1.0);
  
  // Initialize all categories as collapsed by default - use internal keys
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    const cats = ['torso', 'arms', 'legs', 'hands_feet', 'head_face'];
    return cats.reduce((acc, cat) => ({ ...acc, [cat]: true }), {});
  });

  const [showLabels, setShowLabels] = useState(true);
  const [modelPos, setModelPos] = useState({ x: 0, y: -1.4, z: 0 });
  const [unit, setUnit] = useState('cm'); 
  const [cameraTargetY, setCameraTargetY] = useState(0); 
  
  const [horizRotation, setHorizRotation] = useState(0);
  const [vertRotation, setVertRotation] = useState(Math.PI / 2); 
  const [lockState, setLockState] = useState({ horiz: false, vert: false });
  
  const [tempPoints, setTempPoints] = useState([]); 
  const [showSummary, setShowSummary] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false); 
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [viewConfigExpanded, setViewConfigExpanded] = useState(false);
  const [modelScale, setModelScale] = useState(1.8);
  const [zoom, setZoom] = useState(7); // Tighter zoom to reduce empty side space
  const [ghostOpacity, setGhostOpacity] = useState(0.05);
  const [modelPath, setModelPath] = useState('/new-rigg.glb');
  const [showGrid, setShowGrid] = useState(false);

  const handleGenderSwitch = (path) => {
    if (modelPath === path) return;
    setModelPath(path);
    setMeasurements(initialMeasurements);
    setTempPoints([]);
    setActiveId(null);
    // The Male body mesh is natively significantly larger inside the .glb architecture.
    // Resetting the UI scale manually here guarantees it fits comfortably 
    // inside the viewport upon swapping without the user needing to manually un-zoom.
    setModelScale(path === '/MaleMesh.glb' ? 1.4 : 1.8);
    // The Male torso's vertical center of gravity is significantly higher than the female rig.
    // Dynamically sliding the vertical offset natively centers the camera perfectly on load.
    setModelPos({ x: 0, y: path === '/MaleMesh.glb' ? -1.8 : -1.4, z: 0 });
  };

  const t = translations[lang];

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLang = (l) => {
    setLang(l);
    localStorage.setItem('lang', l);
  };

  const activeMeasurement = measurements.find(m => m.id === activeId);
  const categories = [...new Set(initialMeasurements.map(m => m.category))];

  const handleSelectTask = (id) => {
    setActiveId(prevId => (prevId === id ? null : id));
    setTempPoints([]); 
    setActiveEditId(null);
  };

  const toggleCategory = (catKey) => {
    const isOpening = !!collapsedCategories[catKey];
    setCollapsedCategories(prev => ({ ...prev, [catKey]: !prev[catKey] }));
    if (isOpening) {
      if (catKey === 'torso') setCameraTargetY(0.5);
      if (catKey === 'arms') setCameraTargetY(0.3);
      if (catKey === 'legs') setCameraTargetY(-0.5); // Focus mid-leg, not under floor
      if (catKey === 'hands_feet') setCameraTargetY(-1.0); // Focus just above floor
      if (catKey === 'head_face') setCameraTargetY(1.2);
    }
  };

  const formatValue = (cmValue) => {
    if (!cmValue) return '--';
    const val = parseFloat(cmValue);
    return unit === 'mm' ? (val * 10).toFixed(0) : val.toFixed(1);
  };

  const toggleEditor = (e, id) => {
    if (e) e.stopPropagation();
    setActiveEditId(prev => (prev === id ? null : id));
    setActiveId(null);
  };

  const handleSelectMeasurement = (id) => {
    const item = measurements.find(m => m.id === id);
    if (!item) return;
    setCollapsedCategories(prev => ({ ...prev, [item.category]: false }));
    setActiveEditId(id);
    setActiveId(null);
    setTimeout(() => {
      const el = document.getElementById(`item-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleCameraChange = (azimuth, polar) => {
    if (!lockState.horiz) setHorizRotation(azimuth);
    if (!lockState.vert) setVertRotation(polar);
  };

  const toggleLock = (axis) => {
    setLockState(prev => ({ ...prev, [axis]: !prev[axis] }));
  };

  const setViewpoint = (horiz, vert) => {
    if (!lockState.horiz) setHorizRotation(horiz);
    if (!lockState.vert) setVertRotation(vert);
  };

  const calculateThreePointCircle = (pts) => {
    const [A, B, C] = pts.map(p => new THREE.Vector3(...p));
    const a = B.clone().sub(A);
    const b = C.clone().sub(A);
    const cross = a.clone().cross(b);
    if (cross.lengthSq() < 1e-6) return null; 
    const midAB = A.clone().add(B).multiplyScalar(0.5);
    const midAC = A.clone().add(C).multiplyScalar(0.5);
    const n = cross.normalize();
    const pA = n.clone().cross(a).normalize();
    const pB = n.clone().cross(b).normalize();
    const pAxpB = pA.clone().cross(pB);
    if (pAxpB.lengthSq() < 1e-6) return null;
    const diff = midAC.clone().sub(midAB);
    const diffxpB = diff.clone().cross(pB);
    const t1 = diffxpB.dot(pAxpB) / pAxpB.lengthSq();
    const center = midAB.clone().add(pA.multiplyScalar(t1));
    const radius = center.distanceTo(A);
    return { center, radius, normal: n }; 
  };

  const handlePointClick = (pointArray) => {
    if (!activeId) return;
    if (activeMeasurement.type === 'distance') {
        if (tempPoints.length === 0) {
            setTempPoints([pointArray]);
        } else {
            const p1 = new THREE.Vector3(...tempPoints[0]);
            const p2 = new THREE.Vector3(...pointArray);
            const distance = p1.distanceTo(p2);
            const scaledDistance = (distance * 15).toFixed(1);
            setMeasurements(prev => prev.map(m => {
                if (m.id === activeId) {
                    return { ...m, startPoint: tempPoints[0], endPoint: pointArray, value: scaledDistance, completed: true };
                }
                return m;
            }));
            setTempPoints([]);
            setActiveId(null);
        }
    } 
    else if (activeMeasurement.type === 'circumference') {
        if (tempPoints.length < 2) {
            setTempPoints(prev => [...prev, pointArray]);
        } else {
            const result = calculateThreePointCircle([...tempPoints, pointArray]);
            if (!result) return;
            const circumference = Math.PI * 2 * result.radius;
            const scaledCircumference = (circumference * 15).toFixed(1);
            setMeasurements(prev => prev.map(m => {
                if (m.id === activeId) {
                    return { ...m, center: result.center, radius: result.radius, value: scaledCircumference, completed: true };
                }
                return m;
            }));
            setTempPoints([]);
            setActiveId(null);
        }
    }
  };

  const handleCurveCapture = (center, radius) => {};

  const handleResetMeasurement = (id) => {
      setMeasurements(prev => prev.map(m => {
          if (m.id === id) {
              return { ...m, value: null, startPoint: null, endPoint: null, center: null, radius: null, normal: null, completed: false };
          }
          return m;
      }));
      if (activeEditId === id) setActiveEditId(null);
  };

  const handleManualValueChange = (id, newValue) => {
    setMeasurements(prev => prev.map(m => {
      if (m.id === id) return { ...m, value: newValue, completed: true };
      return m;
    }));
  };

  const handleSizeTune = (id, deltaMultiplier, type) => {
    setMeasurements(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (m.type === 'circumference') {
        const newRadius = Math.max(0.01, m.radius + (deltaMultiplier * 0.015));
        const newCircumference = Math.PI * 2 * newRadius;
        return { ...m, radius: newRadius, value: (newCircumference * 15).toFixed(1) };
      }
      else if (m.type === 'distance') {
        const p1 = new THREE.Vector3(...m.startPoint);
        const p2 = new THREE.Vector3(...m.endPoint);
        const direction = p2.clone().sub(p1).normalize();
        const newP2 = p2.clone().add(direction.multiplyScalar(deltaMultiplier * 0.05));
        const newDistance = p1.distanceTo(newP2);
        return { ...m, endPoint: newP2.toArray(), value: (newDistance * 15).toFixed(1) };
      }
      return m;
    }));
  };

  const handleMoveTune = (id, axis, deltaMultiplier) => {
    const delta = deltaMultiplier * 0.02;
    setMeasurements(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (m.type === 'circumference') {
        const newCenter = m.center.clone();
        newCenter[axis] += delta;
        return { ...m, center: newCenter };
      }
      else if (m.type === 'distance') {
        const p1 = new THREE.Vector3(...m.startPoint);
        const p2 = new THREE.Vector3(...m.endPoint);
        p1[axis] += delta;
        p2[axis] += delta;
        return { ...m, startPoint: p1.toArray(), endPoint: p2.toArray() };
      }
      return m;
    }));
  };

  const handleReset = () => {
    setMeasurements(initialMeasurements);
    setActiveId(null);
    setActiveEditId(null);
    setTempPoints([]);
    setShowSummary(false);
  };

  const handleExportJSON = () => {
    const completedResults = measurements.filter(m => m.completed).map(m => ({
      id: m.id,
      category: m.category,
      name: m.name,
      value: formatValue(m.value),
      unit: unit
    }));
    const exportData = {
      metadata: { appName: "Anatomy Metrics 3D", timestamp: new Date().toISOString(), totalMeasurements: completedResults.length, globalUnit: unit },
      measurements: completedResults
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Anatomy_Metrics_Report_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderTuneRow = (label, axis, id, method) => (
    <div className="fine-tune-row">
      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
      <div className="fine-tune-controls">
        <button className="tune-btn" onClick={() => method(id, axis === 'size' ? null : axis, -1)} aria-label="Decrease"><Minus size={14} /></button>
        <span className="tune-label">{axis === 'size' ? t.scale : `${t.unit === 'mm' ? 'Pos' : 'Achse'} ${axis.toUpperCase()}`}</span>
        <button className="tune-btn" onClick={() => method(id, axis === 'size' ? null : axis, 1)} aria-label="Increase"><Plus size={14} /></button>
      </div>
    </div>
  );

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="canvas-wrapper">
        <CanvasContainer
          modelPath={modelPath}
          measurements={measurements}
          activeMeasurement={activeMeasurement}
          tempPoints={tempPoints}
          onPointClick={handlePointClick}
          onCurveCapture={handleCurveCapture}
          horizRotation={horizRotation}
          vertRotation={vertRotation}
          lockState={lockState}
          onCameraChange={handleCameraChange}
          showLabels={showLabels}
          showGrid={showGrid}
          modelScale={modelScale}
          zoom={zoom}
          modelPos={modelPos}
          ghostOpacity={ghostOpacity}
          labelScale={labelScale}
          unit={unit}
          cameraTargetY={cameraTargetY}
          onSelectMeasurement={handleSelectMeasurement}
          isTransparent={isTransparent}
          theme={theme}
        />

        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div 
            className={`view-config glass-panel ${viewConfigExpanded ? 'expanded' : 'collapsed'}`}
            style={{ position: 'relative', top: 0, left: 0 }}
            onClick={() => !viewConfigExpanded && setViewConfigExpanded(true)}
          >
          <div className="view-config-header" onClick={(e) => {
            if (viewConfigExpanded) {
              e.stopPropagation();
              setViewConfigExpanded(false);
            }
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <Settings2 size={18} strokeWidth={2.5} color="var(--accent-primary)" /> 
              {viewConfigExpanded && <span style={{ fontWeight: 700, fontSize: '13px' }}>View Configuration</span>}
            </div>
            {viewConfigExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>

          {viewConfigExpanded && (
            <div className="view-config-body fade-in">
              <div className="config-group">
                <div className="group-title">{t.model_transform}</div>
                <div className="config-row">
                  <span className="config-label">{t.scale}</span>
                  <input
                    type="range" min="1" max="4" step="0.1"
                    value={modelScale}
                    onChange={(e) => setModelScale(parseFloat(e.target.value))}
                  />
                  <div className="config-value">{modelScale.toFixed(1)}x</div>
                  <div></div>
                </div>
                <div className="config-row">
                  <span className="config-label" style={{ fontSize: '9px' }}>OPACITY</span>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={ghostOpacity}
                    onChange={(e) => setGhostOpacity(parseFloat(e.target.value))}
                  />
                  <div className="config-value">{(ghostOpacity * 100).toFixed(0)}%</div>
                  <div></div>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.pos_x}</span>
                  <input 
                    type="range" min="-5" max="5" step="0.1" 
                    value={modelPos.x} 
                    onChange={(e) => setModelPos(prev => ({ ...prev, x: parseFloat(e.target.value) }))} 
                  />
                  <div className="config-value">{modelPos.x.toFixed(1)}</div>
                  <div></div>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.pos_y}</span>
                  <input 
                    type="range" min="-10" max="10" step="0.1" 
                    value={modelPos.y} 
                    onChange={(e) => setModelPos(prev => ({ ...prev, y: parseFloat(e.target.value) }))} 
                  />
                  <div className="config-value">{modelPos.y.toFixed(1)}</div>
                  <div></div>
                </div>
              </div>

              <div className="config-group">
                <div className="group-title">{t.camera_orbit}</div>
                <div className="config-row">
                  <span className="config-label">{t.zoom}</span>
                  <input
                    type="range" min="3" max="25" step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                  />
                  <div className="config-value">{zoom.toFixed(1)}m</div>
                  <div></div>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.orbit}</span>
                  <input 
                    type="range" min={-Math.PI} max={Math.PI} step="0.01" 
                    value={horizRotation} 
                    onChange={(e) => setHorizRotation(parseFloat(e.target.value))} 
                  />
                  <div className="config-value">{(horizRotation * 180 / Math.PI).toFixed(0)}°</div>
                  <button 
                    className={`lock-axis-btn ${lockState.horiz ? 'locked' : ''}`}
                    onClick={() => toggleLock('horiz')}
                  >
                    {lockState.horiz ? <Lock size={12}/> : <Unlock size={12}/>}
                  </button>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.tilt}</span>
                  <input 
                    type="range" min="0" max={Math.PI} step="0.01" 
                    value={vertRotation} 
                    onChange={(e) => setVertRotation(parseFloat(e.target.value))} 
                  />
                  <div className="config-value">{(vertRotation * 180 / Math.PI).toFixed(0)}°</div>
                  <button 
                    className={`lock-axis-btn ${lockState.vert ? 'locked' : ''}`}
                    onClick={() => toggleLock('vert')}
                  >
                    {lockState.vert ? <Lock size={12}/> : <Unlock size={12}/>}
                  </button>
                </div>
              </div>

              <div className="config-group">
                <div className="group-title">{t.perspectives}</div>
                <div className="viewpoint-grid">
                  <button className="viewpoint-btn" onClick={() => setViewpoint(0, Math.PI / 2)}>{t.front}</button>
                  <button className="viewpoint-btn" onClick={() => setViewpoint(Math.PI, Math.PI / 2)}>{t.back}</button>
                  <button className="viewpoint-btn" onClick={() => setViewpoint(Math.PI / 2, Math.PI / 2)}>{t.right}</button>
                  <button className="viewpoint-btn" onClick={() => setViewpoint(-Math.PI / 2, Math.PI / 2)}>{t.left}</button>
                </div>
              </div>

              <div className="config-group">
                <div className="group-title">{t.visibility_units}</div>
                <div className="config-row">
                  <span className="config-label">{t.labels}</span>
                  <div className="unit-toggle" style={{ gridColumn: '2 / 5' }}>
                    <button className={`unit-btn ${showLabels ? 'active' : ''}`} onClick={() => setShowLabels(true)}><Eye size={12} /></button>
                    <button className={`unit-btn ${!showLabels ? 'active' : ''}`} onClick={() => setShowLabels(false)}><EyeOff size={12} /></button>
                  </div>
                </div>
                <div className="config-row">
                  <span className="config-label">Grid</span>
                  <div className="unit-toggle" style={{ gridColumn: '2 / 5' }}>
                    <button className={`unit-btn ${showGrid ? 'active' : ''}`} onClick={() => setShowGrid(true)}>ON</button>
                    <button className={`unit-btn ${!showGrid ? 'active' : ''}`} onClick={() => setShowGrid(false)}>OFF</button>
                  </div>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.label_size}</span>
                  <input
                    type="range" min="0.5" max="2" step="0.1"
                    value={labelScale}
                    onChange={(e) => setLabelScale(parseFloat(e.target.value))}
                  />
                  <div className="config-value">{labelScale.toFixed(1)}x</div>
                  <div></div>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.xray}</span>
                  <div className="unit-toggle" style={{ gridColumn: '2 / 5' }}>
                    <button className={`unit-btn ${isTransparent ? 'active' : ''}`} onClick={() => setIsTransparent(true)}><Eye size={12} /></button>
                    <button className={`unit-btn ${!isTransparent ? 'active' : ''}`} onClick={() => setIsTransparent(false)}><EyeOff size={12} /></button>
                  </div>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.language}</span>
                  <div className="unit-toggle" style={{ gridColumn: '2 / 5' }}>
                    <button className={`unit-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => toggleLang('en')}>EN</button>
                    <button className={`unit-btn ${lang === 'de' ? 'active' : ''}`} onClick={() => toggleLang('de')}>DE</button>
                  </div>
                </div>
                <div className="config-row">
                  <span className="config-label">{t.unit}</span>
                  <div className="unit-toggle" style={{ gridColumn: '2 / 5' }}>
                    <button className={`unit-btn ${unit === 'cm' ? 'active' : ''}`} onClick={() => setUnit('cm')}>CM</button>
                    <button className={`unit-btn ${unit === 'mm' ? 'active' : ''}`} onClick={() => setUnit('mm')}>MM</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

          <div className="gender-toggle glass-panel" style={{ display: 'flex', padding: '4px', gap: '4px', borderRadius: '26px', height: '52px', alignItems: 'center' }}>
            <button 
              className={`btn`}
              style={{ 
                padding: '0', height: '44px', width: '44px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: modelPath === '/new-rigg.glb' ? 'var(--accent-primary)' : 'transparent', 
                color: modelPath === '/new-rigg.glb' ? 'white' : 'var(--text-secondary)' 
              }}
              onClick={() => handleGenderSwitch('/new-rigg.glb')}
              title="Female Model"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="6"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="9" y1="19" x2="15" y2="19"/></svg>
            </button>
            <button 
              className={`btn`}
              style={{ 
                padding: '0', height: '44px', width: '44px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: modelPath === '/MaleMesh.glb' ? 'var(--accent-primary)' : 'transparent', 
                color: modelPath === '/MaleMesh.glb' ? 'white' : 'var(--text-secondary)' 
              }}
              onClick={() => handleGenderSwitch('/MaleMesh.glb')}
              title="Male Model"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="14" r="6"/><line x1="14.24" y1="9.76" x2="21" y2="3"/><line x1="15" y1="3" x2="21" y2="3"/><line x1="21" y1="9" x2="21" y2="3"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar fade-in">
        <div className="sidebar-header" style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ 
              background: 'rgba(86, 164, 50, 0.1)', 
              padding: '10px', 
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserRound size={28} color="var(--accent-primary)" strokeWidth={2.5} />
            </div>
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              style={{ 
                background: 'var(--border-light)', 
                border: 'none', 
                borderRadius: '12px', 
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)'
              }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>

        <div className={`status-indicator ${activeId ? 'measuring' : ''}`} style={{ marginBottom: '20px' }}>
          {activeId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
              {activeMeasurement.type === 'circumference'
                ? <span>{lang === 'en' ? `Select 3 points for ${t.measurements[activeId]} (3/${tempPoints.length})` : `Wählen Sie 3 Punkte für ${t.measurements[activeId]} (${tempPoints.length}/3)`}</span>
                : <span>{lang === 'en' ? `Click ${tempPoints.length === 0 ? 'START' : 'END'} coordinate on model` : `Klicken Sie auf den ${tempPoints.length === 0 ? 'START' : 'END'}-Punkt auf dem Modell`}</span>
              }
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CircleDashed size={14} />
              <span>{t.status_idle}</span>
            </div>
          )}
        </div>

        <div className="measurement-list" style={{ flex: 1 }}>
          {Object.keys(t.categories).map(catKey => {
            const categoryLabel = t.categories[catKey];
            const catMeasurements = measurements.filter(m => {
              // Map the initial category name to the translated key
              if (catKey === 'torso') return m.category === 'Torso & Core';
              if (catKey === 'arms') return m.category === 'Arms';
              if (catKey === 'legs') return m.category === 'Legs';
              if (catKey === 'hands_feet') return m.category === 'Hands & Feet';
              if (catKey === 'head_face') return m.category === 'Head & Face';
              return false;
            });

            return (
            <div key={catKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div
                className="category-header"
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px'
                }}
                onClick={() => toggleCategory(catKey)}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontSize: '11px', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  color: 'var(--text-secondary)'
                }}>
                  {categoryLabel}
                </div>
                {collapsedCategories[catKey] ? <ChevronDown size={14} color="var(--text-secondary)" /> : <ChevronUp size={14} color="var(--text-secondary)" />}
              </div>

              {!collapsedCategories[catKey] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {catMeasurements.map(item => (
                    <div
                      key={item.id}
                      id={`item-${item.id}`}
                      className={`measurement-item ${activeId === item.id ? 'active' : ''} ${item.completed ? 'completed' : ''} ${activeEditId === item.id ? 'editing' : ''}`}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div className="measurement-info" style={{ flex: 1 }} onClick={() => handleSelectTask(item.id)}>
                            <div className="measurement-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {item.completed ? <CheckCircle size={14} color="var(--accent-primary)" /> : <CircleDashed size={14} color="var(--text-secondary)" />}
                              {t.measurements[item.id]}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {item.completed ? t.status_ready : (activeId === item.id ? t.status_capturing : t.status_awaiting)}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="measurement-value">
                              {formatValue(item.value)} 
                              <span style={{ fontSize: '11px', fontWeight: 600, marginLeft: '2px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{unit}</span>
                            </div>

                            {item.completed && activeId !== item.id && (
                              <button
                                className={`lock-axis-btn ${activeEditId === item.id ? 'locked' : ''}`}
                                onClick={(e) => toggleEditor(e, item.id)}
                                style={{ width: '32px', height: '32px' }}
                              >
                                <Settings2 size={16} />
                              </button>
                            )}
                            
                            {activeId === item.id && (
                               <button 
                                 className="lock-axis-btn"
                                 onClick={(e) => { e.stopPropagation(); handleSelectTask(item.id); }}
                                 style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                               >
                                 <X size={16} />
                               </button>
                            )}
                          </div>
                        </div>

                        {activeEditId === item.id && (
                          <div className="fine-tune-panel fade-in" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                            <div className="tune-row" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>{t.manual_override}</span>
                              <input 
                                type="text"
                                value={item.value || ''}
                                onChange={(e) => handleManualValueChange(item.id, e.target.value)}
                                style={{
                                  width: '80px',
                                  background: 'var(--bg-app)',
                                  border: '1px solid var(--border-medium)',
                                  color: 'var(--text-main)',
                                  borderRadius: '8px',
                                  padding: '4px 8px',
                                  fontSize: '13px',
                                  textAlign: 'right',
                                  fontFamily: 'monospace',
                                  outline: 'none',
                                  fontWeight: '700'
                                }}
                              />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {renderTuneRow(t.calibration, 'size', item.id, (id, _, dir) => handleSizeTune(id, dir, item.type))}
                              {renderTuneRow(t.axis_x, 'x', item.id, handleMoveTune)}
                              {renderTuneRow(t.axis_y, 'y', item.id, handleMoveTune)}
                              {renderTuneRow(t.axis_z, 'z', item.id, handleMoveTune)}
                            </div>
                            <button 
                              className="btn btn-outline" 
                              onClick={() => handleResetMeasurement(item.id)}
                              style={{ width: '100%', marginTop: '16px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', padding: '8px', borderRadius: '10px' }}
                            >
                              <RotateCcw size={12} style={{ marginRight: '6px' }} /> {t.recalibrate}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })}
        </div>

        <button
          className="btn btn-primary"
          style={{ 
            marginTop: '24px', 
            padding: '16px', 
            width: '100%',
            fontSize: '15px',
            boxShadow: '0 8px 24px rgba(86, 164, 50, 0.2)'
          }}
          disabled={!measurements.some(m => m.completed)}
          onClick={() => setShowSummary(true)}
        >
          <Maximize size={18} style={{ marginRight: '8px' }} strokeWidth={2.5} /> {t.generate_report}
        </button>
      </div>

      {showSummary && (
        <div className="modal-overlay fade-in">
          <div className="modal-content" style={{ width: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>{t.modal_title}</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>{t.modal_desc}</p>
                </div>
                <button 
                  onClick={() => setShowSummary(false)} 
                  style={{ background: 'var(--border-light)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="results-list" style={{ flex: 1, overflowY: 'auto', paddingRight: '12px', marginBottom: '32px' }}>
              {Object.keys(t.categories).map(catKey => {
                const categoryLabel = t.categories[catKey];
                const results = measurements.filter(m => {
                  if (catKey === 'torso') return m.category === 'Torso & Core' && m.completed;
                  if (catKey === 'arms') return m.category === 'Arms' && m.completed;
                  if (catKey === 'legs') return m.category === 'Legs' && m.completed;
                  if (catKey === 'hands_feet') return m.category === 'Hands & Feet' && m.completed;
                  if (catKey === 'head_face') return m.category === 'Head & Face' && m.completed;
                  return false;
                });

                if (results.length === 0) return null;
                return (
                  <div key={`modal-${catKey}`} style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                      {categoryLabel}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {results.map(item => (
                        <div key={item.id} style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.type === 'circumference' ? <CircleDashed size={10} /> : <Ruler size={10} />}
                            {t.measurements[item.id]}
                          </div>
                          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'SF Mono, monospace' }}>
                            {formatValue(item.value)}
                            <span style={{ fontSize: '12px', marginLeft: '4px', textTransform: 'uppercase' }}>{unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 2, padding: '14px' }} onClick={handleExportJSON}>
                <Download size={18} style={{ marginRight: '8px' }} /> {t.export_json}
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, background: 'var(--border-light)', color: 'var(--text-main)', padding: '14px' }} 
                onClick={handleReset}
              >
                <RotateCcw size={16} style={{ marginRight: '8px' }} /> {t.reset_system}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default App;
