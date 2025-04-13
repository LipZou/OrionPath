// DeliveryForm.jsx
import React, { useState } from "react";
import "../styles/DeliveryForm.css";

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
    <>
      <div className="add-node-modal-backdrop"></div>
      <div className="add-node-modal">
        <div className="add-node-header">
          <h3 className="add-node-title">📦 添加 / 编辑送货节点 <span className="location-display">({x}, {y})</span></h3>
        </div>
        <div className="add-node-form">
          <div className="time-input-group">
            <div className="time-input-label">最早到达:</div>
            <input 
              className="time-input" 
              value={earliest} 
              onChange={e => setEarliest(e.target.value)} 
            />
          </div>
          <div className="time-input-group">
            <div className="time-input-label">最晚到达:</div>
            <input 
              className="time-input" 
              value={latest} 
              onChange={e => setLatest(e.target.value)} 
            />
          </div>
          <div className="button-group">
            <button className="confirm-button" onClick={handleSubmit}>确定</button>
            <button className="cancel-button" onClick={onCancel}>取消</button>
            <button className="delete-button" onClick={handleDelete}>删除</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryForm;