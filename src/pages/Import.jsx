import { useState } from "react";
import { importService } from "../api/services";
import {
  Upload, FileSpreadsheet, CheckCircle2, XCircle,
  AlertCircle, ChevronDown, ChevronUp, Info, Loader2
} from "lucide-react";

export default function Import() {
  const [fichier, setFichier]   = useState(null);
  const [drag, setDrag]         = useState(false);
  const [resultat, setResultat] = useState(null);
  const [load, setLoad]         = useState(false);
  const [erreur, setErreur]     = useState("");
  const [detailOpen, setDetail] = useState({});

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith(".xlsx")) setFichier(f);
  };

  const handleImport = async () => {
    if (!fichier) return;
    setLoad(true); setErreur(""); setResultat(null);
    try {
      const res = await importService.importerExcel(fichier);
      setResultat(res);
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur lors de l'import.");
    } finally { setLoad(false); }
  };

  const FEUILLES = ["Specialites","Etudiants","Paiements","QR_Codes","Notifications","Calendrier_Niveaux"];

  const totalInseres   = resultat?.resultats?.reduce((s,r)=>s+r.inseres,0) || 0;
  const totalMajApp    = resultat?.resultats?.reduce((s,r)=>s+r.mis_a_jour,0) || 0;
  const totalErreurs   = resultat?.resultats?.reduce((s,r)=>s+r.erreurs,0) || 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1><Upload size={22} style={{marginRight:8,verticalAlign:"middle"}}/>Import Excel</h1>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.5rem",marginBottom:"1.5rem"}}>

        {/* Zone de dépôt */}
        <div>
          <div
            className={`import-dropzone ${drag?"drag":""} ${fichier?"has-file":""}`}
            onDragOver={e=>{e.preventDefault();setDrag(true);}}
            onDragLeave={()=>setDrag(false)}
            onDrop={handleDrop}
            onClick={()=>document.getElementById("file-input").click()}
          >
            <input id="file-input" type="file" accept=".xlsx" style={{display:"none"}}
              onChange={e=>setFichier(e.target.files[0])}/>
            {fichier ? (
              <>
                <div className="import-dropzone-icon" style={{color:"var(--green)"}}>
                  <FileSpreadsheet size={48} strokeWidth={1.5}/>
                </div>
                <div className="import-dropzone-title" style={{color:"var(--green)"}}>Fichier sélectionné</div>
                <div className="import-dropzone-sub">{fichier.name}</div>
                <div className="import-dropzone-sub">{(fichier.size/1024).toFixed(1)} Ko</div>
              </>
            ) : (
              <>
                <div className="import-dropzone-icon"><Upload size={48} strokeWidth={1.5}/></div>
                <div className="import-dropzone-title">Glissez votre fichier ici</div>
                <div className="import-dropzone-sub">ou cliquez pour sélectionner</div>
                <div className="import-dropzone-badge">Format accepté : .xlsx</div>
              </>
            )}
          </div>

          {fichier && (
            <button className="btn btn-primary" onClick={handleImport} disabled={load}
              style={{width:"100%",marginTop:"1rem",justifyContent:"center",padding:"0.8rem"}}>
              {load ? <><Loader2 size={16} className="spin"/> Import en cours...</>
                    : <><Upload size={15}/> Lancer l'import</>}
            </button>
          )}
          {erreur && <div className="alert alert-erreur" style={{marginTop:"0.75rem"}}>{erreur}</div>}
        </div>

        {/* Instructions */}
        <div className="import-instructions">
          <div className="import-instructions-title">
            <Info size={15}/> Feuilles requises dans le fichier
          </div>
          <div className="import-feuilles-list">
            {FEUILLES.map(f => (
              <div key={f} className="import-feuille-item">
                <FileSpreadsheet size={14} style={{color:"var(--green)",flexShrink:0}}/>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="import-note">
            <AlertCircle size={13}/>
            <span>L'import est incrémental : les données existantes sont mises à jour, les nouvelles sont ajoutées. Aucune suppression n'est effectuée.</span>
          </div>
        </div>
      </div>

      {/* Résultats */}
      {resultat && (
        <div className="import-results-wrap">
          {/* Résumé */}
          <div className="import-summary">
            <div className={`import-summary-status ${resultat.succes?"succes":"echec"}`}>
              {resultat.succes ? <CheckCircle2 size={20}/> : <XCircle size={20}/>}
              <span>{resultat.succes ? "Import réussi" : "Import avec erreurs"}</span>
            </div>
            <div className="import-summary-stats">
              <div className="import-stat"><span>{totalInseres}</span><label>Insérés</label></div>
              <div className="import-stat"><span>{totalMajApp}</span><label>Mis à jour</label></div>
              <div className={`import-stat ${totalErreurs>0?"erreur":""}`}><span>{totalErreurs}</span><label>Erreurs</label></div>
            </div>
          </div>

          {/* Détail par feuille */}
          <div className="import-feuilles-results">
            {resultat.resultats.map(r => (
              <div key={r.feuille} className="import-feuille-result">
                <div className="import-feuille-result-header"
                  onClick={()=>r.details?.length>0 && setDetail(d=>({...d,[r.feuille]:!d[r.feuille]}))}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <FileSpreadsheet size={14} style={{color:"var(--primary)"}}/>
                    <strong>{r.feuille}</strong>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"1rem"}}>
                    <span className="badge badge--vert">{r.inseres} insérés</span>
                    <span className="badge badge--bleu">{r.mis_a_jour} MAJ</span>
                    {r.erreurs>0 && <span className="badge badge--rouge">{r.erreurs} erreurs</span>}
                    {r.details?.length>0 && (
                      detailOpen[r.feuille] ? <ChevronUp size={14}/> : <ChevronDown size={14}/>
                    )}
                  </div>
                </div>
                {detailOpen[r.feuille] && r.details?.length>0 && (
                  <div className="import-feuille-details">
                    {r.details.map((d,i)=>(
                      <div key={i} className="import-detail-item">
                        <AlertCircle size={12} style={{color:"var(--orange)",flexShrink:0}}/>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
