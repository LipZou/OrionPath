// src/components/InitialPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/InitialPage.css"; // Optional: add styling as needed

const InitialPage = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    // Navigate to the current App page (we're using '/app' as its path)
    navigate("/app");
  };

  return (
    <div className="initial-page">
      <h1>Welcome to the Intelligent Delivery Map System</h1>
      <button onClick={handleEnter}>Enter</button>
    </div>
  );
};

export default InitialPage;
