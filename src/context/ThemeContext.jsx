// ============================================================
//  src/context/ThemeContext.jsx
//
//  RÔLE : Gérer le thème de l'application (clair / sombre / système).
//
//  FONCTIONNEMENT :
//  - "systeme" → suit automatiquement les préférences de l'OS
//  - "clair"   → force le thème clair
//  - "sombre"  → force le thème sombre
//
//  Le choix est sauvegardé dans localStorage pour être conservé
//  entre les sessions (même sans être connecté).
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "systeme"
  );

  const [systemeSombre, setSystemeSombre] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Écouter les changements de thème OS en temps réel
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemeSombre(e.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  // Thème réellement appliqué selon le choix
  const estSombre =
    theme === "sombre" ||
    (theme === "systeme" && systemeSombre);

  // Appliquer sur <html data-theme="sombre|clair">
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      estSombre ? "sombre" : "clair"
    );
    localStorage.setItem("theme", theme);
  }, [theme, estSombre]);

  return (
    <ThemeContext.Provider value={{ theme, estSombre, changerTheme: setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
