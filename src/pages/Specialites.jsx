import { useState, useEffect } from "react";
import { specialiteService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen, Plus, Search, Pencil, X, Layers,
  DollarSign, Calendar, GraduationCap, ChevronRight, Eye
} from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n);

// ── Modal fiche détail spécialité ─────────────────────────────
function FicheSpecialite({ spec, onModifier, onFermer, peutModifier }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-fiche">
        <div className="fiche-header">
          <div className="fiche-avatar" style={{background:"linear-gradient(135deg,var(--purple),var(--primary))"}}>
            <BookOpen size={22} color="white"/>
          </div>
          <div className="fiche-identity">
            <h2>{spec.nom_specialite}</h2>
            <p>{spec.code} · {spec.departement} · Niveau {spec.niveau}</p>
          </div>
          <div className="fiche-actions">
            {peutModifier && (
              <button className="btn btn-secondary btn-sm" onClick={onModifier}>
                <Pencil size={13}/> Modifier
              </button>
            )}
            <button className="btn-close" onClick={onFermer}><X size={16}/></button>
          </div>
        </div>

        <div className="modal-body">
          <div className="fiche-infos">
            <div className="fiche-section">
              <div className="fiche-section-title"><Layers size={14}/> Informations générales</div>
              <div className="fiche-grid">
                <div className="fiche-row"><span>Code</span><code>{spec.code}</code></div>
                <div className="fiche-row"><span>Département</span><strong>{spec.departement}</strong></div>
                <div className="fiche-row"><span>Niveau</span><strong>Niveau {spec.niveau}</strong></div>
                <div className="fiche-row"><span>Durée</span><strong>{spec.duree_ans} an(s)</strong></div>
                <div className="fiche-row"><span>Année académique</span><strong>{spec.annee_academique}</strong></div>
                <div className="fiche-row"><span>Total frais</span>
                  <strong style={{color:"var(--primary)"}}>{fmt(spec.total)} FCFA</strong>
                </div>
              </div>
            </div>
            <div className="fiche-section">
              <div className="fiche-section-title"><DollarSign size={14}/> Tranches de paiement</div>
              <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                {[1,2,3].map(t => (
                  <div key={t} className="spec-tranche-row">
                    <div className={`spec-tranche-num t${t}`}>T{t}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,color:"var(--text)"}}>
                        {fmt(spec[`tranche_${t}`])} FCFA
                      </div>
                      <div style={{fontSize:"0.75rem",color:"var(--text3)",display:"flex",alignItems:"center",gap:4}}>
                        <Calendar size={10}/> Limite : {spec[`date_limite_t${t}`]}
                      </div>
                    </div>
                    <div style={{fontSize:"0.78rem",background:"var(--primary-soft)",color:"var(--primary)",padding:"2px 10px",borderRadius:99,fontWeight:600}}>
                      {Math.round(spec[`tranche_${t}`]/spec.total*100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Formulaire créer/modifier ─────────────────────────────────
function FormulaireSpecialite({ spec, onSuccess, onFermer }) {
  const est = !!spec;
  const [form, setForm] = useState(spec || {
    id_specialite:"", code:"", nom_specialite:"", departement:"",
    niveau:1, duree_ans:1, annee_academique:"2024-2025",
    tranche_1:0, date_limite_t1:"31/10/2024",
    tranche_2:0, date_limite_t2:"31/01/2025",
    tranche_3:0, date_limite_t3:"30/04/2025",
  });
  const [erreur, setErreur] = useState("");
  const [load, setLoad]     = useState(false);
  const maj = (c,v) => setForm(f=>({...f,[c]:v}));

  const submit = async (e) => {
    e.preventDefault(); setErreur(""); setLoad(true);
    try {
      await specialiteService.creerOuModifier({
        ...form, niveau:Number(form.niveau), duree_ans:Number(form.duree_ans),
        tranche_1:Number(form.tranche_1), tranche_2:Number(form.tranche_2), tranche_3:Number(form.tranche_3),
      });
      onSuccess();
    } catch (err) { setErreur(err.response?.data?.detail || "Erreur."); }
    finally { setLoad(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <BookOpen size={18} style={{color:"var(--purple)"}}/>
            <h2>{est?"Modifier la spécialité":"Nouvelle spécialité"}</h2>
          </div>
          <button className="btn-close" onClick={onFermer}><X size={16}/></button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-section-label">Informations générales</div>
          <div className="form-grid">
            {!est && <div className="form-group"><label>ID *</label><input value={form.id_specialite} onChange={e=>maj("id_specialite",e.target.value)} required/></div>}
            <div className="form-group"><label>Code *</label><input value={form.code} onChange={e=>maj("code",e.target.value)} required/></div>
            <div className="form-group full"><label>Nom complet *</label><input value={form.nom_specialite} onChange={e=>maj("nom_specialite",e.target.value)} required/></div>
            <div className="form-group"><label>Département *</label><input value={form.departement} onChange={e=>maj("departement",e.target.value)} required/></div>
            <div className="form-group"><label>Niveau *</label>
              <select value={form.niveau} onChange={e=>maj("niveau",e.target.value)}>
                {[1,2,3,4,5].map(n=><option key={n} value={n}>Niveau {n}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Durée (ans)</label><input type="number" value={form.duree_ans} onChange={e=>maj("duree_ans",e.target.value)}/></div>
            <div className="form-group"><label>Année académique *</label><input value={form.annee_academique} onChange={e=>maj("annee_academique",e.target.value)}/></div>
          </div>
          <div className="form-section-label">Tranches de paiement</div>
          <div className="form-grid">
            {[1,2,3].map(t=>(
              <>
                <div key={`t${t}m`} className="form-group">
                  <label>Tranche {t} (FCFA) *</label>
                  <input type="number" value={form[`tranche_${t}`]} onChange={e=>maj(`tranche_${t}`,e.target.value)}/>
                </div>
                <div key={`t${t}d`} className="form-group">
                  <label>Date limite T{t} *</label>
                  <input value={form[`date_limite_t${t}`]} onChange={e=>maj(`date_limite_t${t}`,e.target.value)} placeholder="JJ/MM/AAAA"/>
                </div>
              </>
            ))}
          </div>
          {erreur && <div className="alert alert-erreur">{erreur}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onFermer}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={load}>
              <BookOpen size={14}/> {load?"...":est?"Modifier":"Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function Specialites() {
  const [specialites, setSpec] = useState([]);
  const [load, setLoad]        = useState(true);
  const [recherche, setRech]   = useState("");
  const [fiche, setFiche]      = useState(null);
  const [modal, setModal]      = useState(null);
  const [courant, setCourant]  = useState(null);
  const { aLeRole }            = useAuth();
  const peutModifier = aLeRole("ADMIN","SECRETAIRE");

  const charger = () => specialiteService.lister().then(setSpec).finally(()=>setLoad(false));
  useEffect(()=>{ charger(); },[]);

  const filtres = specialites.filter(s =>
    `${s.nom_specialite} ${s.code} ${s.departement}`.toLowerCase().includes(recherche.toLowerCase())
  );

  const COLS = ["blue","purple","green","orange","red"];

  return (
    <div className="page">
      <div className="page-header">
        <h1><BookOpen size={22} style={{marginRight:8,verticalAlign:"middle"}}/>
          Spécialités <span className="count-badge">{specialites.length}</span>
        </h1>
        {peutModifier && (
          <button className="btn btn-primary" onClick={()=>{setCourant(null);setModal("form");}}>
            <Plus size={15}/> Nouvelle spécialité
          </button>
        )}
      </div>

      <div className="toolbar" style={{marginBottom:"1.5rem"}}>
        <div className="search-bar" style={{maxWidth:420}}>
          <input placeholder="Rechercher par nom, code, département..."
            value={recherche} onChange={e=>setRech(e.target.value)}/>
        </div>
      </div>

      {load ? <div className="loading-text">Chargement...</div> : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Spécialité</th><th>Niveau</th><th>Département</th>
                <th>Tranche 1</th><th>Tranche 2</th><th>Tranche 3</th>
                <th>Total</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtres.length === 0 ? (
                <tr><td colSpan={8} className="table-empty">
                  <BookOpen size={28} strokeWidth={1.5} style={{marginBottom:6}}/><br/>Aucune spécialité
                </td></tr>
              ) : filtres.map((s,i) => (
                <tr key={s.id_specialite} className="clickable-row" onClick={()=>setFiche(s)}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div className={`table-avatar color-${COLS[i%COLS.length]}`}
                        style={{width:34,height:34,borderRadius:9,background:`var(--${COLS[i%COLS.length]})`,fontSize:"0.75rem",fontWeight:700}}>
                        {s.code.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="table-name">{s.nom_specialite}</div>
                        <div className="table-sub">{s.code}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge--bleu">N{s.niveau}</span></td>
                  <td>{s.departement}</td>
                  <td>{fmt(s.tranche_1)} FCFA</td>
                  <td>{fmt(s.tranche_2)} FCFA</td>
                  <td>{fmt(s.tranche_3)} FCFA</td>
                  <td><strong style={{color:"var(--primary)"}}>{fmt(s.total)} FCFA</strong></td>
                  <td onClick={ev=>ev.stopPropagation()}>
                    <div className="actions">
                      <button className="icon-btn" title="Voir" onClick={()=>setFiche(s)}><Eye size={15}/></button>
                      {peutModifier && (
                        <button className="icon-btn" title="Modifier"
                          onClick={()=>{setCourant(s);setModal("form");}}>
                          <Pencil size={15}/>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fiche && (
        <FicheSpecialite spec={fiche} peutModifier={peutModifier}
          onModifier={()=>{setCourant(fiche);setFiche(null);setModal("form");}}
          onFermer={()=>setFiche(null)}/>
      )}
      {modal==="form" && (
        <FormulaireSpecialite spec={courant}
          onSuccess={()=>{setModal(null);charger();}}
          onFermer={()=>setModal(null)}/>
      )}
    </div>
  );
}
