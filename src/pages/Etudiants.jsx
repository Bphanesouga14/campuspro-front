

import { exporterExcel, COLONNES_ETUDIANTS } from "../utils/exportExcel";


import { useState, useEffect, useRef } from "react";
import { etudiantService, specialiteService, paiementService, profilService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import {
  Plus, Search, Pencil, Trash2, Eye, X, ChevronRight,
  User, Phone, Mail, BookOpen, CreditCard, QrCode,
  GraduationCap, Users, Download, Camera, Grid, List  
} from "lucide-react";
import api from "../api/client";

// ── Formulaire créer/modifier ─────────────────────────────────
function FormulaireEtudiant({ etudiant, specialites, onSuccess, onFermer }) {
  const est = !!etudiant;
  const [form, setForm] = useState(etudiant || {
    id_etudiant:"", matricule:"", nom:"", prenom:"", sexe:"M",
    id_specialite:"", code_specialite:"", niveau:1,
    annee_academique:"2024-2025", email_etudiant:"",
    telephone_etudiant:"", nom_parent:"", prenom_parent:"",
    lien_parent:"Père", telephone_parent:"", email_parent:"",
  });
  const [erreur, setErreur] = useState("");
  const [load, setLoad]     = useState(false);
  const maj = (c, v) => setForm(f => ({ ...f, [c]: v }));

  const choisirSpec = (id) => {
    const sp = specialites.find(s => s.id_specialite === id);
    setForm(f => ({ ...f, id_specialite: id, code_specialite: sp?.code || "" }));
  };

  const submit = async (e) => {
    e.preventDefault(); setErreur(""); setLoad(true);
    try {
      est ? await etudiantService.modifier(etudiant.id_etudiant, form)
           : await etudiantService.creer({ ...form, niveau: Number(form.niveau) });
      onSuccess();
    } catch (err) { setErreur(err.response?.data?.detail || "Erreur."); }
    finally { setLoad(false); }
  };

  const FIELD = (label, name, type="text", placeholder="") => (
    <div className="form-group">
      <label>{label}</label>
      <input type={type} value={form[name]||""} placeholder={placeholder}
        onChange={e => maj(name, e.target.value)} />
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{est ? "Modifier l'étudiant" : "Nouvel étudiant"}</h2>
          <button className="btn-close" onClick={onFermer}><X size={16}/></button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <div className="form-section-label">Identité</div>
          <div className="form-grid">
            {!est && <>{FIELD("ID étudiant *","id_etudiant","text","ETU-2024-001")}{FIELD("Matricule *","matricule","text","MAT-2024-INFO-001")}</>}
            {FIELD("Nom *","nom")} {FIELD("Prénom *","prenom")}
            <div className="form-group"><label>Sexe *</label>
              <select value={form.sexe} onChange={e => maj("sexe",e.target.value)}>
                <option value="M">Masculin</option><option value="F">Féminin</option>
              </select>
            </div>
            {FIELD("Email","email_etudiant","email")} {FIELD("Téléphone","telephone_etudiant")}
          </div>
          <div className="form-section-label">Scolarité</div>
          <div className="form-grid">
            <div className="form-group"><label>Spécialité *</label>
              <select value={form.id_specialite} onChange={e => choisirSpec(e.target.value)} required>
                <option value="">-- Choisir --</option>
                {specialites.map(s => <option key={s.id_specialite} value={s.id_specialite}>{s.nom_specialite} (N{s.niveau})</option>)}
              </select>
            </div>
            <div className="form-group"><label>Niveau *</label>
              <select value={form.niveau} onChange={e => maj("niveau",e.target.value)}>
                {[1,2,3,4,5].map(n=><option key={n} value={n}>Niveau {n}</option>)}
              </select>
            </div>
            {FIELD("Année académique *","annee_academique","text","2024-2025")}
          </div>
          <div className="form-section-label">Parent / Tuteur</div>
          <div className="form-grid">
            {FIELD("Nom parent *","nom_parent")} {FIELD("Prénom parent *","prenom_parent")}
            <div className="form-group"><label>Lien *</label>
              <select value={form.lien_parent} onChange={e=>maj("lien_parent",e.target.value)}>
                <option>Père</option><option>Mère</option><option>Tuteur</option>
              </select>
            </div>
            {FIELD("Téléphone parent *","telephone_parent")}
            {FIELD("Email parent","email_parent","email")}
          </div>
          {erreur && <div className="alert alert-erreur">{erreur}</div>}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onFermer}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={load}>
              {load ? "Enregistrement..." : est ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modification QR Code ─────────────────────────────────────
function BoutonStatutQR({ idQrcode, statutActuel, onSuccess }) {
  const [charge, setCharge] = useState(false);
  const estActif = statutActuel === "ACTIF";

  const basculer = async () => {
    const nouveau = estActif ? "SUSPENDU" : "ACTIF";
    setCharge(true);
    try {
      const res = await api.post(
        `/qrcodes/changer-statut/${idQrcode}`,
        { statut: nouveau, raison: "Modification manuelle" }
      );
      onSuccess(nouveau);
      console.log("OK :", res.data.message);
    } catch (e) {
      alert("Erreur : " + (e.response?.data?.detail || "Serveur inaccessible"));
    } finally {
      setCharge(false);
    }
  };

  return (
    <button
      className={`btn btn-sm ${estActif ? "btn-danger" : "btn-success"}`}
      onClick={basculer}
      disabled={charge}>
      {charge ? "..." : estActif ? "Suspendre" : "Réactiver"}
    </button>
  );
}


// ── Fiche détail étudiant ─────────────────────────────────────
function FicheEtudiant({ etudiant, specialites, onModifier, onSupprimer, onFermer, peutModifier, peutSupprimer, onPhotoMaj }) {
  const [onglet, setOnglet]   = useState("infos");
  const [paiements, setPai]   = useState([]);
  const [qrSrc, setQrSrc]     = useState(null);
  const [qrInfo, setQrInfo]   = useState(null);
  const [photo, setPhoto]     = useState(etudiant.photo || null);
  const [loadPai, setLoadPai] = useState(false);
  const [loadQr, setLoadQr]   = useState(false);
  const photoRef              = useRef(null);
  const [statutQR, setStatutQR] = useState("INACTIF");
  const { aLeRole } = useAuth();


  useEffect(() => {
    if (qrInfo?.statut) {
      const s = qrInfo.statut?.value || qrInfo.statut || "INACTIF";
      setStatutQR(s.toUpperCase());
    }
  }, [qrInfo]);

  const uploaderPhoto = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const res = await profilService.uploaderPhotoEtudiant(etudiant.id_etudiant, f);
      setPhoto(res.photo);
      setQrSrc(null); // Régénérer le QR avec la nouvelle photo
      // Mettre à jour cet étudiant dans la liste parente
      onPhotoMaj(etudiant.id_etudiant, res.photo);
    }  catch (err) { alert(err.response?.data?.detail || "Erreur upload."); }
  };

  useEffect(() => {
    if (onglet === "paiements" && paiements.length === 0) {
      setLoadPai(true);
      etudiantService.paiements(etudiant.id_etudiant)
        .then(d => setPai(d.paiements || []))
        .finally(() => setLoadPai(false));
    }
    if (onglet === "qrcode" && !qrSrc) {
      setLoadQr(true);
      Promise.all([
        api.get(`/etudiants/${etudiant.id_etudiant}/qr-code`)
          .catch(() => ({ data: null })),
        api.get(`/etudiants/${etudiant.id_etudiant}/qr-code/image`, {
          responseType: "blob"
        }).catch(() => ({ data: null })),
      ]).then(([info, img]) => {
        if (info.data) setQrInfo(info.data);
        if (img.data)  setQrSrc(URL.createObjectURL(img.data));
      }).finally(() => setLoadQr(false));
    }

    console.log("qrInfo complet :", qrInfo);
  }, [onglet]);

  const telechargerQR = () => {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href = qrSrc; a.download = `QR_${etudiant.matricule}.png`; a.click();
  };

  const badgeSt = { "PAYÉ":"vert","PARTIEL":"orange","EN_ATTENTE":"gris","EN_RETARD":"rouge" };
  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n);

  return (
    <div className="modal-overlay">
      <div className="modal modal-fiche">
        <div className="fiche-header">
          {/* Avatar avec photo réelle ou initiales + bouton upload */}
          <div style={{position:"relative",flexShrink:0}}>
            {photo ? (
              <img src={photo} alt={etudiant.nom}
                style={{width:56,height:56,borderRadius:14,objectFit:"cover",
                  border:"2px solid var(--primary)",display:"block"}}/>
            ) : (
              <div className="fiche-avatar">{etudiant.prenom?.[0]}{etudiant.nom?.[0]}</div>
            )}
            {peutModifier && (
              <div style={{position:"absolute",bottom:-4,right:-4,width:22,height:22,
                borderRadius:"50%",background:"var(--primary)",cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                border:"2px solid var(--card)"}}
                onClick={()=>photoRef.current?.click()}>
                <Camera size={11} color="white"/>
              </div>
            )}
            <input ref={photoRef} type="file" accept="image/*"
              style={{display:"none"}} onChange={uploaderPhoto}/>
          </div>

          <div className="fiche-identity">
            <h2>{etudiant.nom} {etudiant.prenom}</h2>
            <p>{etudiant.matricule} · {etudiant.code_specialite} · Niveau {etudiant.niveau}</p>
          </div>
          <div className="fiche-actions">
            
              {/* Bouton carte étudiant PDF */}
              <button className="btn btn-secondary btn-sm"
                title="Télécharger la carte étudiant"
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  const res   = await fetch(
                    `http://127.0.0.1:8000/api/v1/etudiants/${etudiant.id_etudiant}/carte`,
                    { headers:{ "Authorization":`Bearer ${token}` } }
                  );
                  if (!res.ok) { alert("Erreur génération carte."); return; }
                  const blob = await res.blob();
                  const url  = URL.createObjectURL(blob);
                  const a    = document.createElement("a");
                  a.href     = url;
                  a.download = `Carte_${etudiant.matricule}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                <CreditCard size={13}/> Carte PDF
              </button>
  
            {peutModifier && (
              <button className="btn btn-secondary btn-sm" onClick={onModifier}>
                <Pencil size={13}/> Modifier
              </button>
            )}
            {peutSupprimer && (
              <button className="btn btn-danger btn-sm" onClick={onSupprimer}>
                <Trash2 size={13}/> Supprimer
              </button>
            )}
            <button className="btn-close" onClick={onFermer}><X size={16}/></button>
          </div>
        </div>

        {/* Onglets */}
        <div className="fiche-tabs">
          {[
            { id:"infos",     label:"Informations", Icon:User },
            { id:"paiements", label:"Paiements",    Icon:CreditCard },
            { id:"qrcode",    label:"QR Code",      Icon:QrCode },
          ].map(t => (
            <button key={t.id} className={`fiche-tab ${onglet===t.id?"actif":""}`}
              onClick={() => setOnglet(t.id)}>
              <t.Icon size={14}/> {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* ── INFOS ── */}
          {onglet === "infos" && (
            <div className="fiche-infos">
              <div className="fiche-section">
                <div className="fiche-section-title"><User size={14}/> Identité</div>
                <div className="fiche-grid">
                  <div className="fiche-row"><span>Nom complet</span><strong>{etudiant.nom} {etudiant.prenom}</strong></div>
                  <div className="fiche-row"><span>Sexe</span><strong>{etudiant.sexe === "M" ? "Masculin" : "Féminin"}</strong></div>
                  <div className="fiche-row"><span>Matricule</span><code>{etudiant.matricule}</code></div>
                  <div className="fiche-row"><span>Année</span><strong>{etudiant.annee_academique}</strong></div>
                  {etudiant.email_etudiant && <div className="fiche-row"><span><Mail size={12}/> Email</span><strong>{etudiant.email_etudiant}</strong></div>}
                  {etudiant.telephone_etudiant && <div className="fiche-row"><span><Phone size={12}/> Téléphone</span><strong>{etudiant.telephone_etudiant}</strong></div>}
                </div>
              </div>
              <div className="fiche-section">
                <div className="fiche-section-title"><BookOpen size={14}/> Scolarité</div>
                <div className="fiche-grid">
                  <div className="fiche-row"><span>Spécialité</span><strong>{etudiant.code_specialite}</strong></div>
                  <div className="fiche-row"><span>Niveau</span><strong>Niveau {etudiant.niveau}</strong></div>
                </div>
              </div>
              <div className="fiche-section">
                <div className="fiche-section-title"><Users size={14}/> Parent / Tuteur</div>
                <div className="fiche-grid">
                  <div className="fiche-row"><span>Nom</span><strong>{etudiant.nom_parent} {etudiant.prenom_parent}</strong></div>
                  <div className="fiche-row"><span>Lien</span><strong>{etudiant.lien_parent}</strong></div>
                  <div className="fiche-row"><span><Phone size={12}/> Téléphone</span><strong>{etudiant.telephone_parent}</strong></div>
                  {etudiant.email_parent && <div className="fiche-row"><span><Mail size={12}/> Email</span><strong>{etudiant.email_parent}</strong></div>}
                </div>
              </div>
            </div>
          )}

          {/* ── PAIEMENTS ── */}
          {onglet === "paiements" && (
            loadPai ? <div className="loading-text">Chargement...</div> :
            paiements.length === 0 ? (
              <div className="empty-state"><CreditCard size={36} style={{marginBottom:8}}/><br/>Aucun paiement enregistré</div>
            ) : (
              <div className="fiche-paiements">
                {paiements.map(p => (
                  <div key={p.id_paiement} className="fpai-card">
                    <div className="fpai-left">
                      <div className="fpai-tranche">Tranche {p.numero_tranche}</div>
                      <div className="fpai-montants">{fmt(p.montant_paye)} / {fmt(p.montant_attendu)} FCFA</div>
                      <div className="fpai-date">Limite : {p.date_limite}</div>
                    </div>
                    <div className="fpai-right">
                      <span className={`badge badge--${badgeSt[p.statut]||"gris"}`}>{p.statut}</span>
                      {p.montant_paye < p.montant_attendu && (
                        <div className="fpai-reste">Reste : {fmt(p.montant_attendu - p.montant_paye)} FCFA</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {onglet === "qrcode" && (
            loadQr
              ? <div className="loading-text">Chargement du QR code...</div>
              : !qrSrc
                ? (
                  <div className="empty-state">
                    <QrCode size={36} style={{marginBottom:8}}/>
                    <br/>Aucun QR code disponible
                    <br/><small>Généré automatiquement après paiement d'une tranche</small>
                  </div>
                ) : (
                  <div style={{textAlign:"center"}}>

                    {/* Badge statut */}
                    <div style={{marginBottom:"0.75rem"}}>
                      <span className={`badge ${
                        statutQR === "ACTIF"    ? "badge--vert"   :
                        statutQR === "SUSPENDU" ? "badge--orange" :
                        "badge--rouge"
                      }`}>
                        {statutQR === "ACTIF"    ? "● ACTIF"    :
                        statutQR === "SUSPENDU" ? "● SUSPENDU" :
                        "● EXPIRÉ"}
                      </span>
                    </div>

                    {/* Image QR */}
                    <div className="qr-img-wrap" style={{margin:"0 auto 1.25rem"}}>
                      <img
                        src={qrSrc}
                        alt="QR Code"
                        style={{
                          width:200, height:200,
                          imageRendering:"pixelated",
                          display:"block", margin:"0 auto"
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div style={{
                      display:"flex", gap:"0.75rem",
                      justifyContent:"center", flexWrap:"wrap",
                      marginTop:"0.5rem"
                    }}>

                      {/* Bouton statut — Admin et Secrétaire */}
                      {(aLeRole("ADMIN") || aLeRole("SECRETAIRE")) && qrInfo?.id_qrcode && (
                        <BoutonStatutQR
                          idQrcode     = {qrInfo.id_qrcode}
                          statutActuel = {statutQR}
                          onSuccess    = {(nouveau) => setStatutQR(nouveau)}
                        />
                      )}

                      {/* Bouton télécharger */}
                      <button className="btn btn-primary" onClick={telechargerQR}>
                        <Download size={14}/> Télécharger PNG
                      </button>

                    </div>
                  </div>
                )
          )}
        </div>
      </div>
    </div>
  );
}


// ── Carte Étudiant (vue mosaïque) ─────────────────────────────
function EtudiantCard({ e, peutModifier, peutSupprimer, onVoir, onModifier, onSupprimer }) {
  return (
    <div className="etudiant-card" onClick={() => onVoir(e)}>
      <div className="ec-top">
        {e.photo ? (
          <img className="ec-photo" src={e.photo} alt={`${e.nom} ${e.prenom}`} />
        ) : (
          <div className="ec-avatar">{e.prenom?.[0]}{e.nom?.[0]}</div>
        )}
        <div className="ec-info">
          <div className="ec-name">{e.nom} {e.prenom}</div>
          <div className="ec-sub">{e.code_specialite} · N{e.niveau}</div>
        </div>
      </div>
      <div className="ec-middle">
        <div className="ec-matricule"><code>{e.matricule}</code></div>
        <div className="ec-contact">{e.telephone_etudiant || e.telephone_parent || "—"}</div>
      </div>
      <div className="ec-actions" onClick={ev => ev.stopPropagation()}>
        <button className="icon-btn" title="Voir" onClick={() => onVoir(e)}>
          <Eye size={14}/>
        </button>
        {peutModifier && (
          <button className="icon-btn" title="Modifier" onClick={() => onModifier(e)}>
            <Pencil size={14}/>
          </button>
        )}
        {peutSupprimer && (
          <button className="icon-btn danger" title="Supprimer" onClick={() => onSupprimer(e)}>
            <Trash2 size={14}/>
          </button>
        )}
      </div>
    </div>
  );
}



// ── Page principale ───────────────────────────────────────────
export default function Etudiants() {
  const [etudiants, setEtudiants]   = useState([]);
  const [specialites, setSpec]      = useState([]);
  const [load, setLoad]             = useState(true);
  const [recherche, setRecherche]   = useState("");
  const [modal, setModal]           = useState(null); // null | "creer" | "modifier"
  const [fiche, setFiche]           = useState(null);
  const [courant, setCourant]       = useState(null);

  const [vueMode, setVueMode] = useState("tableau"); // "tableau" ou "mosaique"

  const { aLeRole }                 = useAuth();
  const peutModifier = aLeRole("ADMIN","SECRETAIRE");
  const peutSupprimer = aLeRole("ADMIN");

  const charger = async () => {
    setLoad(true);
    try {
      const [e,s] = await Promise.all([etudiantService.lister(), specialiteService.lister()]);
      setEtudiants(e); setSpec(s);
    } finally { setLoad(false); }
  };
  useEffect(() => { charger(); }, []);

  const supprimer = async (e) => {
    setFiche(null);
    if (!window.confirm(`Supprimer ${e.nom} ${e.prenom} ?`)) return;
    try { await etudiantService.supprimer(e.id_etudiant); charger(); }
    catch (err) { alert(err.response?.data?.detail || "Suppression impossible."); }
  };

  const filtres = etudiants.filter(e =>
    `${e.nom} ${e.prenom} ${e.matricule} ${e.code_specialite}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Étudiants <span className="count-badge">{etudiants.length}</span></h1>
        </div>

        
          <div style={{display:"flex",gap:8}}>
            <button className="btn btn-secondary"
              onClick={() => exporterExcel(filtres, COLONNES_ETUDIANTS, "Etudiants_CampusPro", "Étudiants")}>
              <Download size={15}/> Exporter Excel
            </button>
            {peutModifier && (
              <button className="btn btn-primary"
                onClick={() => { setCourant(null); setModal("creer"); }}>
                <Plus size={15}/> Nouvel étudiant
              </button>
            )}
          </div>


      </div>

      <div className="toolbar">
        <div className="search-bar" style={{maxWidth:460}}>
          <input placeholder="Rechercher par nom, matricule, spécialité..."
            value={recherche} onChange={e => setRecherche(e.target.value)} />
        </div>
        
        {/* Boutons de basculement vue */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${vueMode === "tableau" ? "active" : ""}`}
            onClick={() => setVueMode("tableau")}
            title="Vue tableau">
            <List size={16} />
          </button>
          <button 
            className={`toggle-btn ${vueMode === "mosaique" ? "active" : ""}`}
            onClick={() => setVueMode("mosaique")}
            title="Vue mosaïque">
            <Grid size={16} />
          </button>
        </div>
      </div>


      {load ? (
      <div className="loading-text">Chargement...</div>
    ) : filtres.length === 0 ? (
      <div className="empty-state">Aucun étudiant trouvé</div>
    ) : vueMode === "mosaique" ? (
      // ── VUE MOSAÏQUE ──
      <div className="grid-wrap">
        {filtres.map(e => (
          <EtudiantCard
            key={e.id_etudiant}
            e={e}
            peutModifier={peutModifier}
            peutSupprimer={peutSupprimer}
            onVoir={(ev) => setFiche(ev)}
            onModifier={(ev) => { setCourant(ev); setModal("modifier"); }}
            onSupprimer={(ev) => supprimer(ev)}
          />
        ))}
      </div>
    ) : (
      // ── VUE TABLEAU ──
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Étudiant</th><th>Matricule</th><th>Spécialité</th>
              <th>Niveau</th><th>Contact</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtres.map(e => (
              <tr key={e.id_etudiant} className="clickable-row"
                onClick={() => setFiche(e)} style={{cursor:"pointer"}}>
                <td>
                  <div className="table-user">
                    {e.photo ? (
                      <img
                        src={e.photo}
                        alt={e.nom}
                        style={{
                          width: 34, height: 34, borderRadius: "50%",
                          objectFit: "cover", flexShrink: 0,
                          border: "1.5px solid var(--border)"
                        }}
                      />
                    ) : (
                      <div className="table-avatar">
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </div>
                    )}
                    <div>
                      <div className="table-name">{e.nom} {e.prenom}</div>
                      <div className="table-sub">{e.sexe === "M" ? "Masculin" : "Féminin"}</div>
                    </div>
                  </div>
                </td>
                <td><code>{e.matricule}</code></td>
                <td>{e.code_specialite}</td>
                <td>N{e.niveau}</td>
                <td>{e.telephone_etudiant || e.telephone_parent || "—"}</td>
                <td onClick={ev => ev.stopPropagation()}>
                  <div className="actions">
                    <button className="icon-btn" title="Voir la fiche" onClick={() => setFiche(e)}>
                      <Eye size={15}/>
                    </button>
                    {peutModifier && (
                      <button className="icon-btn" title="Modifier"
                        onClick={() => { setCourant(e); setModal("modifier"); }}>
                        <Pencil size={15}/>
                      </button>
                    )}
                    {peutSupprimer && (
                      <button className="icon-btn danger" title="Supprimer" onClick={() => supprimer(e)}>
                        <Trash2 size={15}/>
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


      {/* Fiche détail */}
      {fiche && (
        <FicheEtudiant
          etudiant={fiche}
          specialites={specialites}
          peutModifier={peutModifier}
          peutSupprimer={peutSupprimer}
          onModifier={() => { setCourant(fiche); setFiche(null); setModal("modifier"); }}
          onSupprimer={() => supprimer(fiche)}
          onFermer={() => setFiche(null)}
          onPhotoMaj={(id, photo) => {
            // Met à jour la photo dans la liste locale sans recharger tout
            setEtudiants(prev =>
              prev.map(e => e.id_etudiant === id ? { ...e, photo } : e)
            );
            // Met aussi à jour la fiche ouverte
            setFiche(prev => prev ? { ...prev, photo } : prev);
          }}
        />
      )}

      {/* Formulaire créer/modifier */}
      {(modal === "creer" || modal === "modifier") && (
        <FormulaireEtudiant
          etudiant={modal === "modifier" ? courant : null}
          specialites={specialites}
          onSuccess={() => { setModal(null); charger(); }}
          onFermer={() => setModal(null)}
        />
      )}
    </div>
  );
}
