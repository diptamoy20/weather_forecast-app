import { useState, useEffect } from "react";
import Home from "./pages/Home";
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("weather_dark_mode") === "true";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("weather_dark_mode", darkMode);
  }, [darkMode]);

  return (
    <div className="app-wrapper">
      <Home darkMode={darkMode} toggleDark={() => setDarkMode((d) => !d)} />
    </div>
  );
}
