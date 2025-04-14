// DeliveryForm.jsx
import React, { useState, useRef } from "react";
import "../styles/DeliveryForm.css";

const DeliveryForm = ({ x, y, onSubmit, onDelete, onCancel }) => {
  const [earliest, setEarliest] = useState("08:30");
  const [latest, setLatest] = useState("09:30");
  const earliestRef = useRef(null);
  const latestRef = useRef(null);

  const handleSubmit = () => {
    onSubmit({
      location: [x, y],
      time_window: [earliest, latest],
    });
  };

  const handleDelete = () => {
    onDelete([x, y]);
  };

  const validateTimeRange = () => {
    return earliest <= latest;
  };

  const openTimePicker = (inputRef) => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  return (
    <>
      <div className="add-node-modal-backdrop" onClick={onCancel}></div>
      <div className="add-node-modal">
        <div className="add-node-header">
          <h3 className="add-node-title">📦 添加 / 编辑送货节点 <span className="location-display">({x}, {y})</span></h3>
        </div>
        <div className="add-node-form">
          <div className="time-input-group">
            <div className="time-input-label">最早到达时间:</div>
            <div className="time-picker-container" onClick={() => openTimePicker(earliestRef)}>
              <input 
                ref={earliestRef}
                type="time"
                className="time-picker" 
                value={earliest} 
                onChange={e => setEarliest(e.target.value)} 
                min="06:00"
                max="22:00"
              />
              <div 
                className="time-picker-icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  openTimePicker(earliestRef);
                }}
              >
                🕒
              </div>
            </div>
          </div>
          <div className="time-input-group">
            <div className="time-input-label">最晚到达时间:</div>
            <div className="time-picker-container" onClick={() => openTimePicker(latestRef)}>
              <input 
                ref={latestRef}
                type="time"
                className="time-picker" 
                value={latest} 
                onChange={e => setLatest(e.target.value)} 
                min={earliest}
                max="23:59"
              />
              <div 
                className="time-picker-icon" 
                onClick={(e) => {
                  e.stopPropagation();
                  openTimePicker(latestRef);
                }}
              >
                🕒
              </div>
            </div>
          </div>
          {!validateTimeRange() && (
            <div className="time-error-message">最早到达时间不能晚于最晚到达时间</div>
          )}
          <div className="button-group">
            <button 
              className="confirm-button" 
              onClick={handleSubmit}
              disabled={!validateTimeRange()}
            >
              确定
            </button>
            <button className="cancel-button" onClick={onCancel}>取消</button>
            <button className="delete-button" onClick={handleDelete}>删除</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryForm;