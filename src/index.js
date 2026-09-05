import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { RagProvider } from "./context/RagContext"; // Import RagProvider của bạn
import "leaflet/dist/leaflet.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <UserProvider>
    <RagProvider>
      <App />
    </RagProvider>
  </UserProvider>,
);
