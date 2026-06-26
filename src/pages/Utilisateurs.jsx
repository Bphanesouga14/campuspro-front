import { useState, useEffect } from "react";
import { authService, modifierUtilisateur, supprimerUtilisateur } from "../api/services";
import { Plus, Pencil, Trash2, X, Shield, UserCheck, Briefcase } from "lucide-react";

const ROLE_META = {
  ADMIN:      { label:"Administrateur", Icon:Shield,    cl:"red"    },
  SECRETAIRE: { label:"Secrétaire",     Icon:UserCheck, cl:"blue"   },
  CAISSIER:   { label:"Caissier",       Icon:Briefcase, cl:"green"  },
};

function FormulaireUtilisateur({ utilisateur, onSuccess, onFermer }) {
  const est = !!utilisateur;
  const [form, setForm] = useState(
    est ? { ...utilisateur, mot_de_passe:"" } :
    { email:"", nom:"", mot_de_passe:"", role:"SECRETAIRE" }
  );
  const [erreur, setErreur] = useState("");
  const [load, setLoad]     = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErreur(""); setLoad(true);
    try {
      const payload = { email:form.email, nom:form.nom, role:form.role };
      if (form.mot_de_passe) payload.mot_de_passe = form.mot_de_passe;
      if (est) await modifierUtilisateur(utilisateur.id_utilisateur, payload);
      else     await authService.creerUtilisateur({ ...payload, mot_de_passe: form.mot_de_passe });
      onSuccess();
    } catch (err) { setErreur(err.response?.data?.detail || "Erreur."); }
    finally { setLoad(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>{est ? "Modifier le compte" : "Nouveau compte"}</h2>
          <button className="btn-close" onClick={onFermer}><X size={16}/></button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-group" style={{marginBottom:"1rem"}}>
            <label>Nom complet *</label>
            <input value={form.nom} onChange={e=>setForm(f=>({...f,nom:e.target.value}))} required />
          </div>
          <div className="form-group" style={{marginBottom:"1rem"}}>
            <label>Email *</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required />
          </div>
          <div className="form-group" style={{marginBottom:"1rem"}}>
            <label>{est ? "Nouveau mot de passe (laisser vide = inchangé)" : "Mot de passe * (min. 8 car.)"}</label>
            <input type="password" value={form.mot_de_passe}
              onChange={e=>setForm(f=>({...f,mot_de_passe:e.target.value}))}
              {...(!est && { required:true, minLength:8 })} />
          </div>
          <div className="form-group" style={{marginBottom:"1rem"}}>
            <label>Rôle *</label>
            <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
              <option value="SECRETAIRE">Secrétaire</option>
              <option value="CAISSIER">Caissier</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          {erreur && <div className="alert alert-erreur">{erreur}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onFermer}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={load}>
              {load ? "..." : est ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [modal, setModal]               = useState(null);
  const [courant, setCourant]           = useState(null);
  const [load, setLoad]                 = useState(true);

  const charger = () => authService.listerUtilisateurs().then(setUtilisateurs).finally(()=>setLoad(false));
  useEffect(()=>{ charger(); },[]);

  const supprimer = async (u) => {
    if (!window.confirm(`Supprimer le compte de ${u.nom} ?`)) return;
    try { await supprimerUtilisateur(u.id_utilisateur); charger(); }
    catch (err) { alert(err.response?.data?.detail || "Impossible de supprimer."); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Utilisateurs <span className="count-badge">{utilisateurs.length}</span></h1>
        <button className="btn btn-primary" onClick={()=>{setCourant(null);setModal("creer");}}>
          <Plus size={15}/> Nouveau compte
        </button>
      </div>

      {load ? <div className="loading-text">Chargement...</div> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {utilisateurs.map(u => {
                const meta = ROLE_META[u.role] || ROLE_META.SECRETAIRE;
                return (
                  <tr key={u.id_utilisateur}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar" style={{background:`var(--${meta.cl})`}}>
                          {u.nom?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="table-name">{u.nom}</div>
                          <div className="table-sub">{u.id_utilisateur}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-chip role-${u.role}`}>
                        <meta.Icon size={11} style={{marginRight:4}}/>
                        {meta.label}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${u.actif?"vert":"rouge"}`}>
                        {u.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="icon-btn" title="Modifier"
                          onClick={()=>{setCourant(u);setModal("modifier");}}>
                          <Pencil size={15}/>
                        </button>
                        <button className="icon-btn danger" title="Supprimer" onClick={()=>supprimer(u)}>
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {(modal==="creer"||modal==="modifier") && (
        <FormulaireUtilisateur
          utilisateur={modal==="modifier"?courant:null}
          onSuccess={()=>{setModal(null);charger();}}
          onFermer={()=>setModal(null)}
        />
      )}
    </div>
  );
}
