import React, { useState } from 'react';
import { CanvasContainer } from './components/CanvasContainer';
import { Ruler, CheckCircle, RotateCcw, CircleDashed, Lock, Unlock, Settings2, Plus, Minus, UserRound, ChevronUp, ChevronDown, Eye, EyeOff, Maximize, ZoomIn, Download, X, Ghost, Sun, Moon } from 'lucide-react';
import * as THREE from 'three';
import './App.css';

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
  
  // Initialize all categories as collapsed by default
  const [collapsedCategories, setCollapsedCategories] = useState(() => {
    const cats = [...new Set(initialMeasurements.map(m => m.category))];
    return cats.reduce((acc, cat) => ({ ...acc, [cat]: true }), {});
  });

  const [showLabels, setShowLabels] = useState(true);
  const [modelPos, setModelPos] = useState({ x: 0, y: 0, z: 0 }); 
  const [unit, setUnit] = useState('cm'); 
  const [cameraTargetY, setCameraTargetY] = useState(0); 
  
  const [horizRotation, setHorizRotation] = useState(0);
  const [vertRotation, setVertRotation] = useState(Math.PI / 2); 
  const [lockState, setLockState] = useState({ horiz: false, vert: false });
  
  const [tempPoints, setTempPoints] = useState([]); 
  const [showSummary, setShowSummary] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false); 
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [viewConfigExpanded, setViewConfigExpanded] = useState(false);
  const [modelScale, setModelScale] = useState(1.8);
  const [zoom, setZoom] = useState(8);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const activeMeasurement = measurements.find(m => m.id === activeId);
  const categories = [...new Set(initialMeasurements.map(m => m.category))];

  const handleSelectTask = (id) => {
    setActiveId(prevId => (prevId === id ? null : id));
    setTempPoints([]); 
    setActiveEditId(null);
  };

  const toggleCategory = (category) => {
    const isOpening = !!collapsedCategories[category];
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));
    if (isOpening) {
      if (category === 'Torso & Core') setCameraTargetY(0.5);
      if (category === 'Arms') setCameraTargetY(0.5);
      if (category === 'Legs') setCameraTargetY(-1.2);
      if (category === 'Hands & Feet') setCameraTargetY(-1.6);
      if (category === 'Head & Face') setCameraTargetY(1.4);
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
        <button className="tune-btn" onClick={() => method(id, axis === 'size' ? null : axis, -1)}><Minus size={14} /></button>
        <span className="tune-label">{axis === 'size' ? 'Scale' : `Pos ${axis.toUpperCase()}`}</span>
        <button className="tune-btn" onClick={() => method(id, axis === 'size' ? null : axis, 1)}><Plus size={14} /></button>
      </div>
    </div>
  );

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="canvas-wrapper">
        <CanvasContainer
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
          modelScale={modelScale}
          zoom={zoom}
          modelPos={modelPos}
          unit={unit}
          cameraTargetY={cameraTargetY}
          onSelectMeasurement={handleSelectMeasurement}
          isTransparent={isTransparent}
          theme={theme}
        />

        <div 
          className={`view-config glass-panel ${viewConfigExpanded ? 'expanded' : 'collapsed'}`}
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
                <div className="group-title">Model Transform</div>
                <div className="config-row">
                  <span className="config-label">Scale</span>
                  <input
                    type="range" min="1" max="4" step="0.1"
                    value={modelScale}
                    onChange={(e) => setModelScale(parseFloat(e.target.value))}
                  />
                  <span className="config-value">{modelScale.toFixed(1)}x</span>
                </div>
                <div className="config-row">
                  <span className="config-label">Pos X</span>
                  <input 
                    type="range" min="-5" max="5" step="0.1" 
                    value={modelPos.x} 
                    onChange={(e) => setModelPos(prev => ({ ...prev, x: parseFloat(e.target.value) }))} 
                  />
                  <span className="config-value">{modelPos.x.toFixed(1)}</span>
                </div>
                <div className="config-row">
                  <span className="config-label">Pos Y</span>
                  <input 
                    type="range" min="-10" max="10" step="0.1" 
                    value={modelPos.y} 
                    onChange={(e) => setModelPos(prev => ({ ...prev, y: parseFloat(e.target.value) }))} 
                  />
                  <span className="config-value">{modelPos.y.toFixed(1)}</span>
                </div>
              </div>

              <div className="config-group">
                <div className="group-title">Camera & Orbit</div>
                <div className="config-row">
                  <span className="config-label">Zoom</span>
                  <input
                    type="range" min="3" max="25" step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                  />
                  <span className="config-value">{zoom.toFixed(1)}m</span>
                </div>
                <div className="config-row">
                  <span className="config-label">Orbit</span>
                  <input 
                    type="range" min={-Math.PI} max={Math.PI} step="0.01" 
                    value={horizRotation} 
                    onChange={(e) => setHorizRotation(parseFloat(e.target.value))} 
                  />
                  <button 
                    className={`lock-axis-btn ${lockState.horiz ? 'locked' : ''}`}
                    onClick={() => toggleLock('horiz')}
                  >
                    {lockState.horiz ? <Lock size={12}/> : <Unlock size={12}/>}
                  </button>
                </div>
                <div className="config-row">
                  <span className="config-label">Tilt</span>
                  <input 
                    type="range" min="0" max={Math.PI} step="0.01" 
                    value={vertRotation} 
                    onChange={(e) => setVertRotation(parseFloat(e.target.value))} 
                  />
                  <button 
                    className={`lock-axis-btn ${lockState.vert ? 'locked' : ''}`}
                    onClick={() => toggleLock('vert')}
                  >
                    {lockState.vert ? <Lock size={12}/> : <Unlock size={12}/>}
                  </button>
                </div>
              </div>

              <div className="config-group">
                <div className="group-title">Perspectives</div>
                <div className="viewpoint-grid">
                  <button className="viewpoint-btn" onClick={() => setViewpoint(0, Math.PI / 2)}>Front</button>
                  <button className="viewpoint-btn" onClick={() => setViewpoint(Math.PI, Math.PI / 2)}>Back</button>
                  <button className="viewpoint-btn" onClick={() => setViewpoint(Math.PI / 2, Math.PI / 2)}>Right</button>
                  <button className="viewpoint-btn" onClick={() => setViewpoint(-Math.PI / 2, Math.PI / 2)}>Left</button>
                </div>
              </div>

              <div className="config-group">
                <div className="group-title">Visibility & Units</div>
                <div className="config-row">
                  <span className="config-label">Labels</span>
                  <button 
                    className={`lock-axis-btn ${showLabels ? 'locked' : ''}`}
                    onClick={() => setShowLabels(!showLabels)}
                  >
                    {showLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
                <div className="config-row">
                  <span className="config-label">X-Ray</span>
                  <button 
                    className={`lock-axis-btn ${isTransparent ? 'locked' : ''}`}
                    onClick={() => setIsTransparent(!isTransparent)}
                  >
                    <Ghost size={14} />
                  </button>
                </div>
                <div className="config-row">
                  <span className="config-label">Unit</span>
                  <div className="unit-toggle">
                    <button className={`unit-btn ${unit === 'cm' ? 'active' : ''}`} onClick={() => setUnit('cm')}>CM</button>
                    <button className={`unit-btn ${unit === 'mm' ? 'active' : ''}`} onClick={() => setUnit('mm')}>MM</button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
          <h1>Anthropometric Workstation</h1>
          <p>Surgical-grade 3D measurement suite for clinical body analysis and data extraction.</p>
        </div>

        <div className={`status-indicator ${activeId ? 'measuring' : ''}`} style={{ marginBottom: '20px' }}>
          {activeId ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="pulse-indicator" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
              {activeMeasurement.type === 'circumference'
                ? <span>Select <strong>3 points</strong> for {activeMeasurement.name} ({tempPoints.length}/3)</span>
                : <span>Click <strong>{tempPoints.length === 0 ? 'START' : 'END'}</strong> coordinate on model</span>
              }
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CircleDashed size={14} />
              <span>Select a section below to begin analysis</span>
            </div>
          )}
        </div>

        <div className="measurement-list" style={{ flex: 1 }}>
          {categories.map(category => (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div
                className="category-header"
                style={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 8px'
                }}
                onClick={() => toggleCategory(category)}
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
                  {category}
                </div>
                {collapsedCategories[category] ? <ChevronDown size={14} color="var(--text-secondary)" /> : <ChevronUp size={14} color="var(--text-secondary)" />}
              </div>

              {!collapsedCategories[category] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {measurements.filter(m => m.category === category).map(item => (
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
                              {item.name}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {item.completed ? 'Scan Ready' : (activeId === item.id ? 'Capturing...' : 'Awaiting Data')}
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
                              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Manual Override</span>
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
                              {renderTuneRow('Calibration', 'size', item.id, (id, _, dir) => handleSizeTune(id, dir, item.type))}
                              {renderTuneRow('Axis X', 'x', item.id, handleMoveTune)}
                              {renderTuneRow('Axis Y', 'y', item.id, handleMoveTune)}
                              {renderTuneRow('Axis Z', 'z', item.id, handleMoveTune)}
                            </div>
                            <button 
                              className="btn btn-outline" 
                              onClick={() => handleResetMeasurement(item.id)}
                              style={{ width: '100%', marginTop: '16px', fontSize: '11px', background: 'transparent', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)', padding: '8px', borderRadius: '10px' }}
                            >
                              <RotateCcw size={12} style={{ marginRight: '6px' }} /> Recalibrate Point
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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
          <Maximize size={18} style={{ marginRight: '8px' }} strokeWidth={2.5} /> Generate Full Bio-Report
        </button>
      </div>

      {showSummary && (
        <div className="modal-overlay fade-in">
          <div className="modal-content" style={{ width: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Spatial Identity Report</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Comprehensive biometric data extracted from clinical 3D reconstruction.</p>
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
              {categories.map(category => {
                const results = measurements.filter(m => m.category === category && m.completed);
                if (results.length === 0) return null;
                return (
                  <div key={`modal-${category}`} style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                      {category}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {results.map(item => (
                        <div key={item.id} style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.type === 'circumference' ? <CircleDashed size={10} /> : <Ruler size={10} />}
                            {item.name}
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
                <Download size={18} style={{ marginRight: '8px' }} /> Export Clinical JSON
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, background: 'var(--border-light)', color: 'var(--text-main)', padding: '14px' }} 
                onClick={handleReset}
              >
                <RotateCcw size={16} style={{ marginRight: '8px' }} /> Reset System
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
}

export default App;
