// ============================================================
//  src/pages/Specialites.jsx
// ============================================================

import { useState, useEffect } from "react";
import { specialiteService } from "../api/services";
import { useAuth } from "../context/AuthContext";

const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function FormulaireSpecialite({ specialite, onSuccess, onAnnuler }) {
  const [form, setForm] = useState(specialite || {
    id_specialite: "", code: "", nom_specialite: "", departement: "",
    niveau: 1, duree_ans: 1, annee_academique: "2024-2025",
    tranche_1: 0, date_limite_t1: "31/10/2024",
    tranche_2: 0, date_limite_t2: "31/01/2025",
    tranche_3: 0, date_limite_t3: "30/04/2025",
  });
  const [erreur, setErreur]     = useState("");
  const [chargement, setCharge] = useState(false);
  const maj = (c, v) => setForm(f => ({ ...f, [c]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setCharge(true);
    try {
      await specialiteService.creerOuModifier({
        ...form,
        niveau: Number(form.niveau),
        duree_ans: Number(form.duree_ans),
        tranche_1: Number(form.tranche_1),
        tranche_2: Number(form.tranche_2),
        tranche_3: Number(form.tranche_3),
      });
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur.");
    } finally {
      setCharge(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{specialite ? "Modifier la spécialité" : "Nouvelle spécialité"}</h2>
          <button className="btn-close" onClick={onAnnuler}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-grid">
            <div className="form-group"><label>ID *</label><input value={form.id_specialite} onChange={e => maj("id_specialite", e.target.value)} required /></div>
            <div className="form-group"><label>Code *</label><input value={form.code} onChange={e => maj("code", e.target.value)} required /></div>
            <div className="form-group form-group--full"><label>Nom *</label><input value={form.nom_specialite} onChange={e => maj("nom_specialite", e.target.value)} required /></div>
            <div className="form-group"><label>Département *</label><input value={form.departement} onChange={e => maj("departement", e.target.value)} required /></div>
            <div className="form-group"><label>Niveau *</label><select value={form.niveau} onChange={e => maj("niveau", e.target.value)}>{[1,2,3,4,5].map(n=><option key={n} value={n}>N{n}</option>)}</select></div>
            <div className="form-group"><label>Durée (ans)</label><input type="number" value={form.duree_ans} onChange={e => maj("duree_ans", e.target.value)} /></div>
            <div className="form-group"><label>Année académique</label><input value={form.annee_academique} onChange={e => maj("annee_academique", e.target.value)} /></div>
          </div>
          <div className="form-section-titre">Tranches de paiement</div>
          <div className="form-grid">
            <div className="form-group"><label>Tranche 1 (FCFA)</label><input type="number" value={form.tranche_1} onChange={e => maj("tranche_1", e.target.value)} /></div>
            <div className="form-group"><label>Date limite T1</label><input value={form.date_limite_t1} onChange={e => maj("date_limite_t1", e.target.value)} /></div>
            <div className="form-group"><label>Tranche 2 (FCFA)</label><input type="number" value={form.tranche_2} onChange={e => maj("tranche_2", e.target.value)} /></div>
            <div className="form-group"><label>Date limite T2</label><input value={form.date_limite_t2} onChange={e => maj("date_limite_t2", e.target.value)} /></div>
            <div className="form-group"><label>Tranche 3 (FCFA)</label><input type="number" value={form.tranche_3} onChange={e => maj("tranche_3", e.target.value)} /></div>
            <div className="form-group"><label>Date limite T3</label><input value={form.date_limite_t3} onChange={e => maj("date_limite_t3", e.target.value)} /></div>
          </div>
          {erreur && <div className="alert alert-erreur">{erreur}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onAnnuler}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={chargement}>{chargement ? "..." : "Enregistrer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Specialites() {
  const [specialites, setSpecialites] = useState([]);
  const [chargement, setCharge]       = useState(true);
  const [modal, setModal]             = useState(false);
  const [edite, setEdite]             = useState(null);
  const { aLeRole }                   = useAuth();

  const charger = () => {
    specialiteService.lister().then(setSpecialites).finally(() => setCharge(false));
  };

  useEffect(charger, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Spécialités <span className="badge">{specialites.length}</span></h1>
        {aLeRole("ADMIN","SECRETAIRE") && (
          <button className="btn btn-primary" onClick={() => { setEdite(null); setModal(true); }}>
            + Nouvelle spécialité
          </button>
        )}
      </div>

      {chargement ? <div className="chargement">Chargement...</div> : (
        <div className="specialites-grid">
          {specialites.map(s => (
            <div key={s.id_specialite} className="specialite-card">
              <div className="specialite-header">
                <span className="specialite-code">{s.code}</span>
                <span className="specialite-niveau">Niveau {s.niveau}</span>
              </div>
              <div className="specialite-nom">{s.nom_specialite}</div>
              <div className="specialite-dept">{s.departement}</div>
              <div className="specialite-total">Total : <strong>{fcfa(s.total)}</strong></div>
              <div className="specialite-tranches">
                <span>T1 : {fcfa(s.tranche_1)}</span>
                <span>T2 : {fcfa(s.tranche_2)}</span>
                <span>T3 : {fcfa(s.tranche_3)}</span>
              </div>
              {aLeRole("ADMIN","SECRETAIRE") && (
                <button className="btn btn-sm btn-secondary" onClick={() => { setEdite(s); setModal(true); }}>
                  ✏️ Modifier
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <FormulaireSpecialite
          specialite={edite}
          onSuccess={() => { setModal(false); charger(); }}
          onAnnuler={() => setModal(false)}
        />
      )}
    </div>
  );
}
