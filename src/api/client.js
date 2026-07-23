// ============================================================
//  src/api/client.js
//
//  RÔLE : Point central de communication avec le backend.
//  Toutes les requêtes HTTP passent par ce fichier.
//
//  PRINCIPE :
//  - On crée une instance axios avec l'URL de base du backend.
//  - Avant chaque requête, on ajoute automatiquement le token JWT
//    dans le header Authorization (si l'utilisateur est connecté).
//  - Si le backend répond 401 (token expiré), on déconnecte
//    automatiquement l'utilisateur.
// ============================================================

import axios from "axios";

// URL de ton backend FastAPI — à changer si tu déploies ailleurs
//const BASE_URL = "http://127.0.0.1:8000/api/v1";
const BASE_URL = "https://campuspro-backend.onrender.com/api/v1";

// Création de l'instance axios avec l'URL de base
const api = axios.create({
  baseURL: BASE_URL,
});

// ── Intercepteur de REQUÊTE ──────────────────────────────────
// Avant chaque requête : ajouter le token JWT si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Intercepteur de RÉPONSE ──────────────────────────────────
// Si le serveur répond 401 (non autorisé) → déconnecter
api.interceptors.response.use(
  (response) => response, // succès : on laisse passer
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("utilisateur");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
