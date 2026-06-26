import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import SelecteurTheme from "../components/SelecteurTheme";
import {
  GraduationCap, Mail, Lock, ArrowRight,
  Loader2, Eye, EyeOff, ArrowLeft, AlertCircle, X
} from "lucide-react";

// ── Modal "Mot de passe oublié" ───────────────────────────────
function ModalMotDePasseOublie({ onFermer }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <AlertCircle size={18} style={{color:"var(--orange)"}}/>
            <h2>Mot de passe oublié ?</h2>
          </div>
          <button className="btn-close" onClick={onFermer}><X size={16}/></button>
        </div>
        <div className="modal-body">
          <div style={{
            background:"var(--orange-soft)", borderRadius:10,
            padding:"1rem", marginBottom:"1rem",
            display:"flex", gap:10, alignItems:"flex-start"
          }}>
            <AlertCircle size={18} style={{color:"var(--orange)",flexShrink:0,marginTop:2}}/>
            <p style={{fontSize:"0.87rem",color:"var(--text)",lineHeight:1.6}}>
              La réinitialisation du mot de passe n'est pas disponible en libre-service
              pour des raisons de sécurité.
            </p>
          </div>
          <p style={{fontSize:"0.88rem",color:"var(--text2)",lineHeight:1.7,marginBottom:"1.25rem"}}>
            Pour récupérer l'accès à votre compte, veuillez contacter
            l'<strong style={{color:"var(--text)"}}>administrateur de CampusPro</strong>
            de votre établissement en lui fournissant :
          </p>
          <div style={{
            background:"var(--bg2)", borderRadius:10, padding:"1rem",
            display:"flex", flexDirection:"column", gap:8, marginBottom:"1.25rem"
          }}>
            {["Votre nom complet","Votre adresse email","Votre rôle (Secrétaire ou Caissier)"].map((item,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.85rem",color:"var(--text)"}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"var(--primary)",flexShrink:0}}/>
                {item}
              </div>
            ))}
          </div>
          <p style={{fontSize:"0.78rem",color:"var(--text3)",textAlign:"center"}}>
            L'administrateur réinitialisera votre mot de passe via la page Utilisateurs.
          </p>
          <div className="modal-footer" style={{borderTop:"none",paddingTop:"0.5rem"}}>
            <button className="btn btn-primary" onClick={onFermer} style={{width:"100%",justifyContent:"center"}}>
              Compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail]         = useState("");
  const [mdp, setMdp]             = useState("");
  const [voirMdp, setVoirMdp]     = useState(false);
  const [erreur, setErreur]       = useState("");
  const [load, setLoad]           = useState(false);
  const [modalMdp, setModalMdp]   = useState(false);
  const { connecter }             = useAuth();
  const navigate                  = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setErreur(""); setLoad(true);
    try {
      const d = await authService.login(email, mdp);
      connecter(d.access_token, d.utilisateur);
      navigate("/");
    } catch (err) {
      setErreur(err.response?.data?.detail || "Email ou mot de passe incorrect.");
    } finally { setLoad(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1"/>
        <div className="shape shape-2"/>
        <div className="shape shape-3"/>
      </div>

      {/* Bouton thème */}
      <div className="login-theme-btn"><SelecteurTheme/></div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <GraduationCap size={28} color="white"/>
          </div>
          <div>
            <h1 className="login-title">CampusPro</h1>
            <p className="login-subtitle">Gestion des étudiants, paiements & QR codes</p>
          </div>
        </div>

        <div className="login-divider"/>

        {/* Formulaire */}
        <form onSubmit={submit} className="login-form">
          {/* Email */}
          <div className="field">
            <label>Adresse email</label>
            <div className="field-input-wrap">
              <Mail size={15} className="field-icon-svg"/>
              <input type="email" value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="admin@ecole.cm" required autoFocus/>
            </div>
          </div>

          {/* Mot de passe avec oeil */}
          <div className="field">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <label>Mot de passe</label>
              <button type="button" className="login-forgot-link"
                onClick={() => setModalMdp(true)}>
                Mot de passe oublié ?
              </button>
            </div>
            <div className="field-input-wrap">
              <Lock size={15} className="field-icon-svg"/>
              <input
                type={voirMdp ? "text" : "password"}
                value={mdp}
                onChange={e=>setMdp(e.target.value)}
                placeholder="••••••••"
                required
                style={{paddingRight:"2.8rem"}}
              />
              {/* Bouton voir/cacher le mot de passe */}
              <button type="button" className="field-eye-btn"
                onClick={() => setVoirMdp(!voirMdp)}
                title={voirMdp ? "Cacher le mot de passe" : "Voir le mot de passe"}>
                {voirMdp ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* Erreur */}
          {erreur && (
            <div className="login-error">
              <AlertCircle size={14}/> {erreur}
            </div>
          )}

          {/* Bouton connexion */}
          <button type="submit" className="login-btn" disabled={load}>
            {load
              ? <><Loader2 size={16} className="spin"/> Connexion en cours...</>
              : <>Se connecter <ArrowRight size={16}/></>}
          </button>
        </form>

        {/* Retour page d'accueil */}
        <div className="login-back">
          <Link to="/accueil" className="login-back-link">
            <ArrowLeft size={14}/> Retour à l'accueil
          </Link>
        </div>

        {/* Footer droits réservés */}
        <div className="login-footer-copy">
          © {new Date().getFullYear()} CampusPro — Tous droits réservés
        </div>
      </div>

      {/* Modal mot de passe oublié */}
      {modalMdp && <ModalMotDePasseOublie onFermer={() => setModalMdp(false)}/>}
    </div>
  );
}
