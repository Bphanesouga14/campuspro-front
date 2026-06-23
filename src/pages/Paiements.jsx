// ============================================================
//  src/pages/Paiements.jsx  —  Gestion des paiements
// ============================================================

import { useState, useEffect } from "react";
import { etudiantService, paiementService } from "../api/services";
import { useAuth } from "../context/AuthContext";

// Formater montant en FCFA
const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

// Couleur du badge selon le statut
const couleurStatut = { "PAYÉ": "vert", "PARTIEL": "orange", "EN_ATTENTE": "gris", "EN_RETARD": "rouge" };

function BadgeStatut({ statut }) {
  return <span className={`badge badge--${couleurStatut[statut] || "gris"}`}>{statut}</span>;
}

// ── Formulaire de versement ──────────────────────────────────
function FormulaireVersement({ paiement, onSuccess, onAnnuler }) {
  const [montant, setMontant]   = useState(paiement.montant_attendu - paiement.montant_paye);
  const [date, setDate]         = useState(new Date().toLocaleDateString("fr-FR"));
  const [erreur, setErreur]     = useState("");
  const [chargement, setCharge] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setCharge(true);
    try {
      await paiementService.payer(paiement.id_paiement, {
        montant: Number(montant),
        datePaiement: date,
      });
      onSuccess();
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors du versement.");
    } finally {
      setCharge(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal--petit">
        <div className="modal-header">
          <h2>Enregistrer un versement</h2>
          <button className="btn-close" onClick={onAnnuler}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="info-paiement">
            <div>Tranche {paiement.numero_tranche} — {fcfa(paiement.montant_attendu)}</div>
            <div>Déjà versé : {fcfa(paiement.montant_paye)}</div>
            <div>Reste : <strong>{fcfa(paiement.montant_attendu - paiement.montant_paye)}</strong></div>
          </div>
          <div className="form-group">
            <label>Montant à verser (FCFA) *</label>
            <input
              type="number"
              value={montant}
              onChange={e => setMontant(e.target.value)}
              min="1"
              max={paiement.montant_attendu - paiement.montant_paye}
              required
            />
          </div>
          <div className="form-group">
            <label>Date de paiement *</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="JJ/MM/AAAA"
              required
            />
          </div>
          {erreur && <div className="alert alert-erreur">{erreur}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onAnnuler}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={chargement}>
              {chargement ? "Enregistrement..." : "Confirmer le versement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────
export default function Paiements() {
  const [etudiants, setEtudiants]   = useState([]);
  const [retards, setRetards]       = useState([]);
  const [onglet, setOnglet]         = useState("liste"); // "liste" | "retards"
  const [recherche, setRecherche]   = useState("");
  const [etudiantSelectionne, setSel] = useState(null);
  const [paiements, setPaiements]   = useState([]);
  const [paiementActif, setPActif]  = useState(null);
  const [chargement, setCharge]     = useState(true);
  const { aLeRole }                 = useAuth();

  const peutPayer = aLeRole("ADMIN", "CAISSIER");

  useEffect(() => {
    Promise.all([
      etudiantService.lister(),
      paiementService.retards(),
    ]).then(([e, r]) => {
      setEtudiants(e);
      setRetards(r);
    }).finally(() => setCharge(false));
  }, []);

  const voirPaiements = async (etudiant) => {
    setSel(etudiant);
    setPaiements([]);
    const p = await etudiantService.paiements(etudiant.id_etudiant);
    setPaiements(p.paiements || []);
  };

  const apresVersement = async () => {
    setPActif(null);
    if (etudiantSelectionne) {
      await voirPaiements(etudiantSelectionne);
    }
    // Rafraîchir les retards
    const r = await paiementService.retards();
    setRetards(r);
  };

  const etudiantsFiltres = etudiants.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(recherche.toLowerCase())
  );

  if (chargement) return <div className="chargement">Chargement...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Paiements</h1>
        <div className="onglets">
          <button className={`onglet ${onglet === "liste" ? "actif" : ""}`} onClick={() => setOnglet("liste")}>
            Liste étudiants
          </button>
          <button className={`onglet ${onglet === "retards" ? "actif" : ""}`} onClick={() => setOnglet("retards")}>
            En retard <span className="badge badge--rouge">{retards.length}</span>
          </button>
        </div>
      </div>

      {onglet === "liste" && (
        <div className="paiements-layout">
          {/* Colonne gauche : liste des étudiants */}
          <div className="paiements-liste">
            <input
              className="recherche"
              placeholder="🔍 Rechercher..."
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
            />
            {etudiantsFiltres.map(e => (
              <div
                key={e.id_etudiant}
                className={`etudiant-item ${etudiantSelectionne?.id_etudiant === e.id_etudiant ? "actif" : ""}`}
                onClick={() => voirPaiements(e)}
              >
                <div className="etudiant-nom">{e.nom} {e.prenom}</div>
                <div className="etudiant-info">{e.matricule} · N{e.niveau}</div>
              </div>
            ))}
          </div>

          {/* Colonne droite : paiements de l'étudiant sélectionné */}
          <div className="paiements-detail">
            {!etudiantSelectionne ? (
              <div className="vide-centre">Sélectionnez un étudiant pour voir ses paiements.</div>
            ) : (
              <>
                <div className="detail-header">
                  <strong>{etudiantSelectionne.nom} {etudiantSelectionne.prenom}</strong>
                  <span>{etudiantSelectionne.code_specialite} · N{etudiantSelectionne.niveau}</span>
                </div>
                {paiements.length === 0 ? (
                  <div className="vide">Aucun paiement enregistré.</div>
                ) : paiements.map(p => (
                  <div key={p.id_paiement} className="paiement-card">
                    <div className="paiement-info">
                      <div><strong>Tranche {p.numero_tranche}</strong></div>
                      <div>{fcfa(p.montant_paye)} / {fcfa(p.montant_attendu)}</div>
                      <div className="paiement-date">Limite : {p.date_limite}</div>
                    </div>
                    <div className="paiement-droite">
                      <BadgeStatut statut={p.statut} />
                      {peutPayer && p.statut !== "PAYÉ" && (
                        <button className="btn btn-sm btn-primary" onClick={() => setPActif(p)}>
                          💵 Payer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {onglet === "retards" && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Spécialité</th>
                <th>Tranche</th>
                <th>Attendu</th>
                <th>Payé</th>
                <th>Date limite</th>
                <th>Statut</th>
                {peutPayer && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {retards.length === 0 ? (
                <tr><td colSpan={8} className="vide">Aucun retard 🎉</td></tr>
              ) : retards.map(p => (
                <tr key={p.id_paiement}>
                  <td>{p.id_etudiant}</td>
                  <td>{p.id_specialite}</td>
                  <td>T{p.numero_tranche}</td>
                  <td>{fcfa(p.montant_attendu)}</td>
                  <td>{fcfa(p.montant_paye)}</td>
                  <td>{p.date_limite}</td>
                  <td><BadgeStatut statut={p.statut} /></td>
                  {peutPayer && (
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => setPActif(p)}>
                        💵 Payer
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paiementActif && (
        <FormulaireVersement
          paiement={paiementActif}
          onSuccess={apresVersement}
          onAnnuler={() => setPActif(null)}
        />
      )}
    </div>
  );
}
