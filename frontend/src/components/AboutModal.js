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
                <p>
                    Here be some text
                </p>
            </div>
        </>

    );
};

export default AboutModal;