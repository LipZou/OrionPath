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
                    Welcome! This application was developed to optimize delivery routes with
                    customized time windows according to the needs of delivery drivers.

                </p>
            </div>
        </>

    );
};

export default AboutModal;