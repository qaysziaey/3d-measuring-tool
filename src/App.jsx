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
  const [modelScale, setModelScale] = useState(2.2);
  const [zoom, setZoom] = useState(8);
  const [modelPos, setModelPos] = useState({ x: 0, y: 0, z: 0 }); // Let <Center> handle the verticality
  const [unit, setUnit] = useState('cm'); // 'cm' or 'mm'
  const [cameraTargetY, setCameraTargetY] = useState(0); 
  
  const [horizRotation, setHorizRotation] = useState(0);
  const [vertRotation, setVertRotation] = useState(Math.PI / 2); // 90 degrees (facing center)
  const [lockState, setLockState] = useState({ horiz: false, vert: false });
  
  const [tempPoints, setTempPoints] = useState([]); // Now supports multiple capturing points
  const [showSummary, setShowSummary] = useState(false);
  const [isTransparent, setIsTransparent] = useState(false); 
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const activeMeasurement = measurements.find(m => m.id === activeId);
  const allCompleted = measurements.every(m => m.completed);
  const categories = [...new Set(initialMeasurements.map(m => m.category))];

  const handleSelectTask = (id) => {
    setActiveId(prevId => (prevId === id ? null : id));
    setTempPoints([]); // Reset capture progress
    setActiveEditId(null);
  };

  const toggleCategory = (category) => {
    const isOpening = !!collapsedCategories[category];
    setCollapsedCategories(prev => ({ ...prev, [category]: !prev[category] }));

    // ANATOMICAL AUTO-ZOOM MATRIX:
    // When expanding a category, the 3D world physically pans to that specific anatomical region.
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

    // 1. Ensure category is expanded
    setCollapsedCategories(prev => ({ ...prev, [item.category]: false }));

    // 2. Open the fine-tune editor
    setActiveEditId(id);
    setActiveId(null);

    // 3. Scroll into view
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
    return { center, radius, normal: n }; // Return the 3D orientation normal
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
            // Three point capture completed
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

  const handleCurveCapture = (center, radius) => {
    // This is the old hover capture logic, we now prefer 3-point click.
    // However, I'll keep it as a fallback or hide it for premium feel.
  };

  const handleResetMeasurement = (id) => {
      setMeasurements(prev => prev.map(m => {
          if (m.id === id) {
              return { 
                  ...m, 
                  value: null, 
                  startPoint: null, 
                  endPoint: null, 
                  center: null, 
                  radius: null, 
                  normal: null,
                  completed: false 
              };
          }
          return m;
      }));
      // Also close editor if open
      if (activeEditId === id) setActiveEditId(null);
  };

  const handleManualValueChange = (id, newValue) => {
    setMeasurements(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, value: newValue, completed: true };
      }
      return m;
    }));
  };

  const handleSizeTune = (id, deltaMultiplier, type) => {
    setMeasurements(prev => prev.map(m => {
      if (m.id !== id) return m;
      if (m.type === 'circumference') {
        const newRadius = Math.max(0.01, m.radius + (deltaMultiplier * 0.015));
        const newCircumference = Math.PI * 2 * newRadius;
        return {
          ...m,
          radius: newRadius,
          value: (newCircumference * 15).toFixed(1)
        };
      }
      else if (m.type === 'distance') {
        const p1 = new THREE.Vector3(...m.startPoint);
        const p2 = new THREE.Vector3(...m.endPoint);
        const direction = p2.clone().sub(p1).normalize();
        const newP2 = p2.clone().add(direction.multiplyScalar(deltaMultiplier * 0.05));
        const newDistance = p1.distanceTo(newP2);
        return {
          ...m,
          endPoint: newP2.toArray(),
          value: (newDistance * 15).toFixed(1)
        };
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
        return {
          ...m,
          startPoint: p1.toArray(),
          endPoint: p2.toArray()
        };
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
      metadata: {
        appName: "Anatomy Metrics 3D",
        timestamp: new Date().toISOString(),
        totalMeasurements: completedResults.length,
        globalUnit: unit
      },
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
        <button className="tune-btn" onClick={() => method(id, axis === 'size' ? null : axis, -1)}>
          <Minus size={14} />
        </button>
        <span className="tune-label">
          {axis === 'size' ? 'Scale' : `Pos ${axis.toUpperCase()}`}
        </span>
        <button className="tune-btn" onClick={() => method(id, axis === 'size' ? null : axis, 1)}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="sidebar fade-in">
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserRound size={24} color="var(--accent-primary)" />
              Anthropometric Workstation
            </h1>
            <p>Surgical-grade 3D measurement suite for clinical body analysis.</p>
          </div>
          <button 
            className="btn-icon theme-toggle" 
            onClick={toggleTheme}
            style={{ 
              background: 'var(--border-light)', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className={`status-indicator ${activeId ? 'measuring' : ''}`}>
          {activeId ? (
            activeMeasurement.type === 'circumference'
              ? <span><strong>Select 3 Points</strong> around the {activeMeasurement.name} ({tempPoints.length}/3)</span>
              : tempPoints.length > 0
                ? <span>Click your <strong>END</strong> coordinate directly on custom model</span>
                : <span>Click your <strong>START</strong> coordinate directly on custom model</span>
          ) : (
            <span>Select a section below to begin measuring.</span>
          )}
        </div>

        <div className="measurement-list">
          {categories.map(category => (
            <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                className="category-header"
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                onClick={() => toggleCategory(category)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserRound size={14} /> {category}
                </div>
                {collapsedCategories[category] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </div>

              {!collapsedCategories[category] && measurements.filter(m => m.category === category).map(item => (
                <div
                  key={item.id}
                  id={`item-${item.id}`}
                  className={`measurement-item ${activeId === item.id ? 'active' : ''} ${item.completed ? 'completed' : ''} ${activeEditId === item.id ? 'editing' : ''}`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <div className="measurement-info" onClick={() => handleSelectTask(item.id)}>
                            <span className="measurement-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {item.type === 'circumference' ? <CircleDashed size={14} color="gray" /> : <Ruler size={14} color="gray" />}
                              {item.name}
                            </span>
                            <span className="measurement-status">
                              {item.completed ? 'Completed' : (activeId === item.id ? `Measuring... (${tempPoints.length}/${item.type === 'circumference' ? 3 : 2})` : 'Pending')}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div className="measurement-value">
                              {formatValue(item.value)} <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{unit}</span>
                            </div>

                            {activeId === item.id ? (
                               <button 
                                 className="btn-icon cancel"
                                 onClick={() => handleSelectTask(item.id)}
                                 title="Cancel Capture"
                                 style={{color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px'}}
                               >
                                 <X size={18} />
                               </button>
                            ) : item.completed ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  className={`edit-toggle-btn ${activeEditId === item.id ? 'active' : ''}`}
                                  onClick={(e) => toggleEditor(e, item.id)}
                                  title="Fine-Tune Spatial & Sizing Calibration"
                                >
                                  <Settings2 size={18} />
                                </button>
                                <button
                                  className="btn-icon reset"
                                  onClick={() => handleResetMeasurement(item.id)}
                                  title="Clear & Redo Measurement"
                                  style={{color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px'}}
                                >
                                  <RotateCcw size={16} />
                                </button>
                              </div>
                            ) : (
                              <div style={{ width: 25, display: 'flex', justifyContent: 'center', color: 'var(--border-medium)', cursor: 'pointer' }} onClick={() => handleSelectTask(item.id)}>
                                <Ruler size={16} />
                              </div>
                            )}
                          </div>
                        </div>

                    {activeEditId === item.id && (
                      <div className="fine-tune-panel">
                        <div className="tune-row" style={{ marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                          <span className="tune-label" style={{ flex: 1 }}>Edit Value ({unit})</span>
                          <input 
                            type="text"
                            value={item.value || ''}
                            onChange={(e) => handleManualValueChange(item.id, e.target.value)}
                            style={{
                              width: '80px',
                              background: 'var(--bg-app)',
                              border: '1px solid var(--border-light)',
                              color: 'var(--text-main)',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              fontSize: '12px',
                              textAlign: 'right',
                              outline: 'none',
                              fontWeight: '600'
                            }}
                          />
                        </div>
                        {renderTuneRow('Magnitude', 'size', item.id, (id, _, dir) => handleSizeTune(id, dir, item.type))}
                        {renderTuneRow('Translate X', 'x', item.id, handleMoveTune)}
                        {renderTuneRow('Translate Y', 'y', item.id, handleMoveTune)}
                        {renderTuneRow('Translate Z', 'z', item.id, handleMoveTune)}
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ 
            marginTop: 'auto', 
            padding: '12px', 
            flexShrink: 0,
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(86, 164, 50, 0.2)'
          }}
          disabled={!measurements.some(m => m.completed)}
          onClick={() => setShowSummary(true)}
        >
          View Final Report
        </button>
      </div>

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
      </div>

      <div className="view-config glass-panel fade-in" style={{ width: '260px', flexShrink: 0 }}>
        <div className="view-config-header">
          <Maximize size={14} /> View Configuration
        </div>

        <div className="view-config-body">
            <div className="config-row">
              <span className="config-label">Model Height</span>
              <input
                type="range" min="1" max="4" step="0.1"
                value={modelScale}
                onChange={(e) => setModelScale(parseFloat(e.target.value))}
              />
              <span className="config-value">{modelScale.toFixed(1)}x</span>
            </div>
            <div className="config-row">
              <span className="config-label">Camera Zoom</span>
              <input
                type="range" min="3" max="25" step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
              <span className="config-value">{zoom.toFixed(1)}m</span>
            </div>

              <div className="config-row">
                <span className="config-label">Translate X</span>
                <input 
                  type="range" min="-5" max="5" step="0.1" 
                  value={modelPos.x} 
                  onChange={(e) => setModelPos(prev => ({ ...prev, x: parseFloat(e.target.value) }))} 
                />
                <span className="config-value">{modelPos.x.toFixed(1)}</span>
              </div>
              <div className="config-row">
                <span className="config-label">Translate Y</span>
                <input 
                  type="range" min="-10" max="10" step="0.1" 
                  value={modelPos.y} 
                  onChange={(e) => setModelPos(prev => ({ ...prev, y: parseFloat(e.target.value) }))} 
                />
                <span className="config-value">{modelPos.y.toFixed(1)}</span>
              </div>
              <div className="config-row">
                <span className="config-label">Translate Z</span>
                <input 
                  type="range" min="-5" max="5" step="0.1" 
                  value={modelPos.z} 
                  onChange={(e) => setModelPos(prev => ({ ...prev, z: parseFloat(e.target.value) }))} 
                />
                <span className="config-value">{modelPos.z.toFixed(1)}</span>
              </div>

              <div className="config-row">
                <span className="config-label">Horizontal Rot.</span>
              <input 
                type="range" min={-Math.PI} max={Math.PI} step="0.01" 
                value={horizRotation} 
                onChange={(e) => setHorizRotation(parseFloat(e.target.value))} 
              />
              <button 
                className={`lock-axis-btn ${lockState.horiz ? 'locked' : ''}`}
                onClick={() => toggleLock('horiz')}
                title="Lock Horizontal Orbit"
              >
                {lockState.horiz ? <Lock size={12}/> : <Unlock size={12}/>}
              </button>
            </div>

            <div className="config-row">
              <span className="config-label">Vertical Tilt</span>
              <input 
                type="range" min="0" max={Math.PI} step="0.01" 
                value={vertRotation} 
                onChange={(e) => setVertRotation(parseFloat(e.target.value))} 
              />
              <button 
                className={`lock-axis-btn ${lockState.vert ? 'locked' : ''}`}
                onClick={() => toggleLock('vert')}
                title="Lock Vertical Tilt"
              >
                {lockState.vert ? <Lock size={12}/> : <Unlock size={12}/>}
              </button>
            </div>

              <div className="config-row" style={{ marginTop: '8px', borderTop: '1px solid var(--border-light)', paddingTop: '12px' }}>
                <span className="config-label">Standard Perspectives</span>
              </div>
              <div className="viewpoint-grid">
                <button className="viewpoint-btn" onClick={() => setViewpoint(0, Math.PI / 2)}>Front</button>
                <button className="viewpoint-btn" onClick={() => setViewpoint(Math.PI, Math.PI / 2)}>Back</button>
                <button className="viewpoint-btn" onClick={() => setViewpoint(Math.PI / 2, Math.PI / 2)}>Right</button>
                <button className="viewpoint-btn" onClick={() => setViewpoint(-Math.PI / 2, Math.PI / 2)}>Left</button>
                <button className="viewpoint-btn" onClick={() => setViewpoint(0, 0.05)}>Top</button>
                <button className="viewpoint-btn" onClick={() => setViewpoint(0, Math.PI - 0.05)}>Bottom</button>
              </div>

              <div className="config-row" style={{ marginTop: '12px' }}>
                <span className="config-label">Annotation Labels</span>
                <button 
                  className={`lock-axis-btn ${showLabels ? 'locked' : ''}`}
                  onClick={() => setShowLabels(!showLabels)}
                  title="Toggle Visibility of 3D Measurement Tags"
                >
                  {showLabels ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>

              <div className="config-row" style={{ marginTop: '4px' }}>
                <span className="config-label">X-Ray Mode</span>
                <button 
                  className={`lock-axis-btn ${isTransparent ? 'locked' : ''}`}
                  onClick={() => setIsTransparent(!isTransparent)}
                  title="Toggle Model Transparency"
                >
                  <Ghost size={14} />
                </button>
              </div>

              <div className="config-row" style={{ marginTop: '4px' }}>
              <span className="config-label">Measuring Unit</span>
              <div className="unit-toggle">
                <button
                  className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
                  onClick={() => setUnit('cm')}
                >cm</button>
                <button
                  className={`unit-btn ${unit === 'mm' ? 'active' : ''}`}
                  onClick={() => setUnit('mm')}
                >mm</button>
              </div>
            </div>
          </div>
        </div>

      {showSummary && (
        <div className="modal-overlay fade-in">
          <div className="modal-content glass-panel" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Measurement Report</h2>
              <p>Review comprehensive biometric points extracted from 3D scanning.</p>
            </div>

            <div className="results-grid" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {categories.map(category => (
                <div key={`modal-${category}`} style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>{category}</h3>
                  <div className="results-grid" style={{ marginTop: '12px' }}>
                    {measurements.filter(m => m.category === category).map(item => (
                      <div key={item.id} className="result-card">
                        <div className="result-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.type === 'circumference' ? <CircleDashed size={12} /> : <Ruler size={12} />}
                          {item.name}
                        </div>
                        <div className="result-value">{formatValue(item.value)} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{unit}</span></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleExportJSON}>
                <Download size={16} style={{ marginRight: '8px' }} /> Download JSON
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowSummary(false)}>
                Confirm & Save
              </button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleReset}>
                <RotateCcw size={16} /> Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
