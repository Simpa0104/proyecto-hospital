import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import App from "./App"; // Adjusted the path to match the correct location

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
