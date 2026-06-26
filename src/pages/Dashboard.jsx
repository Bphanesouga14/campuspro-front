import { useState, useEffect } from "react";
import { dashboardService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  Users, BookOpen, CheckCircle, AlertTriangle,
  TrendingUp, TrendingDown, DollarSign, Clock,
  Bell, GraduationCap, Banknote, Tag, Calendar
} from "lucide-react";

const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

const CARTES = [
  { key:"nb_etudiants",           label:"Total étudiants",  Icon:GraduationCap, color:"blue"   },
  { key:"nb_specialites",         label:"Spécialités",      Icon:BookOpen,      color:"purple" },
  { key:"nb_etudiants_a_jour",    label:"À jour",           Icon:CheckCircle,   color:"green"  },
  { key:"nb_etudiants_en_retard", label:"En retard",        Icon:AlertTriangle, color:"orange" },
];

function StatCard({ label, Icon, value, color }) {
  return (
    <div className={`stat-card color-${color}`}>
      <div className="stat-card-top">
        <div className={`stat-icon-wrap color-${color}`}><Icon size={22}/></div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-bar"><div className="stat-bar-fill"/></div>
    </div>
  );
}

function FinCard({ titre, valeur, Icon, couleur, pct }) {
  return (
    <div className="finance-card">
      <div className="finance-icon-wrap" style={{color:`var(--${couleur})`,background:`var(--${couleur}-soft)`}}>
        <Icon size={18}/>
      </div>
      <div className="finance-titre">{titre}</div>
      <div className="finance-valeur">{valeur}</div>
      {pct && <div className={`finance-pct ${couleur}`}>{pct}</div>}
    </div>
  );
}

// Icône et couleur selon le type de notification
function notifMeta(type) {
  if (!type) return { Icon: Bell, couleur: "purple", libelle: "Notification" };
  const t = type.toUpperCase();
  if (t.includes("CONFIRMATION") || t.includes("PAIEMENT PARTIEL"))
    return { Icon: Banknote, couleur: "green",  libelle: type };
  if (t.includes("RAPPEL"))
    return { Icon: Clock,    couleur: "orange", libelle: type };
  return   { Icon: Bell,    couleur: "blue",   libelle: type };
}

function NotificationsRecentes({ role }) {
  const [notifs, setNotifs] = useState([]);
  const [load, setLoad]     = useState(true);

  const charger = () => {
    setLoad(true);
    api.get("/notifications/recentes")
      .then(r => setNotifs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setNotifs([]))
      .finally(() => setLoad(false));
  };

  useEffect(() => { charger(); }, []);

  const titreParRole = {
    ADMIN:      "Dernières activités — toutes notifications",
    CAISSIER:   "Mes derniers paiements enregistrés",
    SECRETAIRE: "Mes derniers rappels de paiement",
  };

  return (
    <div className="notifs-card">
      <div className="notifs-header">
        <div className="notifs-title">
          <Bell size={16}/>
          <span>{titreParRole[role] || "Notifications récentes"}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="count-badge">{notifs.length}</span>
          <button className="icon-btn" onClick={charger} title="Actualiser">
            <Tag size={13}/>
          </button>
        </div>
      </div>

      {load ? (
        <div className="loading-text" style={{padding:"2rem"}}>Chargement...</div>
      ) : notifs.length === 0 ? (
        <div className="notifs-empty">
          <Bell size={36} strokeWidth={1.5}/>
          <p>Aucune notification récente</p>
          <span style={{fontSize:"0.78rem",color:"var(--text3)"}}>
            Les notifications apparaissent après un paiement enregistré
          </span>
        </div>
      ) : (
        <div className="notifs-list">
          {notifs.map((n, i) => {
            const { Icon, couleur } = notifMeta(n.type);
            return (
              <div key={n.id_notification || i} className="notif-item">
                <div className={`notif-icon notif-icon--${couleur}`}>
                  <Icon size={14}/>
                </div>
                <div className="notif-body">
                  <div className="notif-message">{n.message}</div>
                  <div className="notif-meta">
                    {n.nom_etudiant && (
                      <span style={{display:"flex",alignItems:"center",gap:3}}>
                        <GraduationCap size={10}/> {n.nom_etudiant}
                      </span>
                    )}
                    {n.created_at && (
                      <span style={{display:"flex",alignItems:"center",gap:3}}>
                        <Calendar size={10}/> {n.created_at}
                      </span>
                    )}
                    {n.canal && <span>{n.canal}</span>}
                    {n.statut && (
                      <span className={`badge badge--${n.statut==="ENVOYÉ"?"vert":"orange"}`}
                        style={{fontSize:"0.68rem",padding:"1px 6px"}}>
                        {n.statut}
                      </span>
                    )}
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

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [load, setLoad]   = useState(true);
  const { utilisateur }   = useAuth();
  const h = new Date().getHours();
  const salut = h<12 ? "Bonjour" : h<18 ? "Bon après-midi" : "Bonsoir";
  const role = utilisateur?.role;

  useEffect(() => { dashboardService.obtenir().then(setStats).finally(()=>setLoad(false)); }, []);

  if (load) return <div className="page-load"><div className="page-spinner"/></div>;
  if (!stats) return null;
  const taux = Math.min(stats.taux_recouvrement, 100);

  return (
    <div className="page">
      <div className="page-top">
        <div>
          <h1 className="page-greeting">{salut}, {utilisateur?.nom}</h1>
          <p className="page-sub">Récapitulatif de votre établissement</p>
        </div>
        <div className="page-date">
          {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
        </div>
      </div>

      <div className="stats-row">
        {CARTES.map(c=><StatCard key={c.key} label={c.label} Icon={c.Icon} value={stats[c.key]} color={c.color}/>)}
      </div>

      <div className="section-title">Situation financière</div>
      <div className="finance-row">
        <FinCard titre="Total attendu"  valeur={fmt(stats.total_attendu)} Icon={DollarSign}   couleur="blue"   pct="100%"/>
        <FinCard titre="Total versé"    valeur={fmt(stats.total_verse)}   Icon={TrendingUp}   couleur="green"  pct={`${taux.toFixed(1)}%`}/>
        <FinCard titre="Reste à payer"  valeur={fmt(stats.total_reste)}   Icon={TrendingDown} couleur="red"    pct={`${(100-taux).toFixed(1)}%`}/>
        <FinCard titre="Retards"        valeur={`${stats.nb_paiements_en_retard} paiement(s)`} Icon={Clock} couleur="orange"/>
      </div>

      <div className="recouvrement-card">
        <div className="recouvrement-header">
          <span className="recouvrement-titre">Taux de recouvrement global</span>
          <span className="recouvrement-pct">{taux.toFixed(1)}%</span>
        </div>
        <div className="recouvrement-track">
          <div className="recouvrement-fill" style={{width:`${taux}%`}}>
            <div className="recouvrement-glow"/>
          </div>
        </div>
        <div className="recouvrement-labels">
          <span>{stats.nb_etudiants_a_jour} à jour</span>
          <span>{stats.nb_etudiants_en_retard} en retard</span>
        </div>
      </div>

      <div style={{marginTop:"1.5rem"}}>
        <NotificationsRecentes role={role}/>
      </div>
    </div>
  );
}
