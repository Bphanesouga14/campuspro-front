import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme, THEMES } from "../context/ThemeContext";
import { profilService } from "../api/services";
import {
  Settings, User, Lock, Globe, Monitor, Sun, Leaf,
  Camera, Eye, EyeOff, Check, Save, Info, Users,
  Loader2, AlertCircle
} from "lucide-react";

// ── Avatar avec upload ────────────────────────────────────────
function AvatarUpload({ photo, nom, onPhotoChange }) {
  const inputRef  = useRef(null);
  const [load, setLoad] = useState(false);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setLoad(true);
    try {
      const res = await profilService.uploaderPhoto(f);
      onPhotoChange(res.photo);
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de l'upload.");
    } finally { setLoad(false); }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10,marginBottom:"1.5rem"}}>
      <div style={{position:"relative",cursor:"pointer"}} onClick={()=>!load && inputRef.current?.click()}>
        {photo ? (
          <img src={photo} alt="avatar"
            style={{width:96,height:96,borderRadius:"50%",objectFit:"cover",
              border:"3px solid var(--primary)",display:"block"}}/>
        ) : (
          <div style={{width:96,height:96,borderRadius:"50%",
            background:"linear-gradient(135deg,var(--primary),var(--purple))",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"2.2rem",fontWeight:700,color:"white"}}>
            {nom?.[0]?.toUpperCase()}
          </div>
        )}
        <div style={{
          position:"absolute",bottom:2,right:2,width:30,height:30,borderRadius:"50%",
          background: load ? "var(--gris)" : "var(--primary)",
          display:"flex",alignItems:"center",justifyContent:"center",
          border:"2px solid var(--card)",transition:"background 0.2s"
        }}>
          {load ? <Loader2 size={13} color="white" className="spin"/> : <Camera size={13} color="white"/>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        style={{display:"none"}} onChange={handleFile}/>
      <p style={{fontSize:"0.75rem",color:"var(--text3)"}}>
        Cliquer sur la photo pour la modifier (max 3 Mo)
      </p>
    </div>
  );
}

// ── Onglet Profil ─────────────────────────────────────────────
function OngletProfil({ utilisateur, onUpdate }) {
  const { mettreAJourPhoto } = useAuth();
  const [photo, setPhoto]   = useState(null);
  const [form, setForm]     = useState({ nom: utilisateur.nom, email: utilisateur.email });
  const [mdp, setMdp]       = useState({ actuel:"", nouveau:"", confirmer:"" });
  const [voirMdp, setVoir]  = useState(false);
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");
  const [load, setLoad]     = useState(false);

  // Charger la photo existante au montage
  useEffect(() => {
    profilService.obtenir()
      .then(p => { if (p.photo) setPhoto(p.photo); })
      .catch(() => {});
  }, []);

  const handlePhotoChange = (dataUrl) => {
  setPhoto(dataUrl);
  // Mettre à jour la photo dans le contexte global → sidebar se met à jour
  mettreAJourPhoto(dataUrl);
  setSucces("Photo mise à jour avec succès !");
  setTimeout(() => setSucces(""), 3000);
};

  const sauvegarder = async () => {
    setErreur(""); setSucces(""); setLoad(true);
    const payload = {};
    if (form.nom   !== utilisateur.nom)   payload.nom   = form.nom;
    if (form.email !== utilisateur.email) payload.email = form.email;
    if (mdp.nouveau) {
      if (mdp.nouveau !== mdp.confirmer) { setErreur("Les mots de passe ne correspondent pas."); setLoad(false); return; }
      if (mdp.nouveau.length < 8) { setErreur("Min. 8 caractères."); setLoad(false); return; }
      payload.mot_de_passe_actuel  = mdp.actuel;
      payload.nouveau_mot_de_passe = mdp.nouveau;
    }
    if (!Object.keys(payload).length) { setSucces("Aucune modification à enregistrer."); setLoad(false); return; }
    try {
      const updated = await profilService.modifier(payload);
      setSucces("Profil mis à jour !");
      onUpdate(updated);
      setMdp({ actuel:"", nouveau:"", confirmer:"" });
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de la mise à jour.");
    } finally { setLoad(false); }
  };

  return (
    <div>
      <AvatarUpload photo={photo} nom={utilisateur.nom} onPhotoChange={handlePhotoChange}/>

      <div className="param-section-label"><User size={13}/> Informations personnelles</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1.5rem"}}>
        <div className="form-group">
          <label>Nom complet</label>
          <input value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))}/>
        </div>
        <div className="form-group">
          <label>Adresse email</label>
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
        </div>
        <div className="form-group" style={{gridColumn:"1/-1"}}>
          <label>Rôle</label>
          <input value={utilisateur.role} disabled
            style={{opacity:0.6,cursor:"not-allowed"}}/>
        </div>
      </div>

      <div className="param-section-label"><Lock size={13}/> Changer le mot de passe</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem",marginBottom:"1.5rem"}}>
        {[["actuel","Mot de passe actuel"],["nouveau","Nouveau mot de passe"],["confirmer","Confirmer"]].map(([k,l])=>(
          <div key={k} className="form-group">
            <label>{l}</label>
            <div style={{position:"relative"}}>
              <input type={voirMdp?"text":"password"} value={mdp[k]}
                placeholder="••••••••"
                onChange={e=>setMdp(m=>({...m,[k]:e.target.value}))}
                style={{paddingRight: k==="nouveau" ? "2.5rem" : undefined}}/>
              {k==="nouveau" && (
                <button type="button" className="field-eye-btn"
                  onClick={()=>setVoir(!voirMdp)}>
                  {voirMdp ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {succes && (
        <div className="alert alert-succes" style={{marginBottom:"1rem",display:"flex",alignItems:"center",gap:8}}>
          <Check size={14}/> {succes}
        </div>
      )}
      {erreur && (
        <div className="alert alert-erreur" style={{marginBottom:"1rem",display:"flex",alignItems:"center",gap:8}}>
          <AlertCircle size={14}/> {erreur}
        </div>
      )}

      <button className="btn btn-primary" onClick={sauvegarder} disabled={load}>
        {load ? <><Loader2 size={14} className="spin"/> Enregistrement...</> : <><Save size={14}/> Enregistrer</>}
      </button>
    </div>
  );
}

// ── Onglet Apparence ──────────────────────────────────────────
function OngletApparence() {
  const { theme, setTheme } = useTheme();
  const [langue, setLangue] = useState(localStorage.getItem("lgs-langue") || "fr");

  const ICONES = { systeme: Monitor, lumiere: Sun, emeraude: Leaf };

  return (
    <div>
      <div className="param-section-label"><Monitor size={13}/> Thème d'affichage</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1rem",marginBottom:"2rem"}}>
        {Object.values(THEMES).map(t => {
          const Ic = ICONES[t.id];
          return (
            <button key={t.id} className={`param-theme-card ${theme===t.id?"actif":""}`}
              onClick={()=>setTheme(t.id)}>
              <Ic size={26}/>
              <span>{t.label}</span>
              {theme===t.id && <Check size={13} className="param-theme-check"/>}
            </button>
          );
        })}
      </div>

      <div className="param-section-label"><Globe size={13}/> Langue de l'interface</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem"}}>
        {[["fr","🇫🇷","Français"],["en","🇬🇧","English (bientôt)"]].map(([code,flag,label])=>(
          <button key={code} className={`param-langue-card ${langue===code?"actif":""}`}
            onClick={()=>{ setLangue(code); localStorage.setItem("lgs-langue",code); }}>
            <span style={{fontSize:"1.8rem"}}>{flag}</span>
            <span style={{fontWeight:600}}>{label}</span>
            {langue===code && <Check size={13} className="param-theme-check"/>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Onglet À propos ───────────────────────────────────────────
function OngletAPropos() {
  return (
    <div>
      <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
        <div style={{width:72,height:72,borderRadius:20,
          background:"linear-gradient(135deg,var(--primary),var(--purple))",
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto 1rem",fontSize:"2.2rem"}}>🎓</div>
        <h2 style={{fontSize:"1.4rem",fontWeight:800,color:"var(--text)"}}>CampusPro</h2>
        <p style={{color:"var(--text2)",fontSize:"0.85rem",marginTop:4}}>
          Gestion des étudiants, paiements & QR codes
        </p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.85rem"}}>
        {[
          ["Version","1.0.0"],["Backend","FastAPI · Python 3.14"],
          ["Frontend","React 19 · Vite"],["Base de données","PostgreSQL · Supabase"],
          ["Auth","JWT HS256"],["QR Codes","Auto · Photo intégrée"],
          ["Présences","Scan QR · Flutter"],["Licence","Tous droits réservés"],
        ].map(([k,v])=>(
          <div key={k} style={{background:"var(--bg2)",borderRadius:10,padding:"0.85rem"}}>
            <div style={{fontSize:"0.72rem",color:"var(--text3)",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{k}</div>
            <div style={{fontWeight:600,color:"var(--text)",fontSize:"0.9rem"}}>{v}</div>
          </div>
        ))}
      </div>
      <p style={{textAlign:"center",fontSize:"0.72rem",color:"var(--text3)",marginTop:"1.25rem"}}>
        © {new Date().getFullYear()} CampusPro — Tous droits réservés
      </p>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Parametres() {
  const { utilisateur, aLeRole } = useAuth();
  const [onglet, setOnglet] = useState("profil");
  const [user, setUser]     = useState(utilisateur);

  const ONGLETS = [
    { id:"profil",    label:"Mon profil",  Icon:User },
    { id:"apparence", label:"Apparence",   Icon:Monitor },
    ...(aLeRole("ADMIN") ? [{ id:"utilisateurs", label:"Utilisateurs", Icon:Users }] : []),
    { id:"apropos",   label:"À propos",    Icon:Info },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1><Settings size={20} style={{marginRight:8,verticalAlign:"middle"}}/>Paramètres</h1>
      </div>
      <div className="param-layout">
        <div className="param-menu">
          {ONGLETS.map(o=>(
            <button key={o.id}
              className={`param-menu-item ${onglet===o.id?"actif":""}`}
              onClick={()=>setOnglet(o.id)}>
              <o.Icon size={16}/> {o.label}
            </button>
          ))}
        </div>
        <div className="param-content">
          <div className="param-section-title">
            {ONGLETS.find(o=>o.id===onglet)?.label}
          </div>
          {onglet==="profil"    && <OngletProfil utilisateur={user} onUpdate={setUser}/>}
          {onglet==="apparence" && <OngletApparence/>}
          {onglet==="utilisateurs" && (
            <div style={{textAlign:"center",padding:"2rem",color:"var(--text2)"}}>
              <Users size={48} strokeWidth={1.2} style={{marginBottom:12}}/>
              <p style={{fontWeight:600,marginBottom:8}}>Gestion des utilisateurs</p>
              <a href="/utilisateurs" className="btn btn-primary" style={{display:"inline-flex"}}>
                <Users size={14}/> Gérer les comptes
              </a>
            </div>
          )}
          {onglet==="apropos" && <OngletAPropos/>}
        </div>
      </div>
    </div>
  );
}
