import { useState, useEffect } from "react";
import { etudiantService } from "../api/services";
import api from "../api/client";

// ── Charger le QR : infos JSON + image blob ──────────────────
async function chargerQR(idEtudiant) {
  // 1. Infos du QR
  const infoRes = await api.get(`/etudiants/${idEtudiant}/qr-code`);
  const info    = infoRes.data;

  // 2. Image PNG (blob) — avec gestion fine de l'erreur
  const imgRes  = await api.get(
    `/etudiants/${idEtudiant}/qr-code/image`,
    { responseType: "blob" }
  );
  const imageSrc = URL.createObjectURL(imgRes.data);

  return { info, imageSrc };
}

// Transformer une erreur Axios en message lisible
function messageErreur(err) {
  if (err.response) {
    const code = err.response.status;
    // Le corps d'erreur est un blob → on doit le lire
    if (code === 404) return "Aucun QR code pour cet étudiant (pas encore de paiement soldé).";
    if (code === 401) return "Session expirée. Reconnectez-vous.";
    if (code === 500) return "Erreur serveur lors de la génération du QR.";
    return `Erreur ${code}.`;
  }
  if (err.request) return "Le serveur ne répond pas. Vérifiez que le backend est démarré (port 8000).";
  return err.message || "Erreur inconnue.";
}

// ── Miniature QR pour la grille ──────────────────────────────
function MiniatureQR({ idEtudiant }) {
  const [src, setSrc] = useState(null);
  const [etat, setEtat] = useState("charge");

  useEffect(() => {
    chargerQR(idEtudiant)
      .then(({ imageSrc }) => { setSrc(imageSrc); setEtat("ok"); })
      .catch(() => setEtat("vide"));
  }, [idEtudiant]);

  return (
    <div className="qr-thumb-box">
      {etat === "charge" && <span style={{ fontSize: "1rem" }}>⏳</span>}
      {etat === "vide"   && <span style={{ fontSize: "1.8rem" }}>🔲</span>}
      {etat === "ok"     && (
        <img src={src} alt="QR" style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
      )}
    </div>
  );
}

// ── Modal détail QR ──────────────────────────────────────────
function ModalQR({ etudiant, onFermer }) {
  const [src, setSrc]       = useState(null);
  const [info, setInfo]     = useState(null);
  const [charge, setCharge] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    chargerQR(etudiant.id_etudiant)
      .then(({ info, imageSrc }) => { setInfo(info); setSrc(imageSrc); })
      .catch((err) => {
        console.error("Erreur QR code :", err);
        setErreur(messageErreur(err));
      })
      .finally(() => setCharge(false));
  }, [etudiant.id_etudiant]);

  const telecharger = () => {
    if (!src) return;
    const a = document.createElement("a");
    a.href = src;
    a.download = `QR_${etudiant.matricule}.png`;
    a.click();
  };

  const imprimer = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html><head><title>QR — ${etudiant.nom} ${etudiant.prenom}</title>
      <style>body{font-family:sans-serif;text-align:center;padding:2rem}img{width:250px;height:250px;margin:1rem 0}</style>
      </head><body>
        <h2>${etudiant.nom} ${etudiant.prenom}</h2>
        <p>${etudiant.matricule} · ${etudiant.code_specialite} · Niveau ${etudiant.niveau}</p>
        <img src="${src}" />
        <p>Statut : <strong>${info?.statut || ""}</strong></p>
        <script>window.onload=()=>window.print()</script>
      </body></html>
    `);
    w.document.close();
  };

  let contenuQR = null;
  if (info?.qr_data) {
    try { contenuQR = JSON.parse(info.qr_data); }
    catch { /* qr_data n'est pas du JSON, on ignore */ }
  }

  const couleur = { ACTIF: "vert", EXPIRE: "rouge", UTILISE: "orange" };

  return (
    <div className="modal-overlay">
      <div className="modal modal--petit">
        <div className="modal-header">
          <h2>QR Code — {etudiant.nom} {etudiant.prenom}</h2>
          <button className="btn-close" onClick={onFermer}>✕</button>
        </div>

        <div className="modal-body" style={{ textAlign: "center" }}>
          {charge && <div className="chargement">Chargement du QR code...</div>}

          {!charge && erreur && (
            <div className="qr-vide">
              <div style={{ fontSize: "3.5rem", marginBottom: "0.75rem" }}>⚠️</div>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>QR code indisponible</p>
              <p style={{ fontSize: "0.85rem", color: "var(--texte-doux)" }}>{erreur}</p>
            </div>
          )}

          {!charge && src && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span className="badge badge--bleu">{etudiant.matricule}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--texte-doux)" }}>
                  {etudiant.code_specialite} · Niveau {etudiant.niveau}
                </span>
              </div>

              {info?.statut && (
                <div style={{ marginBottom: "1rem" }}>
                  <span className={`badge badge--${couleur[info.statut] || "gris"}`}>{info.statut}</span>
                  {info.date_generation && (
                    <span style={{ fontSize: "0.78rem", color: "var(--texte-doux)", marginLeft: "0.5rem" }}>
                      Généré le {info.date_generation}
                    </span>
                  )}
                </div>
              )}

              <div style={{ background: "white", borderRadius: 12, padding: "1.2rem", display: "inline-block", border: "1px solid var(--bordure)", marginBottom: "1.2rem" }}>
                <img src={src} alt={`QR ${etudiant.nom}`} style={{ width: 220, height: 220, imageRendering: "pixelated", display: "block" }} />
              </div>

              {contenuQR && (
                <div style={{ background: "var(--bg)", borderRadius: 8, padding: "0.75rem", textAlign: "left", marginBottom: "1.2rem", border: "1px solid var(--bordure)", fontSize: "0.8rem", color: "var(--texte-doux)" }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.4rem", color: "var(--texte)" }}>Données encodées :</div>
                  {Object.entries(contenuQR).map(([k, v]) => (
                    <div key={k}><strong>{k}</strong> : {String(v)}</div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={telecharger}>⬇️ Télécharger PNG</button>
                <button className="btn btn-secondary" onClick={imprimer}>🖨️ Imprimer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────
export default function QRCodes() {
  const [etudiants, setEtudiants] = useState([]);
  const [charge, setCharge]       = useState(true);
  const [recherche, setRecherche] = useState("");
  const [sel, setSel]             = useState(null);
  const [erreur, setErreur]       = useState("");

  useEffect(() => {
    etudiantService.lister()
      .then(setEtudiants)
      .catch((err) => setErreur(messageErreur(err)))
      .finally(() => setCharge(false));
  }, []);

  const filtres = etudiants.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule} ${e.code_specialite}`
      .toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1>QR Codes étudiants</h1>
        <p style={{ fontSize: "0.85rem", color: "var(--texte-doux)" }}>
          Cliquez sur un étudiant pour afficher, télécharger ou imprimer son QR code
        </p>
      </div>

      <div className="barre-outils">
        <input className="recherche" placeholder="🔍 Rechercher..."
          value={recherche} onChange={e => setRecherche(e.target.value)} />
      </div>

      {erreur && <div className="alert alert-erreur">{erreur}</div>}

      {charge ? <div className="chargement">Chargement...</div> : (
        <div className="qr-grid">
          {filtres.length === 0
            ? <div className="vide">Aucun étudiant trouvé.</div>
            : filtres.map(e => (
              <div key={e.id_etudiant} className="qr-card" onClick={() => setSel(e)}>
                <MiniatureQR idEtudiant={e.id_etudiant} />
                <div className="qr-card-info">
                  <div className="qr-card-nom">{e.nom} {e.prenom}</div>
                  <div className="qr-card-matricule">{e.matricule}</div>
                  <div className="qr-card-spec">{e.code_specialite} · N{e.niveau}</div>
                </div>
                <div className="qr-card-action">→</div>
              </div>
            ))
          }
        </div>
      )}

      {sel && <ModalQR etudiant={sel} onFermer={() => setSel(null)} />}
    </div>
  );
}
