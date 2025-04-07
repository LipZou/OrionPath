import React from "react";

const SidePanel = ({ onComputePlan }) => {
  return (
    <div style={styles.panel}>
      <h3>控制面板</h3>
      <button onClick={onComputePlan} style={styles.button}>
        🚀 开始路径规划
      </button>
    </div>
  );
};

const styles = {
  panel: {
    position: "absolute",
    top: 20,
    right: 20,
    background: "#fff",
    padding: "16px",
    border: "1px solid #ccc",
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  button: {
    padding: "8px 16px",
    fontSize: 16,
    cursor: "pointer"
  }
};

export default SidePanel;