import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SelecteurTheme from "../components/SelecteurTheme";
import {
  GraduationCap, Mail, Lock, ArrowRight,
  Loader2, Eye, EyeOff, ArrowLeft, AlertCircle, X
} from "lucide-react";

// ── Modal mot de passe oublié ─────────────────────────────────
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
          <div style={{background:"var(--orange-soft)",borderRadius:10,
            padding:"1rem",marginBottom:"1rem",display:"flex",gap:10}}>
            <AlertCircle size={18} style={{color:"var(--orange)",flexShrink:0}}/>
            <p style={{fontSize:"0.87rem",color:"var(--text)",lineHeight:1.6}}>
              Contactez l'administrateur CampusPro de votre établissement.
            </p>
          </div>
          <div className="modal-footer" style={{borderTop:"none",paddingTop:0}}>
            <button className="btn btn-primary"
              onClick={onFermer}
              style={{width:"100%",justifyContent:"center"}}>
              Compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page Login ────────────────────────────────────────────────
export default function Login() {
  const [etape, setEtape]       = useState(1);
  const [email, setEmail]       = useState("");
  const [mdp, setMdp]           = useState("");
  const [voirMdp, setVoirMdp]   = useState(false);
  const [code, setCode]         = useState("");
  const [msgEmail, setMsgEmail] = useState("");
  const [emailSaisi, setEmailS] = useState("");
  const [erreur, setErreur]     = useState("");
  const [load, setLoad]         = useState(false);
  const [modalMdp, setModalMdp] = useState(false);

  const { connecter } = useAuth();
  const navigate      = useNavigate();

  // Étape 1 : vérifier email + mdp → envoyer code
  const submitLogin = async (e) => {
    e.preventDefault();
    setErreur(""); setLoad(true);
    try {
      //const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login",
      const res = await fetch("https://campuspro-backend.onrender.com/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, mot_de_passe: mdp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Erreur de connexion.");
      setEmailS(email);
      setMsgEmail(data.message);
      setEtape(2);
    } catch (err) {
      setErreur(err.message);
    } finally { setLoad(false); }
  };

  // Étape 2 : vérifier le code 2FA → obtenir token
  const submitCode = async (e) => {
    e.preventDefault();
    setErreur(""); setLoad(true);
    try {
      //const res = await fetch("http://127.0.0.1:8000/api/v1/auth/verifier",
      const res = await fetch("https://campuspro-backend.onrender.com/api/v1/auth/verifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailSaisi, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Code incorrect.");
      connecter(data.access_token, data.utilisateur);
      navigate("/");
    } catch (err) {
      setErreur(err.message);
    } finally { setLoad(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shapes">
        <div className="shape shape-1"/>
        <div className="shape shape-2"/>
        <div className="shape shape-3"/>
      </div>

      <div className="login-theme-btn"><SelecteurTheme/></div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <GraduationCap size={28} color="white"/>
          </div>
          <div>
            <h1 className="login-title">CampusPro</h1>
            <p className="login-subtitle">
              Gestion des étudiants, paiements & QR codes
            </p>
          </div>
        </div>

        <div className="login-divider"/>

        {/* ── Étape 1 : email + mot de passe ── */}
        {etape === 1 && (
          <form onSubmit={submitLogin} className="login-form">
            <div className="field">
              <label>Adresse email</label>
              <div className="field-input-wrap">
                <Mail size={15} className="field-icon-svg"/>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ecole.cm"
                  required autoFocus
                />
              </div>
            </div>

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
                  onChange={e => setMdp(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{paddingRight:"2.8rem"}}
                />
                <button type="button" className="field-eye-btn"
                  onClick={() => setVoirMdp(!voirMdp)}>
                  {voirMdp ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {erreur && (
              <div className="login-error">
                <AlertCircle size={14}/> {erreur}
              </div>
            )}

            <button type="submit" className="login-btn" disabled={load}>
              {load
                ? <><Loader2 size={16} className="spin"/> Vérification...</>
                : <>Continuer <ArrowRight size={16}/></>}
            </button>
          </form>
        )}

        {/* ── Étape 2 : code 2FA ── */}
        {etape === 2 && (
          <form onSubmit={submitCode} className="login-form">
            <div style={{textAlign:"center",marginBottom:"1.25rem"}}>
              <div style={{fontSize:"3rem",marginBottom:"0.5rem"}}>📧</div>
              <p style={{fontWeight:700,fontSize:"1rem",color:"var(--text)"}}>
                Vérification en deux étapes
              </p>
              <p style={{fontSize:"0.83rem",color:"var(--text2)",marginTop:6,lineHeight:1.5}}>
                {msgEmail}
              </p>
            </div>

            <div className="field">
              <label>Code à 6 chiffres</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g,"").slice(0,6))}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                style={{
                  textAlign:"center",
                  fontSize:"2rem",
                  letterSpacing:"0.6em",
                  fontWeight:800,
                  padding:"0.85rem",
                }}
              />
              <p style={{fontSize:"0.75rem",color:"var(--text3)",marginTop:6,textAlign:"center"}}>
                Valable 10 minutes · Vérifie tes spams si absent
              </p>
            </div>

            {erreur && (
              <div className="login-error">
                <AlertCircle size={14}/> {erreur}
              </div>
            )}

            <button type="submit" className="login-btn"
              disabled={load || code.length !== 6}>
              {load
                ? <><Loader2 size={16} className="spin"/> Vérification...</>
                : <>Se connecter <ArrowRight size={16}/></>}
            </button>

            <button type="button"
              onClick={() => { setEtape(1); setCode(""); setErreur(""); }}
              style={{
                display:"flex",alignItems:"center",justifyContent:"center",
                gap:6,width:"100%",marginTop:"0.5rem",
                background:"none",border:"none",cursor:"pointer",
                fontSize:"0.83rem",color:"var(--text2)",padding:"0.5rem",
              }}>
              <ArrowLeft size={14}/> Retour
            </button>
          </form>
        )}

        {/* Retour accueil */}
        <div className="login-back">
          <Link to="/accueil" className="login-back-link">
            <ArrowLeft size={14}/> Retour à l'accueil
          </Link>
        </div>

        <div className="login-footer-copy">
          © {new Date().getFullYear()} CampusPro — Tous droits réservés
        </div>
      </div>

      {modalMdp && <ModalMotDePasseOublie onFermer={() => setModalMdp(false)}/>}
    </div>
  );
}