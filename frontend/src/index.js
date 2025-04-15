// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InitialPage from "./components/InitialPage";
import App from "./App";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("No element with id 'root' found in HTML");
}
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
