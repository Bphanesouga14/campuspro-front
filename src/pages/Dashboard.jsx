// ============================================================
//  src/pages/Dashboard.jsx  —  Tableau de bord
// ============================================================

import { useState, useEffect } from "react";
import { dashboardService } from "../api/services";
import { useAuth } from "../context/AuthContext";

// Carte de statistique réutilisable
function StatCard({ titre, valeur, icone, couleur }) {
  return (
    <div className={`stat-card stat-card--${couleur}`}>
      <div className="stat-icone">{icone}</div>
      <div className="stat-info">
        <div className="stat-valeur">{valeur}</div>
        <div className="stat-titre">{titre}</div>
      </div>
    </div>
  );
}

// Formater un nombre en FCFA
function fcfa(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [chargement, setCharge] = useState(true);
  const [erreur, setErreur]     = useState("");
  const { utilisateur }         = useAuth();

  useEffect(() => {
    dashboardService.obtenir()
      .then(setStats)
      .catch(() => setErreur("Impossible de charger les statistiques."))
      .finally(() => setCharge(false));
  }, []);

  if (chargement) return <div className="chargement">Chargement...</div>;
  if (erreur)     return <div className="alert alert-erreur">{erreur}</div>;
  if (!stats)     return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Bonjour, <strong>{utilisateur?.nom}</strong> — {utilisateur?.role}</p>
      </div>

      {/* Statistiques principales */}
      <div className="stats-grid">
        <StatCard titre="Étudiants"       valeur={stats.nb_etudiants}      icone="👨‍🎓" couleur="bleu"  />
        <StatCard titre="Spécialités"     valeur={stats.nb_specialites}    icone="📚" couleur="violet"/>
        <StatCard titre="À jour"          valeur={stats.nb_etudiants_a_jour}    icone="✅" couleur="vert"  />
        <StatCard titre="En retard"       valeur={stats.nb_etudiants_en_retard} icone="⚠️" couleur="rouge" />
      </div>

      {/* Finances */}
      <div className="section-titre">Situation financière</div>
      <div className="stats-grid">
        <StatCard titre="Total attendu"   valeur={fcfa(stats.total_attendu)} icone="💰" couleur="bleu"  />
        <StatCard titre="Déjà versé"      valeur={fcfa(stats.total_verse)}   icone="💵" couleur="vert"  />
        <StatCard titre="Reste à payer"   valeur={fcfa(stats.total_reste)}   icone="📉" couleur="rouge" />
      </div>

      {/* Barre de progression du taux de recouvrement */}
      <div className="card">
        <div className="card-header">Taux de recouvrement global</div>
        <div className="progress-label">
          <span>{stats.taux_recouvrement}%</span>
          <span>{stats.nb_paiements_en_retard} paiement(s) en retard</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(stats.taux_recouvrement, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
