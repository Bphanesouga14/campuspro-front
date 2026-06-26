import { useState, useEffect } from "react";
import { etudiantService, paiementService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import {
  Search, CreditCard, AlertCircle, CheckCircle2,
  Clock, X, Banknote, ChevronRight, Filter, ReceiptText
} from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n);

const STATUT_META = {
  "PAYÉ":       { cl:"vert",   Icon:CheckCircle2 },
  "PARTIEL":    { cl:"orange", Icon:Clock        },
  "EN_ATTENTE": { cl:"gris",   Icon:Clock        },
  "EN_RETARD":  { cl:"rouge",  Icon:AlertCircle  },
};

function BadgeStatut({ statut }) {
  const meta = STATUT_META[statut] || STATUT_META["EN_ATTENTE"];
  return (
    <span className={`badge badge--${meta.cl}`} style={{display:"inline-flex",alignItems:"center",gap:4}}>
      <meta.Icon size={10}/> {statut}
    </span>
  );
}

// ── Modal versement ───────────────────────────────────────────
function ModalVersement({ paiement, etudiant, onSuccess, onFermer }) {
  const reste = paiement.montant_attendu - paiement.montant_paye;
  const [montant, setMontant] = useState(reste);
  const [date, setDate]       = useState(new Date().toLocaleDateString("fr-FR"));
  const [erreur, setErreur]   = useState("");
  const [load, setLoad]       = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setErreur(""); setLoad(true);
    try {
      await paiementService.payer(paiement.id_paiement, { montant:Number(montant), datePaiement:date });
      onSuccess();
    } catch (err) { setErreur(err.response?.data?.detail || "Erreur lors du versement."); }
    finally { setLoad(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Banknote size={18} style={{color:"var(--green)"}}/>
            <h2>Enregistrer un versement</h2>
          </div>
          <button className="btn-close" onClick={onFermer}><X size={16}/></button>
        </div>
        <div className="modal-body">
          {/* Récap étudiant */}
          <div className="versement-recap">
            <div className="versement-recap-row">
              <span>Étudiant</span>
              <strong>{etudiant?.nom} {etudiant?.prenom}</strong>
            </div>
            <div className="versement-recap-row">
              <span>Tranche</span>
              <strong>Tranche {paiement.numero_tranche}</strong>
            </div>
            <div className="versement-recap-row">
              <span>Montant attendu</span>
              <strong>{fmt(paiement.montant_attendu)} FCFA</strong>
            </div>
            <div className="versement-recap-row">
              <span>Déjà versé</span>
              <strong style={{color:"var(--green)"}}>{fmt(paiement.montant_paye)} FCFA</strong>
            </div>
            <div className="versement-recap-row versement-recap-total">
              <span>Reste à payer</span>
              <strong style={{color:"var(--red)"}}>{fmt(reste)} FCFA</strong>
            </div>
          </div>

          <form onSubmit={submit} style={{marginTop:"1.25rem"}}>
            <div className="form-group" style={{marginBottom:"1rem"}}>
              <label>Montant à verser (FCFA) *</label>
              <input type="number" value={montant} min="1" max={reste} required
                onChange={e => setMontant(e.target.value)}/>
            </div>
            <div className="form-group" style={{marginBottom:"1rem"}}>
              <label>Date de paiement *</label>
              <input type="text" value={date} placeholder="JJ/MM/AAAA" required
                onChange={e => setDate(e.target.value)}/>
            </div>
            {erreur && <div className="alert alert-erreur">{erreur}</div>}
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onFermer}>Annuler</button>
              <button type="submit" className="btn btn-primary" disabled={load}>
                <Banknote size={14}/> {load ? "Traitement..." : "Confirmer le versement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Panel détail paiements d'un étudiant ─────────────────────
function PanelPaiements({ etudiant, onPayer, peutPayer }) {
  const [paiements, setPai] = useState([]);
  const [load, setLoad]     = useState(true);

  useEffect(() => {
    setLoad(true);
    etudiantService.paiements(etudiant.id_etudiant)
      .then(d => setPai(d.paiements || []))
      .finally(() => setLoad(false));
  }, [etudiant.id_etudiant]);

  const totalAttendu = paiements.reduce((s,p) => s + p.montant_attendu, 0);
  const totalVerse   = paiements.reduce((s,p) => s + p.montant_paye, 0);
  const taux         = totalAttendu > 0 ? (totalVerse / totalAttendu * 100) : 0;

  // Couleur de la barre de tranche selon statut
  const barCouleur = (statut) => {
    if (statut === "PAYÉ")      return "var(--green)";
    if (statut === "PARTIEL")   return "var(--orange)";
    if (statut === "EN_RETARD") return "var(--red)";
    return "var(--border)";
  };

  return (
    <div className="pay-detail" style={{display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Header étudiant — fixe */}
      <div className="pay-detail-header" style={{flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="table-avatar" style={{width:42,height:42,borderRadius:12,fontSize:"1rem"}}>
            {etudiant.prenom?.[0]}{etudiant.nom?.[0]}
          </div>
          <div>
            <div style={{fontWeight:700,color:"var(--text)"}}>{etudiant.nom} {etudiant.prenom}</div>
            <div style={{fontSize:"0.78rem",color:"var(--text2)"}}>{etudiant.matricule} · {etudiant.code_specialite} · N{etudiant.niveau}</div>
          </div>
        </div>
      </div>

      {/* Zone scrollable */}
      <div style={{flex:1,overflowY:"auto",padding:"0 1.25rem 1.25rem"}}>

        {/* Barre de progression globale */}
        {!load && (
          <div className="pay-progress-wrap" style={{marginTop:"1rem"}}>
            <div className="pay-progress-labels">
              <span style={{fontSize:"0.78rem",color:"var(--text2)"}}>Progression globale des paiements</span>
              <span style={{fontWeight:700,color:"var(--primary)"}}>{taux.toFixed(1)}%</span>
            </div>
            <div className="recouvrement-track" style={{height:10,marginBottom:"0.6rem"}}>
              <div className="recouvrement-fill" style={{width:`${taux}%`}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.75rem",color:"var(--text2)"}}>
              <span>Versé : <strong style={{color:"var(--green)"}}>{fmt(totalVerse)} FCFA</strong></span>
              <span>Total attendu : <strong>{fmt(totalAttendu)} FCFA</strong></span>
            </div>
          </div>
        )}

        {load ? (
          <div className="loading-text" style={{padding:"2rem"}}>Chargement...</div>
        ) : paiements.length === 0 ? (
          <div className="empty-state" style={{padding:"2rem"}}>
            <CreditCard size={32} strokeWidth={1.5}/><br/>Aucune tranche enregistrée
          </div>
        ) : (
          <div className="pay-cards-list">
            {paiements.map((p, idx) => {
              const pct = p.montant_attendu > 0
                ? Math.min(p.montant_paye / p.montant_attendu * 100, 100)
                : 0;
              const isPaye = p.statut === "PAYÉ";
              return (
                <div key={p.id_paiement} className={`pay-tranche-card statut-${p.statut}`}>
                  {/* Numéro + badge statut */}
                  <div className="pay-tranche-top">
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className={`pay-tranche-num-badge tranche-${idx+1}`}>T{p.numero_tranche}</div>
                      <div className="pay-tranche-num">Tranche {p.numero_tranche}</div>
                    </div>
                    <BadgeStatut statut={p.statut}/>
                  </div>

                  {/* Barre de progression de cette tranche */}
                  <div className="pay-tranche-montants">
                    <div className="pay-tranche-bar">
                      <div className="pay-tranche-fill"
                        style={{
                          width:`${pct}%`,
                          background: barCouleur(p.statut),
                        }}/>
                    </div>
                    <div className="pay-tranche-chiffres">
                      <span>
                        <strong style={{color: isPaye ? "var(--green)" : "var(--primary)"}}>
                          {fmt(p.montant_paye)}
                        </strong>
                        {" "}/ {fmt(p.montant_attendu)} FCFA
                      </span>
                      {!isPaye && p.montant_paye < p.montant_attendu && (
                        <span style={{color:"var(--red)",fontSize:"0.76rem",fontWeight:600}}>
                          Reste : {fmt(p.montant_attendu - p.montant_paye)} FCFA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date limite + bouton payer */}
                  <div className="pay-tranche-footer">
                    <span style={{display:"flex",alignItems:"center",gap:4,fontSize:"0.75rem",color:"var(--text3)"}}>
                      <Clock size={11}/> Limite : {p.date_limite}
                    </span>
                    {peutPayer && !isPaye && (
                      <button className="btn btn-primary btn-sm" onClick={() => onPayer(p)}>
                        <Banknote size={12}/> Payer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Paiements() {
  const [etudiants, setEtudiants] = useState([]);
  const [retards, setRetards]     = useState([]);
  const [onglet, setOnglet]       = useState("liste");
  const [recherche, setRecherche] = useState("");
  const [selEtudiant, setSel]     = useState(null);
  const [paiementActif, setPActif]= useState(null);
  const [load, setLoad]           = useState(true);
  const { aLeRole }               = useAuth();
  const peutPayer = aLeRole("ADMIN","CAISSIER");

  const charger = async () => {
    setLoad(true);
    const [e, r] = await Promise.all([etudiantService.lister(), paiementService.retards()]);
    setEtudiants(e); setRetards(r);
    setLoad(false);
  };
  useEffect(() => { charger(); }, []);

  const apresVersement = () => {
    setPActif(null);
    if (selEtudiant) setSel({...selEtudiant, _refresh: Date.now()});
    paiementService.retards().then(setRetards);
  };

  const filtres = etudiants.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule} ${e.code_specialite}`.toLowerCase().includes(recherche.toLowerCase())
  );

  if (load) return <div className="page-load"><div className="page-spinner"/></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><CreditCard size={22} style={{marginRight:8,verticalAlign:"middle"}}/>
            Paiements <span className="count-badge">{etudiants.length}</span>
          </h1>
        </div>
        <div className="tabs">
          <button className={`tab ${onglet==="liste"?"actif":""}`} onClick={()=>setOnglet("liste")}>
            <ReceiptText size={14}/> Liste étudiants
          </button>
          <button className={`tab ${onglet==="retards"?"actif":""}`} onClick={()=>setOnglet("retards")}>
            <AlertCircle size={14}/> En retard
            {retards.length > 0 && <span className="count-badge" style={{background:"var(--red-soft)",color:"var(--red)"}}>{retards.length}</span>}
          </button>
        </div>
      </div>

      {onglet === "liste" && (
        <div className="pay-layout">
          {/* Liste étudiants */}
          <div className="pay-list">
            <div className="pay-list-search">
              <div style={{position:"relative"}}>
                <Search size={14} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"var(--text3)"}}/>
                <input placeholder="Rechercher un étudiant..." value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                  style={{paddingLeft:32,width:"100%",padding:"0.6rem 0.85rem 0.6rem 2rem",
                    border:"1.5px solid var(--border)",borderRadius:8,background:"var(--bg2)",
                    color:"var(--text)",fontSize:"0.85rem"}}/>
              </div>
            </div>
            <div style={{overflowY:"auto",maxHeight:"calc(100vh - 280px)"}}>
              {filtres.length === 0 ? (
                <div className="empty-state" style={{padding:"2rem"}}>Aucun étudiant trouvé</div>
              ) : filtres.map(e => (
                <div key={e.id_etudiant}
                  className={`pay-item ${selEtudiant?.id_etudiant===e.id_etudiant?"actif":""}`}
                  onClick={()=>setSel(e)}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div className="table-avatar" style={{width:34,height:34,borderRadius:9,fontSize:"0.8rem",flexShrink:0}}>
                      {e.prenom?.[0]}{e.nom?.[0]}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="pay-item-name">{e.nom} {e.prenom}</div>
                      <div className="pay-item-sub">{e.matricule} · N{e.niveau}</div>
                    </div>
                    <ChevronRight size={14} style={{color:"var(--text3)",flexShrink:0}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Détail */}
          {selEtudiant ? (
            <PanelPaiements key={selEtudiant._refresh}
              etudiant={selEtudiant} peutPayer={peutPayer} onPayer={setPActif}/>
          ) : (
            <div className="pay-detail" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div className="empty-state">
                <CreditCard size={36} strokeWidth={1.5}/>
                <p>Sélectionnez un étudiant<br/>pour voir ses paiements</p>
              </div>
            </div>
          )}
        </div>
      )}

      {onglet === "retards" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Étudiant</th><th>Spécialité</th><th>Tranche</th>
                <th>Attendu</th><th>Versé</th><th>Reste</th>
                <th>Limite</th><th>Statut</th>
                {peutPayer && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {retards.length === 0 ? (
                <tr><td colSpan={9} className="table-empty">
                  <CheckCircle2 size={28} style={{color:"var(--green)",marginBottom:6}}/><br/>Aucun retard de paiement
                </td></tr>
              ) : retards.map(p => (
                <tr key={p.id_paiement}>
                  <td><code style={{fontSize:"0.78rem"}}>{p.id_etudiant}</code></td>
                  <td>{p.id_specialite}</td>
                  <td>T{p.numero_tranche}</td>
                  <td>{fmt(p.montant_attendu)} FCFA</td>
                  <td style={{color:"var(--green)"}}>{fmt(p.montant_paye)} FCFA</td>
                  <td style={{color:"var(--red)",fontWeight:600}}>{fmt(p.montant_attendu-p.montant_paye)} FCFA</td>
                  <td>{p.date_limite}</td>
                  <td><BadgeStatut statut={p.statut}/></td>
                  {peutPayer && <td>
                    <button className="btn btn-primary btn-sm" onClick={()=>{
                      const et = etudiants.find(e=>e.id_etudiant===p.id_etudiant);
                      setSel(et); setPActif(p);
                    }}>
                      <Banknote size={12}/> Payer
                    </button>
                  </td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paiementActif && (
        <ModalVersement
          paiement={paiementActif}
          etudiant={selEtudiant || etudiants.find(e=>e.id_etudiant===paiementActif.id_etudiant)}
          onSuccess={apresVersement}
          onFermer={()=>setPActif(null)}
        />
      )}
    </div>
  );
}
