import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/anton/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource/cormorant-garamond/latin-600-italic.css";
import "@fontsource/inconsolata/latin-400.css";
import "@fontsource/inconsolata/latin-600.css";
import "@fontsource/inconsolata/latin-800.css";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
