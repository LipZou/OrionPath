import React from "react";

const SidePanel = ({ onComputePlan, onClearAll }) => {
  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={onComputePlan}>🚀 路径规划</button>
      <button onClick={onClearAll} style={{ marginLeft: 10, color: "red" }}>🗑️ 清空送货点</button>
    </div>
  );
};

export default SidePanel;