import React, {useState} from "react";
import "../styles/EdgeEditForm.css";

const EdgeEditForm = ({edge, onSubmit, onCancel, showAlert}) => {
    const [weight, setWeight] = useState(edge.weight.toFixed(2));
    const [blocked, setBlocked] = useState(edge.blocked);

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsed = parseFloat(weight);
        if (isNaN(parsed) || parsed <= 0) {
            showAlert("Please enter a valid time");
            return;
        }
        onSubmit({from: edge.from, to: edge.to, weight: parsed, blocked});
    };

    return (
        <>
            <div className="edge-modal-backdrop" onClick={onCancel}></div>
            <div className="edge-modal-container">
                <div className="edge-modal-header">
                    <h3 className="edge-modal-title">➼ Edit Edge</h3>
                </div>
                <div className="edge-form">
                    <div className="edge-info">
                        [{edge.from[0]},{edge.from[1]}] → [{edge.to[0]},{edge.to[1]}]
                    </div>
                    
                    <div className="input-group">
                        <div className="input-label">Time it takes (minutes):</div>
                        <input
                            type="number"
                            step="0.01"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="time-input"
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            checked={blocked}
                            onChange={(e) => setBlocked(e.target.checked)}
                            className="checkbox-input"
                            id="blocked"
                        />
                        <label htmlFor="blocked" className="checkbox-label">
                            Road Blocked
                        </label>
                    </div>

                    <div className="button-group">
                        <button type="button" className="confirm-button" onClick={handleSubmit}>
                            Submit
                        </button>
                        <button type="button" className="cancel-button" onClick={onCancel}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EdgeEditForm;