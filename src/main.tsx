import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/index.css";

const THEME_KEY = "intellectum-theme";
try {
  const raw = localStorage.getItem(THEME_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as { state?: { theme?: string } };
    if (parsed.state?.theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark");
    }
  }
} catch {
  /* ignore */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
