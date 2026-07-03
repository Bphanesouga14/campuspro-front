import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Bell, Banknote, Clock, GraduationCap, RefreshCw, Filter, Send } from "lucide-react";

function notifMeta(type) {
  if (!type) return { couleur:"purple" };
  const t = type.toUpperCase();
  if (t.includes("CONFIRMATION") || t.includes("PARTIEL")) return { couleur:"green",  Icon:Banknote };
  if (t.includes("RAPPEL"))                                 return { couleur:"orange", Icon:Clock };
  return { couleur:"blue", Icon:Bell };
}

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [load, setLoad]     = useState(true);
  const [filtre, setFiltre] = useState("tous");
  const { utilisateur }     = useAuth();
  const role = utilisateur?.role;



  const { aLeRole } = useAuth();

  const lancerRelances = async () => {
    if (!window.confirm("Envoyer les relances à tous les parents en retard ?")) return;
    try {
      const res = await api.post("/notifications/relances/lancer");
      alert(`✅ ${res.data.message}`);
      charger(); // Rafraîchir les notifications
    } catch (err) {
      alert("Erreur : " + (err.response?.data?.detail || err.message));
    }
  };




  const charger = () => {
    setLoad(true);
    api.get("/notifications/recentes")
      .then(r => setNotifs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setNotifs([]))
      .finally(() => setLoad(false));
  };
  useEffect(charger, []);

  const filtrees = filtre === "tous" ? notifs
    : notifs.filter(n => n.statut === filtre);

  const titreRole = {
    ADMIN:      "Toutes les notifications",
    CAISSIER:   "Mes notifications de paiement",
    SECRETAIRE: "Mes notifications de rappel",
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><Bell size={20} style={{marginRight:8,verticalAlign:"middle"}}/>
            Notifications <span className="count-badge">{notifs.length}</span>
          </h1>
          <p style={{fontSize:"0.83rem",color:"var(--text2)",marginTop:3}}>
            {titreRole[role] || "Notifications"}
          </p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <select value={filtre} onChange={e=>setFiltre(e.target.value)}
            style={{padding:"0.5rem 0.85rem",borderRadius:8,border:"1.5px solid var(--border)",
              background:"var(--card)",color:"var(--text)",fontSize:"0.85rem"}}>
            <option value="tous">Tous les statuts</option>
            <option value="ENVOYÉ">Envoyées</option>
            <option value="EN ATTENTE">En attente</option>
          </select>
          <button className="btn btn-secondary" onClick={charger}>
            <RefreshCw size={14}/> Actualiser
          </button>  

          {aLeRole("ADMIN") && (
            <button className="btn btn-primary" onClick={lancerRelances}>
              <Send size={14}/> Lancer les relances
            </button>
          )}
        </div>
      </div>

      {load ? <div className="loading-text">Chargement...</div> :
       filtrees.length === 0 ? (
        <div className="empty-state" style={{marginTop:"3rem"}}>
          <Bell size={48} strokeWidth={1.2}/>
          <p style={{marginTop:12,fontWeight:600}}>Aucune notification</p>
          <p style={{fontSize:"0.83rem",marginTop:4}}>
            Les notifications apparaissent après des paiements ou des rappels
          </p>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
          {filtrees.map((n,i) => {
            const { couleur, Icon = Bell } = notifMeta(n.type);
            return (
              <div key={n.id_notification||i} className="notif-full-card">
                <div className={`notif-icon notif-icon--${couleur}`} style={{width:40,height:40,borderRadius:11}}>
                  <Icon size={16}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{fontWeight:600,fontSize:"0.88rem",color:"var(--text)"}}>{n.type}</div>
                    <span className={`badge badge--${n.statut==="ENVOYÉ"?"vert":"orange"}`}
                      style={{flexShrink:0}}>{n.statut}</span>
                  </div>
                  <div style={{fontSize:"0.84rem",color:"var(--text2)",margin:"4px 0 6px",lineHeight:1.5}}>
                    {n.message}
                  </div>
                  <div style={{display:"flex",gap:12,fontSize:"0.74rem",color:"var(--text3)"}}>
                    {n.nom_etudiant && (
                      <span style={{display:"flex",alignItems:"center",gap:3}}>
                        <GraduationCap size={11}/> {n.nom_etudiant}
                      </span>
                    )}
                    {n.created_at && (
                      <span style={{display:"flex",alignItems:"center",gap:3}}>
                        <Clock size={11}/> {n.created_at}
                      </span>
                    )}
                    {n.canal && <span>Via : {n.canal}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
