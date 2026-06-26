import { useState, useRef, useEffect } from "react";
import { useTheme, THEMES } from "../context/ThemeContext";
import { Monitor, Sun, Leaf, Check } from "lucide-react";

const ICONES = { systeme: Monitor, lumiere: Sun, emeraude: Leaf };

export default function SelecteurTheme({ mode = "auto" }) {
  const { theme, setTheme, estSombre } = useTheme();
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOuvert(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const IconeActive = ICONES[theme] || Monitor;

  return (
    <div className="theme-pill" ref={ref}>
      {/* Bouton rond avec juste l'icône */}
      <button
        className="theme-pill-btn"
        onClick={() => setOuvert(!ouvert)}
        title="Changer le thème"
        aria-label="Sélecteur de thème"
      >
        <IconeActive size={16}/>
      </button>

      {/* Dropdown vers le BAS */}
      {ouvert && (
        <div className="theme-pill-menu">
          <div className="theme-pill-label">Thème d'affichage</div>
          {Object.values(THEMES).map((t) => {
            const Icone = ICONES[t.id];
            return (
              <button key={t.id}
                className={`theme-option ${theme===t.id?"actif":""}`}
                onClick={()=>{ setTheme(t.id); setOuvert(false); }}>
                <div className={`theme-option-icon-wrap ${theme===t.id?"actif":""}`}>
                  <Icone size={15}/>
                </div>
                <span>{t.label}</span>
                {theme===t.id && <Check size={13} className="theme-option-check"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
