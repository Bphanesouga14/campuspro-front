import { useNavigate } from "react-router-dom";
import SelecteurTheme from "../components/SelecteurTheme";
import Footer from "../components/Footer";
import {
  GraduationCap, CreditCard, QrCode, Upload,
  Users, Bell, BarChart3, ShieldCheck, ArrowRight,
  CheckCircle2, Smartphone, Globe, Lock
} from "lucide-react";

const FONCTIONNALITES = [
  {
    Icon: GraduationCap, titre:"Gestion des étudiants",
    desc:"Enregistrez, consultez et gérez facilement les dossiers de chaque étudiant : informations personnelles, scolarité et contacts des parents.",
    couleur:"blue"
  },
  {
    Icon: CreditCard, titre:"Suivi des paiements",
    desc:"Gérez les tranches de paiement par étudiant, enregistrez les versements en temps réel et identifiez instantanément les retards.",
    couleur:"green"
  },
  {
    Icon: QrCode, titre:"QR Codes automatiques",
    desc:"Un QR code unique est généré automatiquement à chaque paiement soldé. Téléchargeable et imprimable en un clic.",
    couleur:"purple"
  },
  {
    Icon: Bell, titre:"Notifications parents",
    desc:"Les parents sont automatiquement notifiés par SMS ou email après chaque paiement : confirmation, paiement partiel ou rappel.",
    couleur:"orange"
  },
  {
    Icon: Upload, titre:"Import Excel",
    desc:"Importez en masse vos données depuis le fichier Excel officiel de l'établissement. Spécialités, étudiants, paiements en une seule opération.",
    couleur:"red"
  },
  {
    Icon: BarChart3, titre:"Tableau de bord",
    desc:"Vue d'ensemble financière en temps réel : taux de recouvrement, montants versés, étudiants à jour et dernières activités du personnel.",
    couleur:"blue"
  },
];

const ROLES = [
  { Icon:ShieldCheck, role:"Administrateur", desc:"Accès complet : gestion des utilisateurs, de toutes les données et vue globale de l'établissement.", couleur:"red" },
  { Icon:Users,       role:"Secrétaire",     desc:"Gestion des étudiants, des spécialités et import des données depuis Excel.", couleur:"blue" },
  { Icon:CreditCard,  role:"Caissier",       desc:"Enregistrement des versements, suivi des paiements et génération des QR codes.", couleur:"green" },
];

const STATS = [
  { valeur:"3",      unite:"Rôles",          Icon:Lock      },
  { valeur:"100%",   unite:"Sécurisé JWT",   Icon:ShieldCheck },
  { valeur:"∞",      unite:"Étudiants",      Icon:GraduationCap },
  { valeur:"Auto",   unite:"QR Codes",       Icon:QrCode    },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <div className="logo-icon" style={{width:36,height:36}}>
            <GraduationCap size={20} color="white"/>
            
</div>
          <span className="landing-nav-name">CampusPro</span>
          
</div>
        <div className="landing-nav-actions">
          <SelecteurTheme/>
          <button className="btn btn-primary" onClick={()=>navigate("/login")}>
            Se connecter <ArrowRight size={14}/>
          </button>
          
</div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="hero-blob hero-blob-1"/>
          <div className="hero-blob hero-blob-2"/>
          <div className="hero-blob hero-blob-3"/>
          
</div>
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <ShieldCheck size={13}/> Plateforme sécurisée · Cameroun
            
</div>
          <h1 className="landing-hero-title">
            La gestion scolaire<br/>
            <span className="landing-hero-accent">intelligente et moderne</span>
          </h1>
          <p className="landing-hero-desc">
            CampusPro centralise la gestion de vos étudiants, le suivi des paiements,
            la génération automatique de QR codes et les notifications aux parents —
            le tout dans une interface professionnelle et sécurisée.
          </p>
          <div className="landing-hero-btns">
            <button className="btn btn-landing-primary" onClick={()=>navigate("/login")}>
              Accéder à la plateforme <ArrowRight size={16}/>
            </button>
            
</div>
          
</div>

        {/* ── Stats ── */}
        <div className="landing-stats">
          {STATS.map((s,i) => (
            <div key={i} className="landing-stat">
              <s.Icon size={20} className="landing-stat-icon"/>
              <div className="landing-stat-valeur">{s.valeur} 
</div>
              <div className="landing-stat-unite">{s.unite}  
</div>
              
</div>
          ))}
         
</div>
      </section>

      {/* ── Fonctionnalités ── */}
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Tout ce dont vous avez besoin</h2>
          <p className="landing-section-sub">
            Une solution complète pensée pour les établissements d'enseignement supérieur
          </p>
          
</div>
        <div className="landing-features-grid">
          {FONCTIONNALITES.map((f,i) => (
            <div key={i} className="landing-feature-card">
              <div className={`landing-feature-icon color-${f.couleur}`}>
                <f.Icon size={24}/>
                
</div>
              <h3 className="landing-feature-titre">{f.titre}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
              
</div>
          ))}
          
</div>
      </section>

      {/* ── Rôles ── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Un accès adapté à chaque rôle</h2>
          <p className="landing-section-sub">
            Trois niveaux d'accès sécurisés pour une gestion efficace et confidentielle
          </p>
          
</div>
        <div className="landing-roles-grid">
          {ROLES.map((r,i) => (
            <div key={i} className="landing-role-card">
              <div className={`landing-role-icon color-${r.couleur}`}>
                <r.Icon size={28}/>
                
</div>
              <h3 className="landing-role-titre">{r.role}</h3>
              <p className="landing-role-desc">{r.desc}</p>
              <div className="landing-role-check">
                <CheckCircle2 size={14} style={{color:`var(--${r.couleur})`}}/>
                <span>Accès sécurisé JWT</span>
                
</div>
              
</div>
          ))}
          
</div>
      </section>

      {/* ── CTA final ── */}
      <section className="landing-cta">
        <div className="landing-cta-content">
          <div className="landing-cta-icons">
            <Smartphone size={32}/><Globe size={32}/><Lock size={32}/>
           
</div>
          <h2>Prêt à moderniser votre établissement ?</h2>
          <p>Connectez-vous dès maintenant et commencez à gérer vos étudiants efficacement.</p>
          <button className="btn btn-landing-primary btn-cta" onClick={()=>navigate("/login")}>
            Accéder à CampusPro <ArrowRight size={16}/>
          </button>
        </div>
      </section>

      {/* ── Footer — une seule fois, tout en bas ── */}
      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <GraduationCap size={18}/>
          <strong>CampusPro</strong>
        </div>
        <p>Gestion des étudiants, paiements & QR codes · Plateforme sécurisée</p>
        <p style={{marginTop:4,fontSize:"0.72rem",opacity:0.7}}>
          © {new Date().getFullYear()} CampusPro — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}
