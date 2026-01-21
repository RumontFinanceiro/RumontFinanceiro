import React from "react";
import ReactDOM from "react-dom/client";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "32px",
      fontWeight: "bold"
    }}>
      🔥 RUMONT REACT ESTÁ VIVO 🔥
    </div>
  </React.StrictMode>
);
