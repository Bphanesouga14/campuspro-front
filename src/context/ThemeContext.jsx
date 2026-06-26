import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

// 3 thèmes disponibles
export const THEMES = {
  systeme:  { id: "systeme",  label: "Système",         icone: "🖥️" },
  lumiere:  { id: "lumiere",  label: "Lumière",         icone: "☀️" },
  emeraude: { id: "emeraude", label: "Émeraude",        icone: "🌿" },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("lgs-theme") || "systeme");
  const [systemeSombre, setSystemeSombre] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const h = (e) => setSystemeSombre(e.matches);
    media.addEventListener("change", h);
    return () => media.removeEventListener("change", h);
  }, []);

  useEffect(() => {
    let applique = theme;
    if (theme === "systeme") applique = systemeSombre ? "emeraude" : "lumiere";
    document.documentElement.setAttribute("data-theme", applique);
    localStorage.setItem("lgs-theme", theme);
  }, [theme, systemeSombre]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
