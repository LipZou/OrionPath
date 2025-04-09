// DeliveryForm.jsx
import React, { useState } from "react";

const DeliveryForm = ({ x, y, onSubmit, onDelete, onCancel }) => {
  const [earliest, setEarliest] = useState("08:30");
  const [latest, setLatest] = useState("09:30");

  const handleSubmit = () => {
    onSubmit({
      location: [x, y],
      time_window: [earliest, latest],
    });
  };

  const handleDelete = () => {
    onDelete([x, y]);
  };

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "white",
      border: "2px solid #ccc",
      borderRadius: 8,
      padding: 20,
      zIndex: 1001,
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
    }}>
      <h3>📦 添加 / 编辑送货点 ({x}, {y})</h3>
      <div>
        最早到达: <input value={earliest} onChange={e => setEarliest(e.target.value)} />
      </div>
      <div>
        最晚到达: <input value={latest} onChange={e => setLatest(e.target.value)} />
      </div>
      <div style={{ marginTop: 10 }}>
        <button onClick={handleSubmit}>确定</button>
        <button onClick={onCancel} style={{ marginLeft: 10 }}>取消</button>
        <button onClick={handleDelete} style={{ marginLeft: 10, color: "red" }}>删除</button>
      </div>
    </div>
  );
};

export default DeliveryForm;