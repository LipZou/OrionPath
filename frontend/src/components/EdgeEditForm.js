import React, {useState} from "react";
import "../styles/EdgeEditForm.css";

const EdgeEditForm = ({edge, onSubmit, onCancel}) => {
    const [weight, setWeight] = useState(edge.weight.toFixed(2));
    const [blocked, setBlocked] = useState(edge.blocked);

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsed = parseFloat(weight);
        if (isNaN(parsed) || parsed <= 0) {
            alert("Please enter a valid time it takes");
            return;
        }
        onSubmit({from: edge.from, to: edge.to, weight: parsed, blocked});
    };

    return (
        <>
            <div className="edit-modal-backdrop" onClick={onCancel}></div>
            <div style={styles.overlay}>
                <form className="edit-model-container" onSubmit={handleSubmit} style={styles.form}>
                <h3>Edit Edge</h3>
                <p>
                    {JSON.stringify(edge.from)} → {JSON.stringify(edge.to)}
                </p>

                <label>
                    Time it takes（minute）:
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
                    Road Blocked
                </label>

                <div style={styles.buttons}>
                    <button type="submit">Submit</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            </form>
            </div>

        </>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1001
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