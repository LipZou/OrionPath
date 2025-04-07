import React, { useState } from "react";

const EdgeEditForm = ({ edge, onSubmit, onCancel }) => {
  const [weight, setWeight] = useState(edge.weight.toFixed(2));
  const [blocked, setBlocked] = useState(edge.blocked);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(weight);
    if (isNaN(parsed) || parsed <= 0) {
      alert("请输入有效的耗时数字");
      return;
    }
    onSubmit({ from: edge.from, to: edge.to, weight: parsed, blocked });
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>编辑边</h3>
        <p>
          {JSON.stringify(edge.from)} → {JSON.stringify(edge.to)}
        </p>

        <label>
          耗时（分钟）:
          <input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={blocked}
            onChange={(e) => setBlocked(e.target.checked)}
          />
          封路
        </label>

        <div style={styles.buttons}>
          <button type="submit">确认</button>
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

export default EdgeEditForm;