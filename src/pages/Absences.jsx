import { useState, useEffect } from "react";
import api from "../api/client";
import {
  UserX, AlertTriangle, CheckCircle2, Search,
  ChevronDown, ChevronUp, Clock, BookOpen
} from "lucide-react";

function BadgeTaux({ taux, alerte }) {
  const couleur = alerte ? "rouge" : taux >= 90 ? "vert" : "orange";
  return (
    <span className={`badge badge--${couleur}`}
      style={{display:"inline-flex",alignItems:"center",gap:4}}>
      {alerte ? <AlertTriangle size={10}/> : <CheckCircle2 size={10}/>}
      {taux}%
    </span>
  );
}

function BarrePresence({ taux }) {
  const couleur = taux < 75 ? "var(--red)" : taux < 90 ? "var(--orange)" : "var(--green)";
  return (
    <div style={{
      height:6, background:"var(--border)", borderRadius:99,
      overflow:"hidden", minWidth:80
    }}>
      <div style={{
        height:"100%", width:`${taux}%`,
        background:couleur, borderRadius:99,
        transition:"width 0.5s"
      }}/>
    </div>
  );
}

function DetailEtudiant({ idEtudiant, onFermer }) {
  const [detail, setDetail] = useState(null);
  const [load, setLoad]     = useState(true);

  useEffect(() => {
    api.get(`/presences/absences/${idEtudiant}`)
      .then(r => setDetail(r.data))
      .finally(() => setLoad(false));
  }, [idEtudiant]);

  return (
    <div className="modal-overlay">
      <div className="modal modal-fiche">
        <div className="modal-header">
          <h2>
            <Clock size={16} style={{marginRight:8,verticalAlign:"middle"}}/>
            {detail?.nom_complet || "Chargement..."}
          </h2>
          <button className="btn-close" onClick={onFermer}>✕</button>
        </div>
        <div className="modal-body">
          {load ? <div className="loading-text">Chargement...</div> : (
            <>
              <div style={{
                display:"flex", gap:"1rem", marginBottom:"1.25rem",
                flexWrap:"wrap"
              }}>
                {[
                  ["Matricule",   detail?.matricule],
                  ["Spécialité",  detail?.specialite],
                  ["Total présences", detail?.total_presences],
                ].map(([k,v]) => (
                  <div key={k} style={{
                    background:"var(--bg2)", borderRadius:10,
                    padding:"0.75rem 1rem", flex:1, minWidth:120
                  }}>
                    <div style={{fontSize:"0.72rem",color:"var(--text3)",marginBottom:3}}>
                      {k}
                    </div>
                    <div style={{fontWeight:700,color:"var(--text)"}}>{v}</div>
                  </div>
                ))}
              </div>

              {detail?.presences?.length === 0 ? (
                <div className="empty-state">
                  <UserX size={36} strokeWidth={1.5}/>
                  <p style={{marginTop:10}}>Aucune présence enregistrée</p>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Heure</th>
                        <th>Cours</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail?.presences?.map(p => (
                        <tr key={p.id}>
                          <td>{p.date}</td>
                          <td>{p.heure}</td>
                          <td>{p.cours}</td>
                          <td>
                            <span className={`badge badge--${p.valide?"vert":"rouge"}`}>
                              {p.valide ? "Présent" : "Invalidé"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Absences() {
  const [data, setData]         = useState(null);
  const [load, setLoad]         = useState(true);
  const [recherche, setRech]    = useState("");
  const [filtre, setFiltre]     = useState("tous");
  const [selEtudiant, setSel]   = useState(null);

  useEffect(() => {
    api.get("/presences/absences/stats")
      .then(r => setData(r.data))
      .finally(() => setLoad(false));
  }, []);

  const filtres = (data?.etudiants || []).filter(e => {
    const match = `${e.nom_complet} ${e.matricule} ${e.specialite}`
      .toLowerCase().includes(recherche.toLowerCase());
    if (filtre === "alerte") return match && e.alerte;
    if (filtre === "ok")     return match && !e.alerte;
    return match;
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>
            <UserX size={20} style={{marginRight:8,verticalAlign:"middle"}}/>
            Gestion des absences
            {data && <span className="count-badge">{data.total_etudiants}</span>}
          </h1>
          {data && (
            <p style={{fontSize:"0.83rem",color:"var(--text2)",marginTop:3}}>
              {data.total_seances} séance(s) enregistrée(s) ·{" "}
              <span style={{color:"var(--red)",fontWeight:600}}>
                {data.en_alerte} étudiant(s) en alerte
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Résumé stats */}
      {data && (
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          gap:"1rem", marginBottom:"1.5rem"
        }}>
          {[
            { label:"Total séances",  valeur:data.total_seances,   couleur:"bleu"   },
            { label:"Total étudiants",valeur:data.total_etudiants, couleur:"violet" },
            { label:"En alerte (< 75%)", valeur:data.en_alerte,   couleur:"rouge"  },
          ].map(s => (
            <div key={s.label} className={`stat-card color-${s.couleur}`}>
              <div className="stat-value">{s.valeur}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="toolbar" style={{marginBottom:"1.25rem"}}>
        <div className="search-bar" style={{maxWidth:380}}>
          <input placeholder="Rechercher un étudiant..."
            value={recherche} onChange={e=>setRech(e.target.value)}/>
        </div>
        <div className="tabs">
          {[
            ["tous",   "Tous"],
            ["alerte", "⚠ En alerte"],
            ["ok",     "✓ OK"],
          ].map(([val,lab]) => (
            <button key={val} className={`tab ${filtre===val?"actif":""}`}
              onClick={() => setFiltre(val)}>
              {lab}
            </button>
          ))}
        </div>
      </div>

      {load ? <div className="loading-text">Chargement...</div> :
       !data || data.total_seances === 0 ? (
        <div className="empty-state" style={{marginTop:"3rem"}}>
          <UserX size={48} strokeWidth={1.2}/>
          <p style={{marginTop:12,fontWeight:600}}>Aucune séance enregistrée</p>
          <p style={{fontSize:"0.83rem",color:"var(--text3)",marginTop:4}}>
            Les présences sont enregistrées automatiquement via le scan QR depuis l'application Flutter
          </p>
        </div>
       ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Spécialité</th>
                <th>Présences</th>
                <th>Absences</th>
                <th>Taux présence</th>
                <th>Progression</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtres.length === 0 ? (
                <tr><td colSpan={7} className="table-empty">
                  Aucun étudiant trouvé
                </td></tr>
              ) : filtres.map(e => (
                <tr key={e.id_etudiant}
                  className="clickable-row"
                  onClick={() => setSel(e.id_etudiant)}
                  style={{cursor:"pointer"}}>
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                      <div>
                        <div className="table-name">{e.nom_complet}</div>
                        <div className="table-sub">{e.matricule}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--bleu">{e.specialite}</span>
                  </td>
                  <td style={{fontWeight:600,color:"var(--green)"}}>
                    {e.nb_presences}
                  </td>
                  <td style={{fontWeight:600,color:e.nb_absences>0?"var(--red)":"var(--text2)"}}>
                    {e.nb_absences}
                  </td>
                  <td style={{fontWeight:700,color:e.alerte?"var(--red)":"var(--green)"}}>
                    {e.taux_presence}%
                  </td>
                  <td style={{minWidth:100}}>
                    <BarrePresence taux={e.taux_presence}/>
                  </td>
                  <td>
                    <BadgeTaux taux={e.taux_presence} alerte={e.alerte}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
       )}

      {selEtudiant && (
        <DetailEtudiant
          idEtudiant={selEtudiant}
          onFermer={() => setSel(null)}
        />
      )}
    </div>
  );
}