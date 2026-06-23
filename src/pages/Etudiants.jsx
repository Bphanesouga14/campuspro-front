// ============================================================
//  src/pages/Etudiants.jsx  —  Liste et gestion des étudiants
// ============================================================

import { useState, useEffect } from "react";
import { etudiantService, specialiteService } from "../api/services";
import { useAuth } from "../context/AuthContext";

// ── Formulaire d'ajout / modification ───────────────────────
function FormulaireEtudiant({ etudiant, specialites, onSuccess, onAnnuler }) {
  const estModification = !!etudiant;
  const [form, setForm] = useState(etudiant || {
    id_etudiant: "", matricule: "", nom: "", prenom: "", sexe: "M",
    id_specialite: "", code_specialite: "", niveau: 1,
    annee_academique: "2024-2025", email_etudiant: "",
    telephone_etudiant: "", nom_parent: "", prenom_parent: "",
    lien_parent: "Père", telephone_parent: "", email_parent: "",
  });
  const [erreur, setErreur]     = useState("");
  const [chargement, setCharge] = useState(false);

  const maj = (champ, val) => setForm(f => ({ ...f, [champ]: val }));

  // Quand on choisit une spécialité, remplir automatiquement le code
  const choisirSpecialite = (id) => {
    const sp = specialites.find(s => s.id_specialite === id);
    setForm(f => ({
      ...f,
      id_specialite:  id,
      code_specialite: sp?.code || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setCharge(true);
    try {
      if (estModification) {
        await etudiantService.modifier(etudiant.id_etudiant, form);
      } else {
        await etudiantService.creer({ ...form, niveau: Number(form.niveau) });
      }
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.detail || "Une erreur est survenue.");
    } finally {
      setCharge(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{estModification ? "Modifier l'étudiant" : "Nouvel étudiant"}</h2>
          <button className="btn-close" onClick={onAnnuler}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Identité */}
          <div className="form-section-titre">Identité</div>
          <div className="form-grid">
            {!estModification && (
              <>
                <div className="form-group">
                  <label>ID étudiant *</label>
                  <input value={form.id_etudiant} onChange={e => maj("id_etudiant", e.target.value)} placeholder="ETU-2024-001" required />
                </div>
                <div className="form-group">
                  <label>Matricule *</label>
                  <input value={form.matricule} onChange={e => maj("matricule", e.target.value)} placeholder="MAT-2024-INFO-001" required />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Nom *</label>
              <input value={form.nom} onChange={e => maj("nom", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Prénom *</label>
              <input value={form.prenom} onChange={e => maj("prenom", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Sexe *</label>
              <select value={form.sexe} onChange={e => maj("sexe", e.target.value)}>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email_etudiant || ""} onChange={e => maj("email_etudiant", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input value={form.telephone_etudiant || ""} onChange={e => maj("telephone_etudiant", e.target.value)} />
            </div>
          </div>

          {/* Scolarité */}
          <div className="form-section-titre">Scolarité</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Spécialité *</label>
              <select value={form.id_specialite} onChange={e => choisirSpecialite(e.target.value)} required>
                <option value="">-- Choisir --</option>
                {specialites.map(s => (
                  <option key={s.id_specialite} value={s.id_specialite}>
                    {s.nom_specialite} (N{s.niveau})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Niveau *</label>
              <select value={form.niveau} onChange={e => maj("niveau", e.target.value)}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>Niveau {n}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Année académique *</label>
              <input value={form.annee_academique} onChange={e => maj("annee_academique", e.target.value)} placeholder="2024-2025" required />
            </div>
          </div>

          {/* Parent */}
          <div className="form-section-titre">Parent / Tuteur</div>
          <div className="form-grid">
            <div className="form-group">
              <label>Nom parent *</label>
              <input value={form.nom_parent} onChange={e => maj("nom_parent", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Prénom parent *</label>
              <input value={form.prenom_parent} onChange={e => maj("prenom_parent", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Lien *</label>
              <select value={form.lien_parent} onChange={e => maj("lien_parent", e.target.value)}>
                <option>Père</option>
                <option>Mère</option>
                <option>Tuteur</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tél. parent *</label>
              <input value={form.telephone_parent} onChange={e => maj("telephone_parent", e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email parent</label>
              <input type="email" value={form.email_parent || ""} onChange={e => maj("email_parent", e.target.value)} />
            </div>
          </div>

          {erreur && <div className="alert alert-erreur">{erreur}</div>}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onAnnuler}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={chargement}>
              {chargement ? "Enregistrement..." : (estModification ? "Modifier" : "Créer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────
export default function Etudiants() {
  const [etudiants, setEtudiants]     = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [chargement, setCharge]       = useState(true);
  const [recherche, setRecherche]     = useState("");
  const [modalOuvert, setModal]       = useState(false);
  const [etudiantEdite, setEdite]     = useState(null);
  const [erreur, setErreur]           = useState("");
  const { aLeRole }                   = useAuth();

  const peutModifier = aLeRole("ADMIN", "SECRETAIRE");
  const peutSupprimer = aLeRole("ADMIN");

  const charger = async () => {
    setCharge(true);
    try {
      const [e, s] = await Promise.all([
        etudiantService.lister(),
        specialiteService.lister(),
      ]);
      setEtudiants(e);
      setSpecialites(s);
    } catch {
      setErreur("Erreur de chargement.");
    } finally {
      setCharge(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const supprimer = async (id) => {
    if (!window.confirm("Supprimer cet étudiant ?")) return;
    try {
      await etudiantService.supprimer(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.detail || "Suppression impossible.");
    }
  };

  const etudiantsFiltres = etudiants.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Étudiants <span className="badge">{etudiants.length}</span></h1>
        {peutModifier && (
          <button className="btn btn-primary" onClick={() => { setEdite(null); setModal(true); }}>
            + Nouvel étudiant
          </button>
        )}
      </div>

      <div className="barre-outils">
        <input
          className="recherche"
          placeholder="🔍 Rechercher par nom, prénom ou matricule..."
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
        />
      </div>

      {erreur && <div className="alert alert-erreur">{erreur}</div>}

      {chargement ? (
        <div className="chargement">Chargement...</div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Matricule</th>
                <th>Nom & Prénom</th>
                <th>Spécialité</th>
                <th>Niveau</th>
                <th>Téléphone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {etudiantsFiltres.length === 0 ? (
                <tr><td colSpan={6} className="vide">Aucun étudiant trouvé.</td></tr>
              ) : etudiantsFiltres.map(e => (
                <tr key={e.id_etudiant}>
                  <td><code>{e.matricule}</code></td>
                  <td><strong>{e.nom} {e.prenom}</strong></td>
                  <td>{e.code_specialite}</td>
                  <td>N{e.niveau}</td>
                  <td>{e.telephone_etudiant || e.telephone_parent}</td>
                  <td className="actions">
                    {peutModifier && (
                      <button className="btn btn-sm btn-secondary"
                        onClick={() => { setEdite(e); setModal(true); }}>
                        ✏️
                      </button>
                    )}
                    {peutSupprimer && (
                      <button className="btn btn-sm btn-danger"
                        onClick={() => supprimer(e.id_etudiant)}>
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOuvert && (
        <FormulaireEtudiant
          etudiant={etudiantEdite}
          specialites={specialites}
          onSuccess={() => { setModal(false); charger(); }}
          onAnnuler={() => setModal(false)}
        />
      )}
    </div>
  );
}
