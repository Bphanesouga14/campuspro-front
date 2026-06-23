// ============================================================
//  src/pages/Utilisateurs.jsx  —  Gestion des comptes (admin)
// ============================================================

import { useState, useEffect } from "react";
import { authService } from "../api/services";

export default function Utilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [modal, setModal]               = useState(false);
  const [erreur, setErreur]             = useState("");
  const [form, setForm] = useState({ email: "", nom: "", mot_de_passe: "", role: "SECRETAIRE" });
  const [chargement, setCharge]         = useState(false);

  const charger = () => {
    authService.listerUtilisateurs().then(setUtilisateurs);
  };

  useEffect(charger, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setCharge(true);
    try {
      await authService.creerUtilisateur(form);
      setModal(false);
      setForm({ email: "", nom: "", mot_de_passe: "", role: "SECRETAIRE" });
      charger();
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur.");
    } finally {
      setCharge(false);
    }
  };

  const couleurRole = { ADMIN: "rouge", SECRETAIRE: "bleu", CAISSIER: "vert" };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Utilisateurs <span className="badge">{utilisateurs.length}</span></h1>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          + Nouveau compte
        </button>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map(u => (
              <tr key={u.id_utilisateur}>
                <td><code>{u.id_utilisateur}</code></td>
                <td><strong>{u.nom}</strong></td>
                <td>{u.email}</td>
                <td><span className={`badge badge--${couleurRole[u.role]}`}>{u.role}</span></td>
                <td><span className={`badge badge--${u.actif ? "vert" : "rouge"}`}>{u.actif ? "Actif" : "Inactif"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal modal--petit">
            <div className="modal-header">
              <h2>Nouveau compte utilisateur</h2>
              <button className="btn-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nom complet *</label>
                <input value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Mot de passe * (min. 8 caractères)</label>
                <input type="password" value={form.mot_de_passe} onChange={e => setForm(f => ({...f, mot_de_passe: e.target.value}))} required minLength={8} />
              </div>
              <div className="form-group">
                <label>Rôle *</label>
                <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                  <option value="SECRETAIRE">Secrétaire</option>
                  <option value="CAISSIER">Caissier</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
              {erreur && <div className="alert alert-erreur">{erreur}</div>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={chargement}>{chargement ? "..." : "Créer le compte"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
