import React from 'react';
import '../styles/SidePanel.css';

const SidePanel = ({ onComputePlan, onClearAll, mode, setMode }) => {
  return (
    <nav className="side-panel">
      <div className="mode-buttons">
        <button 
          onClick={() => setMode('delivery')} 
          className={`mode-button ${mode === 'delivery' ? 'active' : ''}`}
        >
          <span role="img" aria-label="package">📦</span>
          添加送货点
        </button>
        <button 
          onClick={() => setMode('edge')} 
          className={`mode-button ${mode === 'edge' ? 'active' : ''}`}
        >
          <span role="img" aria-label="arrows">↔️</span>
          编辑边
        </button>
      </div>
      <div className="action-buttons">
        <button className="plan-button" onClick={onComputePlan}>
          <span role="img" aria-label="rocket">🚀</span>
          路径规划
        </button>
        <button className="clear-button" onClick={onClearAll}>
          <span role="img" aria-label="wastebasket">🗑️</span>
          清空送货点
        </button>
      </div>
    </nav>
  );
};

export default SidePanel;