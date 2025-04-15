import React from 'react';
import '../styles/SidePanel.css';

const SidePanel = ({ onComputePlan, onClearAll, mode, setMode, setShowAboutModal }) => {
  return (
    <nav className="side-panel">
      <div className="mode-buttons">
        <button 
          onClick={() => setMode('delivery')} 
          className={`mode-button ${mode === 'delivery' ? 'active' : ''}`}
        >
          <span role="img" aria-label="package">📦</span>
          Add Delivery Stop
        </button>
        <button 
          onClick={() => setMode('edge')} 
          className={`mode-button ${mode === 'edge' ? 'active' : ''}`}
        >
          <span role="img" aria-label="arrows">↔️</span>
          Edit Edge
        </button>
      </div>
      <div className="action-buttons">
        <button className="plan-button" onClick={onComputePlan}>
          <span role="img" aria-label="rocket">🚀</span>
          Route Planning
        </button>
        <button className="clear-button" onClick={onClearAll}>
          <span role="img" aria-label="wastebasket">🗑️</span>
          Clear Delivery Stops
        </button>
        <button className="about-button" onClick={() => {setShowAboutModal(true)}}>❓</button>
      </div>
    </nav>
  );
};

export default SidePanel;