import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import "../styles/CustomAlert.css";

function CustomAlert({ text, show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} className="custom-alert">
      <Modal.Header>

      </Modal.Header>
      <Modal.Body className="custom-alert-body">{text}</Modal.Body>
      <Modal.Footer className="custom-alert-footer">
        <Button variant="primary" onClick={onHide} className="OK-button">
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomAlert;
