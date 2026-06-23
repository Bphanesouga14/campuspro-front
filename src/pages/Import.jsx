// ============================================================
//  src/pages/Import.jsx  —  Import du fichier Excel
// ============================================================

import { useState } from "react";
import { importService } from "../api/services";

export default function Import() {
  const [fichier, setFichier]     = useState(null);
  const [resultat, setResultat]   = useState(null);
  const [chargement, setCharge]   = useState(false);
  const [erreur, setErreur]       = useState("");

  const handleImport = async () => {
    if (!fichier) return;
    setCharge(true);
    setErreur("");
    setResultat(null);
    try {
      const res = await importService.importerExcel(fichier);
      setResultat(res);
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'import.");
    } finally {
      setCharge(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Import Excel</h1>
      </div>

      <div className="card">
        <div className="card-header">Importer le fichier GestionScolaire_SIGC.xlsx</div>
        <p style={{ color: "#666", marginBottom: "1rem" }}>
          Le fichier doit contenir les feuilles : <strong>Specialites</strong>, <strong>Etudiants</strong>,
          <strong>Paiements</strong>, <strong>QR_Codes</strong>, <strong>Notifications</strong>, <strong>Calendrier_Niveaux</strong>.
        </p>

        <div className="import-zone">
          <input
            type="file"
            accept=".xlsx"
            onChange={e => setFichier(e.target.files[0])}
            id="fichier-excel"
            style={{ display: "none" }}
          />
          <label htmlFor="fichier-excel" className="btn btn-secondary" style={{ cursor: "pointer" }}>
            📂 Choisir le fichier Excel
          </label>
          {fichier && <span className="fichier-nom">📄 {fichier.name}</span>}
        </div>

        {erreur && <div className="alert alert-erreur">{erreur}</div>}

        <button
          className="btn btn-primary"
          onClick={handleImport}
          disabled={!fichier || chargement}
          style={{ marginTop: "1rem" }}
        >
          {chargement ? "⏳ Import en cours..." : "🚀 Lancer l'import"}
        </button>
      </div>

      {/* Résultats de l'import */}
      {resultat && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <div className="card-header">
            Résultat de l'import
            <span className={`badge badge--${resultat.succes ? "vert" : "rouge"}`} style={{ marginLeft: "0.5rem" }}>
              {resultat.succes ? "✅ Succès" : "❌ Échec"}
            </span>
          </div>
          <p>{resultat.message}</p>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Feuille</th>
                  <th>Insérés</th>
                  <th>Mis à jour</th>
                  <th>Erreurs</th>
                  <th>Détails</th>
                </tr>
              </thead>
              <tbody>
                {resultat.resultats.map(r => (
                  <tr key={r.feuille}>
                    <td><strong>{r.feuille}</strong></td>
                    <td className="centrer">{r.inseres}</td>
                    <td className="centrer">{r.mis_a_jour}</td>
                    <td className="centrer">
                      {r.erreurs > 0
                        ? <span className="badge badge--rouge">{r.erreurs}</span>
                        : <span className="badge badge--vert">0</span>
                      }
                    </td>
                    <td>
                      {r.details?.length > 0 && (
                        <details>
                          <summary>{r.details.length} message(s)</summary>
                          <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                            {r.details.map((d, i) => <li key={i} style={{ fontSize: "0.8rem" }}>{d}</li>)}
                          </ul>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
