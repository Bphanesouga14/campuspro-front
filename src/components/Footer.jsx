import { GraduationCap, Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="page-footer">
      <div className="page-footer-inner">
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <GraduationCap size={13} style={{color:"var(--primary)"}}/>
          <strong style={{color:"var(--text2)",fontSize:"0.78rem"}}>CampusPro</strong>
          <span style={{color:"var(--text3)"}}>·</span>
          <Shield size={11} style={{color:"var(--text3)"}}/>
          <span>Plateforme sécurisée</span>
        </div>
        <div>© {new Date().getFullYear()} CampusPro — Tous droits réservés</div>
      </div>
    </footer>
  );
}
