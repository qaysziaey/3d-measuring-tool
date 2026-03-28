import React, { useState } from 'react';
import { CanvasContainer } from './components/CanvasContainer';
import { Ruler, CheckCircle, RotateCcw, CircleDashed, Lock, Unlock, Settings2, Plus, Minus, UserRound, ChevronUp, ChevronDown, Eye, EyeOff, Maximize, ZoomIn } from 'lucide-react';
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
];

function App() {
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const [activeId, setActiveId] = useState(null);
  const [activeEditId, setActiveEditId] = useState(null); 
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [showLabels, setShowLabels] = useState(true);
  const [modelScale, setModelScale] = useState(1.6);
  const [zoom, setZoom] = useState(12);
  const [unit, setUnit] = useState('cm'); // 'cm' or 'mm'
  const [cameraTargetY, setCameraTargetY] = useState(0); 
  
  const [tempPoint, setTempPoint] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isCameraLocked, setIsCameraLocked] = useState(true);

  const activeMeasurement = measurements.find(m => m.id === activeId);
  const allCompleted = measurements.every(m => m.completed);
  const categories = [...new Set(initialMeasurements.map(m => m.category))];

  const handleSelectTask = (id) => {
    setActiveId(prevId => (prevId === id ? null : id));
    setTempPoint(null);
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

  const handlePointClick = (pointArray) => {
    if (!activeId || activeMeasurement?.type !== 'distance') return;

    if (!tempPoint) {
      setTempPoint(pointArray);
    } else {
      const p1 = new THREE.Vector3(...tempPoint);
      const p2 = new THREE.Vector3(...pointArray);
      
      const distance = p1.distanceTo(p2);
      const scaledDistance = (distance * 15).toFixed(1);

      setMeasurements(prev => prev.map(m => {
        if (m.id === activeId) {
          return { ...m, startPoint: tempPoint, endPoint: pointArray, value: scaledDistance, completed: true };
        }
        return m;
      }));
      setTempPoint(null);
      setActiveId(null);
    }
  };

  const handleCurveCapture = (center, radius) => {
    if (!activeId || activeMeasurement?.type !== 'circumference') return;
    
    const realCenter = center instanceof THREE.Vector3 ? center : new THREE.Vector3(center.x, center.y, center.z);
    
    const circumference = Math.PI * 2 * radius;
    const scaledCircumference = (circumference * 15).toFixed(1);

    setMeasurements(prev => prev.map(m => {
      if (m.id === activeId) {
        return { ...m, center: realCenter, radius: radius, value: scaledCircumference, completed: true };
      }
      return m;
    }));
    setActiveId(null);
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
    setTempPoint(null);
    setShowSummary(false);
    setIsCameraLocked(true); 
  };

  const renderTuneRow = (label, axis, id, method) => (
      <div className="fine-tune-row">
         <span style={{fontSize: '11px', color: 'var(--text-secondary)'}}>{label}</span>
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
    <div className="app-container">
      <div className="sidebar glass-panel fade-in">
        <div className="sidebar-header">
          <h1>Anatomy Metrics</h1>
          <p>Extensive Anthropometric Data Modeling</p>
        </div>

        <div className={`status-indicator ${activeId ? 'measuring' : ''}`}>
          {activeId ? (
            activeMeasurement.type === 'circumference'
              ? <span><strong>HOVER</strong> intersecting {activeMeasurement.name} and single-click to lock computed Circumference radius.</span>
              : tempPoint 
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
                   style={{cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}} 
                   onClick={() => toggleCategory(category)}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
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
                    <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}} onClick={() => handleSelectTask(item.id)}>
                            <div className="measurement-info">
                              <span className="measurement-name" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                {item.type === 'circumference' ? <CircleDashed size={14} color="gray"/> : <Ruler size={14} color="gray"/>}
                                {item.name}
                              </span>
                              <span className="measurement-status">
                                {item.completed ? 'Completed' : (activeId === item.id ? 'Measuring...' : 'Pending')}
                              </span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                                <div className="measurement-value">
                                  {formatValue(item.value)} <span style={{fontSize: '11px', color: 'var(--text-secondary)'}}>{unit}</span>
                                </div>
                                
                                {item.completed ? (
                                    <button 
                                      className={`edit-toggle-btn ${activeEditId === item.id ? 'active' : ''}`}
                                      onClick={(e) => toggleEditor(e, item.id)}
                                      title="Fine-Tune Spatial & Sizing Calibration"
                                    >
                                        <Settings2 size={18} />
                                    </button>
                                ) : (
                                    <div style={{width: 25, display: 'flex', justifyContent: 'center', color: 'var(--border-medium)'}}>
                                      <Ruler size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {activeEditId === item.id && (
                           <div className="fine-tune-panel">
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
          style={{ marginTop: 'auto', padding: '12px', flexShrink: 0 }}
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
          tempPoint={tempPoint}
          onPointClick={handlePointClick}
          onCurveCapture={handleCurveCapture}
          isCameraLocked={isCameraLocked}
          showLabels={showLabels}
          modelScale={modelScale}
          zoom={zoom}
          unit={unit}
          cameraTargetY={cameraTargetY}
          onSelectMeasurement={handleSelectMeasurement}
        />
      </div>

      <div className="right-sidebar fade-in">
          <div className="view-config glass-panel" style={{margin: 0, border: 'none', background: 'transparent'}}>
            <div className="view-config-header" style={{background: 'transparent', border: 'none', paddingLeft: 0}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Maximize size={14} /> View Configuration
               </div>
            </div>
            
            <div className="view-config-body" style={{paddingLeft: 0, paddingRight: 0}}>
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

              <div className="config-row" style={{marginTop: '4px'}}>
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

          <div style={{marginTop: 'auto'}} className="floating-controls-inner">
              <button 
                 className={`floating-btn ${showLabels ? 'unlocked' : 'locked'}`}
                 onClick={() => setShowLabels(!showLabels)}
              >
                {showLabels ? <Eye size={16} /> : <EyeOff size={16} />}
                {showLabels ? "Hide Labels" : "Show Labels"}
              </button>

              <button 
                 className={`floating-btn ${isCameraLocked ? 'locked' : 'unlocked'}`}
                 onClick={() => setIsCameraLocked(!isCameraLocked)}
              >
                {isCameraLocked ? <Lock size={16} /> : <Unlock size={16} />}
                {isCameraLocked ? "3D Rotation Locked" : "3D Navigation Active"}
              </button>
          </div>
      </div>

      {showSummary && (
        <div className="modal-overlay fade-in">
          <div className="modal-content glass-panel" style={{width: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="modal-header">
              <h2>Measurement Report</h2>
              <p>Review comprehensive biometric points extracted from 3D scanning.</p>
            </div>
            
            <div className="results-grid" style={{maxHeight: '400px', overflowY: 'auto'}}>
               {categories.map(category => (
                   <div key={`modal-${category}`} style={{gridColumn: '1 / -1', marginTop: '12px'}}>
                      <h3 style={{fontSize: '14px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px'}}>{category}</h3>
                      <div className="results-grid" style={{marginTop: '12px'}}>
                        {measurements.filter(m => m.category === category).map(item => (
                          <div key={item.id} className="result-card">
                            <div className="result-label" style={{display:'flex', alignItems:'center', gap: '6px'}}>
                              {item.type === 'circumference' ? <CircleDashed size={12}/> : <Ruler size={12} />}
                              {item.name}
                            </div>
                            <div className="result-value">{formatValue(item.value)} <span style={{fontSize: '14px', color: 'var(--text-secondary)'}}>{unit}</span></div>
                          </div>
                        ))}
                      </div>
                   </div>
               ))}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
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
