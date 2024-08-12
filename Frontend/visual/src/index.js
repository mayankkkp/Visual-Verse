import React from "react";
import ReactDOM from "react-dom/client"; // Import createRoot from react-dom/client
import "./css/index.css";
import App from "./App";
import Provider from "./store";

// Create a root and render your app
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
