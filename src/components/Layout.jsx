import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SelecteurTheme from "./SelecteurTheme";
import Footer from "./Footer";
import {
  LayoutDashboard, GraduationCap, CreditCard, BookOpen,
  QrCode, Upload, Users, LogOut, PanelLeftClose, PanelLeftOpen,
  Bell, Settings, UserX
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


export default function Layout() {
  const { utilisateur, deconnecter, aLeRole } = useAuth();
  const navigate = useNavigate();
  const [reduit, setReduit] = useState(false);

  return (
    <div className={`app ${reduit?"sidebar-reduite":""}`}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><GraduationCap size={22} color="white"/></div>
          {!reduit && (
            <div className="logo-text-group">
              <span className="logo-text">CampusPro</span>
              <span className="logo-tagline">Gestion scolaire intelligente</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {SECTIONS.map(section => {
            // Filtrer les items accessibles
            const itemsVisibles = section.items.filter(item =>
              !item.roles || aLeRole(...item.roles)
            );
            if (itemsVisibles.length === 0) return null;

            return (
              <div key={section.titre} className="nav-section">
                {/* Titre de section — caché si sidebar réduite */}
                {!reduit && (
                  <div className="nav-section-titre">{section.titre}</div>
                )}
                {itemsVisibles.map(({ to, Icon, label }) => (
                  <NavLink key={to} to={to} end={to==="/"}
                    className={({isActive}) => `nav-link ${isActive?"actif":""}`}
                    title={reduit ? label : undefined}>
                    <Icon size={18} className="nav-icon"/>
                    {!reduit && <span className="nav-label">{label}</span>}
                    {!reduit && <span className="nav-indicator"/>}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-collapse-btn-wrap">
          <button className="sidebar-collapse-btn" onClick={()=>setReduit(!reduit)}
            title={reduit?"Agrandir":"Réduire"}>
            {reduit ? <PanelLeftOpen size={16}/> : <><PanelLeftClose size={16}/>{" Réduire"}</>}
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            {/* Avatar : photo réelle ou initiale */}
            {utilisateur?.photo ? (
              <img
                src={utilisateur.photo}
                alt="profil"
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  objectFit: "cover", flexShrink: 0,
                  border: "2px solid var(--primary)"
                }}
              />
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
              onClick={()=>{deconnecter();navigate("/login");}} title="Déconnexion">
              <LogOut size={15}/>
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        {/* Header fixe en haut à droite */}
        <div className="app-topbar">
          <NavLink to="/notifications" className="notif-topbar-btn" title="Notifications">
            <Bell size={18}/>
          </NavLink>
          <SelecteurTheme/>
        </div>
        <div className="main-inner">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}
