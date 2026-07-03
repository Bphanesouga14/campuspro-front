// ============================================================
//  src/context/AuthContext.jsx
//
//  RÔLE : Stocker et partager les infos de l'utilisateur connecté
//         dans toute l'application.
//
//  PRINCIPE (Context React) :
//  Plutôt que de passer l'utilisateur de composant en composant,
//  on le met dans un "contexte" accessible partout avec useAuth().
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

// 1. Créer le contexte
const AuthContext = createContext(null);

// 2. Provider : enveloppe toute l'app et fournit les données
export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [token, setToken] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Au démarrage : lire le token/utilisateur sauvegardés (si déjà connecté)
  useEffect(() => {
    const tokenSauvegarde = localStorage.getItem("token");
    const userSauvegarde  = localStorage.getItem("utilisateur");
    if (tokenSauvegarde && userSauvegarde) {
      setToken(tokenSauvegarde);
      setUtilisateur(JSON.parse(userSauvegarde));
    }
    setChargement(false);
  }, []);

  // Appelée après un login réussi
 const connecter = (tokenRecu, userRecu) => {
  localStorage.setItem("token", tokenRecu);
  localStorage.setItem("utilisateur", JSON.stringify(userRecu));
  setToken(tokenRecu);
  setUtilisateur(userRecu);
};

// Mise à jour de la photo sans déconnecter
const mettreAJourPhoto = (photoDataUrl) => {
  setUtilisateur(prev => {
    const updated = { ...prev, photo: photoDataUrl };
    localStorage.setItem("utilisateur", JSON.stringify(updated));
    return updated;
  });
};

  // Appelée lors de la déconnexion
  const deconnecter = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    setToken(null);
    setUtilisateur(null);
  };

  // Vérifier si l'utilisateur a un rôle autorisé
  const aLeRole = (...roles) => {
    if (!utilisateur) return false;
    return roles.includes(utilisateur.role);
  };

  return (
  <AuthContext.Provider value={{
    utilisateur, token, chargement,
    connecter, deconnecter, aLeRole,
    mettreAJourPhoto,
    estConnecte: !!token,
  }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Hook personnalisé pour utiliser le contexte facilement
export function useAuth() {
  return useContext(AuthContext);
}
