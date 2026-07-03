import { useState, useEffect } from "react";
import { dashboardService } from "../api/services";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer
} from "recharts";
import { BarChart3, PieChart as PieIcon, TrendingUp } from "lucide-react";

const fmt = (v) => new Intl.NumberFormat("fr-FR").format(v);

// Couleurs des graphiques
const COULEURS_STATUTS = {
  "PAYÉ":        "#22c55e",
  "PARTIEL":     "#f59e0b",
  "EN_ATTENTE":  "#94a3b8",
  "EN ATTENTE":  "#94a3b8",
  "EN_RETARD":   "#ef4444",
  "EN RETARD":   "#ef4444",
};

const COULEURS_BARRES = ["#4f7cf7","#22c55e","#f59e0b","#8b5cf6","#ef4444"];

// Tooltip personnalisé pour les barres
const TooltipBarre = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--border)",
      borderRadius:10, padding:"0.75rem 1rem", boxShadow:"var(--shadow-lg)",
      fontSize:"0.83rem",
    }}>
      <p style={{fontWeight:700,color:"var(--text)",marginBottom:6}}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color,margin:"2px 0"}}>
          {p.name} : {fmt(p.value)} FCFA
        </p>
      ))}
    </div>
  );
};

// Tooltip pour le camembert
const TooltipCamembert = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background:"var(--card)", border:"1px solid var(--border)",
      borderRadius:10, padding:"0.75rem 1rem", boxShadow:"var(--shadow-lg)",
      fontSize:"0.83rem",
    }}>
      <p style={{fontWeight:700,color:d.payload.fill,marginBottom:4}}>{d.name}</p>
      <p style={{color:"var(--text)"}}>{d.value} paiement(s)</p>
      <p style={{color:"var(--text2)"}}>{d.payload.percent}% du total</p>
    </div>
  );
};

export default function GraphiquesDashboard() {
  const [data, setData]     = useState(null);
  const [load, setLoad]     = useState(true);
  const [onglet, setOnglet] = useState("barres");

  useEffect(() => {
    dashboardService.analytique()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoad(false));
  }, []);

  if (load) return (
    <div style={{textAlign:"center",padding:"3rem",color:"var(--text3)"}}>
      Chargement des graphiques...
    </div>
  );

  if (!data) return null;

  // Préparer données camembert
  const totalNb = data.statuts.reduce((s,x) => s+x.nb, 0);
  const dataCamembert = data.statuts.map(s => ({
    name:    s.statut,
    value:   s.nb,
    fill:    COULEURS_STATUTS[s.statut] || "#94a3b8",
    percent: totalNb > 0 ? Math.round(s.nb/totalNb*100) : 0,
  }));

  // Préparer données évolution
  const dataEvolution = data.evolution.map(e => ({
    mois:  e.mois,
    total: e.total,
    nb:    e.nb,
  }));

  const ONGLETS = [
    { id:"barres",    label:"Par spécialité",  Icon:BarChart3 },
    { id:"camembert", label:"Statuts",          Icon:PieIcon   },
    { id:"evolution", label:"Évolution",        Icon:TrendingUp},
  ];

  return (
    <div className="graphiques-card">
      <div className="graphiques-header">
        <div style={{fontWeight:700,fontSize:"1rem",color:"var(--text)"}}>
          Analyse financière
        </div>
        <div className="tabs" style={{gap:4}}>
          {ONGLETS.map(o => (
            <button key={o.id}
              className={`tab ${onglet===o.id?"actif":""}`}
              onClick={() => setOnglet(o.id)}
              style={{display:"flex",alignItems:"center",gap:6,fontSize:"0.8rem"}}>
              <o.Icon size={13}/> {o.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"1rem 1.5rem 1.5rem"}}>

        {/* ── Graphique barres : par spécialité ── */}
        {onglet === "barres" && (
          <>
            <p style={{fontSize:"0.8rem",color:"var(--text2)",marginBottom:"1rem"}}>
              Montants attendus vs versés par spécialité (FCFA)
            </p>
            {data.par_specialite.length === 0 ? (
              <div style={{textAlign:"center",color:"var(--text3)",padding:"2rem"}}>
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.par_specialite} margin={{top:5,right:20,left:20,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="specialite" tick={{fontSize:11,fill:"var(--text2)"}}/>
                  <YAxis tickFormatter={v => fmt(v/1000)+"k"}
                    tick={{fontSize:11,fill:"var(--text2)"}}/>
                  <Tooltip content={<TooltipBarre/>}/>
                  <Legend wrapperStyle={{fontSize:"0.8rem"}}/>
                  <Bar dataKey="attendu" name="Attendu" fill="#4f7cf7" radius={[4,4,0,0]}/>
                  <Bar dataKey="verse"   name="Versé"   fill="#22c55e" radius={[4,4,0,0]}/>
                  <Bar dataKey="reste"   name="Reste"   fill="#ef4444" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            )}
          </>
        )}

        {/* ── Camembert : statuts ── */}
        {onglet === "camembert" && (
          <>
            <p style={{fontSize:"0.8rem",color:"var(--text2)",marginBottom:"1rem"}}>
              Répartition des paiements par statut
            </p>
            <div style={{display:"flex",alignItems:"center",gap:"2rem",flexWrap:"wrap"}}>
              <ResponsiveContainer width={280} height={280}>
                <PieChart>
                  <Pie
                    data={dataCamembert} cx="50%" cy="50%"
                    outerRadius={110} innerRadius={55}
                    dataKey="value" nameKey="name"
                    paddingAngle={3}
                  >
                    {dataCamembert.map((entry,i) => (
                      <Cell key={i} fill={entry.fill}/>
                    ))}
                  </Pie>
                  <Tooltip content={<TooltipCamembert/>}/>
                </PieChart>
              </ResponsiveContainer>
              {/* Légende */}
              <div style={{display:"flex",flexDirection:"column",gap:"0.6rem"}}>
                {dataCamembert.map((d,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{
                      width:12,height:12,borderRadius:3,
                      background:d.fill,flexShrink:0
                    }}/>
                    <div>
                      <div style={{fontSize:"0.85rem",fontWeight:600,color:"var(--text)"}}>
                        {d.name}
                      </div>
                      <div style={{fontSize:"0.75rem",color:"var(--text2)"}}>
                        {d.value} paiement(s) · {d.percent}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Ligne : évolution mensuelle ── */}
        {onglet === "evolution" && (
          <>
            <p style={{fontSize:"0.8rem",color:"var(--text2)",marginBottom:"1rem"}}>
              Montants versés par mois (FCFA)
            </p>
            {dataEvolution.length === 0 ? (
              <div style={{textAlign:"center",color:"var(--text3)",padding:"2rem"}}>
                Pas encore de données d'évolution
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dataEvolution} margin={{top:5,right:20,left:20,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="mois" tick={{fontSize:11,fill:"var(--text2)"}}/>
                  <YAxis tickFormatter={v => fmt(v/1000)+"k"}
                    tick={{fontSize:11,fill:"var(--text2)"}}/>
                  <Tooltip formatter={(v) => [fmt(v)+" FCFA","Versé"]}
                    contentStyle={{
                      background:"var(--card)",border:"1px solid var(--border)",
                      borderRadius:10,fontSize:"0.83rem"
                    }}/>
                  <Line type="monotone" dataKey="total" name="Versé"
                    stroke="#4f7cf7" strokeWidth={2.5}
                    dot={{fill:"#4f7cf7",r:4}}
                    activeDot={{r:6}}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
}