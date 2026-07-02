import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SelecteurTheme from "./SelecteurTheme";
import Footer from "./Footer";
import {
  LayoutDashboard, GraduationCap, CreditCard, BookOpen,
  QrCode, Upload, Users, LogOut, PanelLeftClose, PanelLeftOpen,
  Bell, Settings
} from "lucide-react";

const NAV = [
  { to:"/",              Icon:LayoutDashboard, label:"Tableau de bord" },
  { to:"/etudiants",     Icon:GraduationCap,   label:"Étudiants" },
  { to:"/paiements",     Icon:CreditCard,      label:"Paiements" },
  { to:"/specialites",   Icon:BookOpen,        label:"Spécialités" },
  { to:"/qrcodes",       Icon:QrCode,          label:"QR Codes" },
  { to:"/import",        Icon:Upload,          label:"Import Excel",   roles:["ADMIN","SECRETAIRE"] },
  { to:"/utilisateurs",  Icon:Users,           label:"Utilisateurs",   roles:["ADMIN"] },
  { to:"/notifications", Icon:Bell,            label:"Notifications" },
  { to:"/parametres",    Icon:Settings,        label:"Paramètres" },
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
          {NAV.map(({to,Icon,label,roles})=>{
            if (roles && !aLeRole(...roles)) return null;
            return (
              <NavLink key={to} to={to} end={to==="/"}
                className={({isActive})=>`nav-link ${isActive?"actif":""}`}
                title={reduit?label:undefined}>
                <Icon size={18} className="nav-icon"/>
                {!reduit && <span className="nav-label">{label}</span>}
                {!reduit && <span className="nav-indicator"/>}
              </NavLink>
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
            <div className="user-avatar">{utilisateur?.nom?.[0]?.toUpperCase()}</div>
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
        <div className="app-topbar"><SelecteurTheme/></div>
        <div className="main-inner">
          <Outlet/>
          <Footer/>
        </div>
      </main>
    </div>
  );
}
