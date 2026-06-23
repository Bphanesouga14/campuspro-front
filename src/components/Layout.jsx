import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth }  from "../context/AuthContext";
import SelecteurTheme from "./SelecteurTheme";

function NavItem({ to, icone, label, roles, aLeRole }) {
  if (roles && !aLeRole(...roles)) return null;
  return (
    <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? "actif" : ""}`}>
      <span className="nav-icone">{icone}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );
}

export default function Layout() {
  const { utilisateur, deconnecter, aLeRole } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnecter();
    navigate("/login");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icone">🎓</span>
          <span className="logo-texte">LGS</span>
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/"              icone="📊" label="Tableau de bord"
            roles={["ADMIN","SECRETAIRE"]} aLeRole={aLeRole} />
          <NavItem to="/etudiants"     icone="👨‍🎓" label="Étudiants"   aLeRole={aLeRole} />
          <NavItem to="/paiements"     icone="💰" label="Paiements"    aLeRole={aLeRole} />
          <NavItem to="/specialites"   icone="📚" label="Spécialités"  aLeRole={aLeRole} />
          <NavItem to="/import"        icone="📥" label="Import Excel"
            roles={["ADMIN","SECRETAIRE"]} aLeRole={aLeRole} />
          <NavItem to="/utilisateurs"  icone="👥" label="Utilisateurs"
            roles={["ADMIN"]}             aLeRole={aLeRole} />
        </nav>

        {/* Sélecteur de thème dans la sidebar */}
        <div className="sidebar-theme">
          <span className="sidebar-theme-label">Thème</span>
          <SelecteurTheme compact />
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-nom">{utilisateur?.nom}</div>
            <div className="user-role">{utilisateur?.role}</div>
          </div>
          <button className="btn-deconnexion" onClick={handleDeconnexion} title="Se déconnecter">
            🚪
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
