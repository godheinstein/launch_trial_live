import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider } from "convex/react";
import "./index.css";
import App from "./App.tsx";
import { convexClient } from "./lib/convexClient";

const tree = convexClient ? (
  <ConvexProvider client={convexClient}>
    <App />
  </ConvexProvider>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(<StrictMode>{tree}</StrictMode>);
