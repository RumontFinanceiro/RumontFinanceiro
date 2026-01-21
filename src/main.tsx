import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <h1 style={{ textAlign: "center", marginTop: 100 }}>
      🚀 Rumont Funcionando 🚀
    </h1>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
