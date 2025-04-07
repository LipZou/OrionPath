import React, { useState } from "react";

const DeliveryForm = ({ x, y, onSubmit, onCancel }) => {
  const [startTime, setStartTime] = useState("08:30");
  const [endTime, setEndTime] = useState("09:00");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      x,
      y,
      start_time: startTime,
      end_time: endTime
    });
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>添加送货点 ({x}, {y})</h3>

        <label>
          最早送达时间：
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </label>

        <label>
          最晚送达时间：
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </label>

        <div style={styles.buttons}>
          <button type="submit">确认添加</button>
          <button type="button" onClick={onCancel}>取消</button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "300px"
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between"
  }
};

export default DeliveryForm;