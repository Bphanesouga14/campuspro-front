import { useTheme } from "../context/ThemeContext";

const OPTIONS = [
  { valeur: "systeme", icone: "🖥", label: "Système" },
  { valeur: "clair",   icone: "☀️", label: "Clair"   },
  { valeur: "sombre",  icone: "🌙", label: "Sombre"  },
];

export default function SelecteurTheme({ compact = false }) {
  const { theme, changerTheme } = useTheme();

  return (
    <div className={`selecteur-theme ${compact ? "compact" : ""}`}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.valeur}
          className={`theme-btn ${theme === opt.valeur ? "actif" : ""}`}
          onClick={() => changerTheme(opt.valeur)}
          title={opt.label}
          aria-label={`Thème ${opt.label}`}
        >
          <span className="theme-icone">{opt.icone}</span>
          {!compact && <span className="theme-label">{opt.label}</span>}
        </button>
      ))}
    </div>
  );
}
