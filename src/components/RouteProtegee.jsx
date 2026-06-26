import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RouteProtegee({ children }) {
  const { estConnecte, chargement } = useAuth();
  if (chargement) return <div className="page-load"><div className="page-spinner"/></div>;
  if (!estConnecte) return <Navigate to="/accueil" replace/>;
  return children;
}
