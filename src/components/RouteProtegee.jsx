// ============================================================
//  src/components/RouteProtegee.jsx
//
//  RÔLE : Empêcher l'accès aux pages si non connecté.
//  Redirige vers /login si le token est absent.
// ============================================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RouteProtegee({ children }) {
  const { estConnecte, chargement } = useAuth();

  // Pendant la vérification du token (au tout premier rendu)
  if (chargement) return <div className="chargement">Chargement...</div>;

  // Non connecté → rediriger vers la page de login
  if (!estConnecte) return <Navigate to="/login" replace />;

  return children;
}
