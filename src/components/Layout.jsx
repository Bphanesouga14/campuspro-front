import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard, GraduationCap, CreditCard, BookOpen,
  QrCode, Upload, Users, LogOut, Bell, Settings,
  UserX, Menu, Monitor, Sun, Leaf
} from "lucide-react";

const SECTIONS = [
  {
    titre: "Principal",
    items: [
      { to:"/", Icon:LayoutDashboard, label:"Tableau de bord" },
    ]
  },
  {
    titre: "Gestion",
    items: [
      { to:"/etudiants",   Icon:GraduationCap, label:"Étudiants" },
      { to:"/paiements",   Icon:CreditCard,    label:"Paiements" },
      { to:"/specialites", Icon:BookOpen,      label:"Spécialités" },
    ]
  },
  {
    titre: "Suivi",
    items: [
      { to:"/qrcodes",  Icon:QrCode, label:"QR Codes" },
      { to:"/absences", Icon:UserX,  label:"Absences", roles:["ADMIN","SECRETAIRE"] },
    ]
  },
  {
    titre: "Administration",
    items: [
      { to:"/import",       Icon:Upload, label:"Import Excel",  roles:["ADMIN","SECRETAIRE"] },
      { to:"/utilisateurs", Icon:Users,  label:"Utilisateurs",  roles:["ADMIN"] },
    ]
  },
  {
    titre: "Système",
    items: [
      { to:"/notifications", Icon:Bell,     label:"Notifications" },
      { to:"/parametres",    Icon:Settings, label:"Paramètres" },
    ]
  },
];

const THEMES = [
  { id:"lumiere",  label:"Clair",    Icon:Sun  },
  { id:"emeraude", label:"Sombre",   Icon:Leaf },
];

export default function Layout() {
  const { utilisateur, deconnecter, aLeRole } = useAuth();
  const { theme, setTheme }                   = useTheme();
  const navigate                               = useNavigate();
  const [reduit, setReduit]                   = useState(false);

  const maintenant = new Date();
  const dateStr = maintenant.toLocaleDateString("fr-FR", {
    weekday:"long", day:"numeric", month:"long", year:"numeric"
  });

  return (
    <div className={`app ${reduit?"sidebar-reduite":""}`}>

      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">

        {/* Bouton toggle — tout en haut 
        <button
          className="sidebar-toggle-top"
          onClick={() => setReduit(!reduit)}
          title={reduit ? "Agrandir" : "Réduire"}>
          <Menu size={18}/>
        </button> */}

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">
            <GraduationCap size={20} color="white"/>
          </div>
          {!reduit && (
            <div className="logo-text-group">
              <span className="logo-text">CampusPro</span>
              <span className="logo-tagline">Gestion scolaire intelligente</span>
            </div>
          )}
        </div>

        {/* Navigation par sections */}
        <nav className="sidebar-nav">
          {SECTIONS.map(section => {
            const visibles = section.items.filter(item =>
              !item.roles || aLeRole(...item.roles)
            );
            if (visibles.length === 0) return null;
            return (
              <div key={section.titre} className="nav-section">
                {!reduit && (
                  <div className="nav-section-titre">{section.titre}</div>
                )}
                {visibles.map(({ to, Icon, label }) => (
                  <NavLink key={to} to={to} end={to==="/"}
                    className={({isActive}) => `nav-link ${isActive?"actif":""}`}
                    title={reduit ? label : undefined}>
                    <Icon size={17} className="nav-icon"/>
                    {!reduit && <span className="nav-label">{label}</span>}
                    {!reduit && <span className="nav-indicator"/>}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Footer utilisateur */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            {utilisateur?.photo ? (
              <img src={utilisateur.photo} alt="profil"
                style={{
                  width:34, height:34, borderRadius:"50%",
                  objectFit:"cover", flexShrink:0,
                  border:"2px solid var(--primary)"
                }}/>
            ) : (
              <div className="user-avatar">
                {utilisateur?.nom?.[0]?.toUpperCase()}
              </div>
            )}
            {!reduit && (
              <div className="user-info">
                <div className="user-name">{utilisateur?.nom}</div>
                <div className="user-role">{utilisateur?.role}</div>
              </div>
            )}
            <button className="btn-logout"
              onClick={() => { deconnecter(); navigate("/login"); }}
              title="Déconnexion">
              <LogOut size={14}/>
            </button>
          </div>
        </div>
      </aside>

      {/* ══ CONTENU ══ */}
      <main className="main">

      {/* Topbar */}
      <div className="app-topbar">
        {/* Bouton réduire — à gauche de la date */}
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          <button
            className="topbar-toggle-btn"
            onClick={() => setReduit(!reduit)}
            title={reduit ? "Agrandir" : "Réduire"}>
            <Menu size={18}/>
          </button>
          <div className="topbar-date">{dateStr}</div>
        </div>

        <div className="topbar-right">
          {/* Bouton thème — bascule entre Clair et Sombre */}
          <button
            className="theme-toggle-pill"
            onClick={() => setTheme(theme === "lumiere" ? "emeraude" : "lumiere")}
            title="Changer le thème">
            {theme === "lumiere"
              ? <><Sun size={14}/><span>Clair</span></>
              : <><Leaf size={14}/><span>Sombre</span></>
            }
          </button>

    {/* Notifications */}
    <NavLink to="/notifications"
      className={({isActive}) =>
        `notif-topbar-btn ${isActive?"actif":""}`}
      title="Notifications">
      <Bell size={16}/>
    </NavLink>
  </div>
</div>

        {/* Contenu des pages */}
        <div className="main-inner">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}