import "../styles/AboutModal.css";
import React from "react";


const AboutModal = ({onClose}) => {
    return (
        <>
            <div className="about-modal-backdrop" onClick={onClose}></div>
            <div className="about-modal">
                <div className="about-header">
                    <h3 className="about-title">About Our Project</h3>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                </div>
                <p className="welcome-text">
                    Welcome!
                </p>
                <p className="about-text">
                    This application was developed to optimize delivery routes with
                    customized time windows according to the needs of delivery drivers. To add delivery stops, click on
                    "📦 Add Delivery Stop" in the bottom panel and select a node on the map. To edit an edge, click on
                    "↔️ Edit Edge" and select an edge on the map. To start over, click on "🗑️ Clear Delivery Stops".
                </p>
                <p className="enjoy-text">
                    Enjoy!
                </p>
            </div>
        </>

    );
};

export default AboutModal;