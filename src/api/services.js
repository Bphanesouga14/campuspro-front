// ============================================================
//  src/api/services.js
//
//  RÔLE : Fonctions qui appellent les routes du backend.
//  Chaque fonction correspond à une route de l'API.
//
//  UTILISATION (dans un composant React) :
//    import { authService } from "../api/services";
//    const token = await authService.login(email, password);
// ============================================================

import api from "./client";

// ── AUTHENTIFICATION ─────────────────────────────────────────
export const authService = {
  // Connexion → retourne le token + infos utilisateur
  login: async (email, motDePasse) => {
    // Le backend attend un formulaire (pas du JSON) pour le login
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", motDePasse);
    const res = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return res.data;
  },

  // Récupérer le profil de l'utilisateur connecté
  monProfil: async () => {
    const res = await api.get("/auth/moi");
    return res.data;
  },

  // Créer un compte (admin uniquement)
  creerUtilisateur: async (data) => {
    const res = await api.post("/auth/utilisateurs", data);
    return res.data;
  },

  // Lister les comptes (admin uniquement)
  listerUtilisateurs: async () => {
    const res = await api.get("/auth/utilisateurs");
    return res.data;
  },
  modifierUtilisateur: async (id, data) => {
    const res = await api.put("/auth/utilisateurs/" + id, data);
    return res.data;
  },
  supprimerUtilisateur: async (id) => {
    await api.delete("/auth/utilisateurs/" + id);
  },
};

// ── ÉTUDIANTS ────────────────────────────────────────────────
export const etudiantService = {
  // Liste avec filtres optionnels et pagination
  lister: async ({ niveau, id_specialite, annee, skip = 0, limit = 100 } = {}) => {
    const params = { skip, limit };
    if (niveau) params.niveau = niveau;
    if (id_specialite) params.id_specialite = id_specialite;
    if (annee) params.annee = annee;
    const res = await api.get("/etudiants", { params });
    return res.data;
  },

  // Détail d'un étudiant
  obtenir: async (id) => {
    const res = await api.get(`/etudiants/${id}`);
    return res.data;
  },

  // Créer un étudiant
  creer: async (data) => {
    const res = await api.post("/etudiants", data);
    return res.data;
  },

  // Modifier un étudiant (seuls les champs fournis sont modifiés)
  modifier: async (id, data) => {
    const res = await api.put(`/etudiants/${id}`, data);
    return res.data;
  },

  // Supprimer un étudiant
  supprimer: async (id) => {
    await api.delete(`/etudiants/${id}`);
  },

  // Historique des paiements d'un étudiant
  paiements: async (id) => {
    const res = await api.get(`/etudiants/${id}/paiements`);
    return res.data;
  },

  // URL de l'image QR code (utilisable dans <img src=...>)
  qrCodeUrl: (id) => `https://campuspro-backend.onrender.com/api/v1/etudiants/${id}/qr-code/image`,
};

// ── PAIEMENTS ────────────────────────────────────────────────
export const paiementService = {
  // Enregistrer un versement
  payer: async (idPaiement, { montant, datePaiement }) => {
    const res = await api.post(`/paiements/${idPaiement}/payer`, {
      montant,
      date_paiement: datePaiement,
    });
    return res.data;
  },

  // Liste des paiements en retard
  retards: async () => {
    const res = await api.get("/paiements/retards");
    return res.data;
  },
};

// ── SPÉCIALITÉS ──────────────────────────────────────────────
export const specialiteService = {
  lister: async (niveau) => {
    const params = niveau ? { niveau } : {};
    const res = await api.get("/specialites", { params });
    return res.data;
  },

  obtenir: async (id) => {
    const res = await api.get(`/specialites/${id}`);
    return res.data;
  },

  creerOuModifier: async (data) => {
    const res = await api.post("/specialites", data);
    return res.data;
  },
};

// ── TABLEAU DE BORD ──────────────────────────────────────────
export const dashboardService = {
  obtenir: async () => {
    const res = await api.get("/dashboard");
    return res.data;
  },

  
  
  analytique: async () => {
    const res = await api.get("/dashboard/analytique");
    return res.data;
  },
};




// ── IMPORT EXCEL ─────────────────────────────────────────────
export const importService = {
  importerExcel: async (fichier) => {
    const formData = new FormData();
    formData.append("fichier", fichier);
    const res = await api.post("/import/excel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
};

// Fonctions utilisateurs exportées séparément
export const modifierUtilisateur = async (id, data) => {
  const res = await api.put("/auth/utilisateurs/" + id, data);
  return res.data;
};
export const supprimerUtilisateur = async (id) => {
  await api.delete("/auth/utilisateurs/" + id);
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const notificationService = {
  recentes: async () => {
    const res = await api.get("/notifications/recentes");
    return res.data;
  },
};

// ── PROFIL ────────────────────────────────────────────────────
export const profilService = {
  obtenir: async () => {
    const res = await api.get("/profil");
    return res.data;
  },
  modifier: async (data) => {
    const res = await api.put("/profil", data);
    return res.data;
  },
  uploaderPhoto: async (fichier) => {
    const form = new FormData();
    form.append("fichier", fichier);
    const res = await api.post("/profil/photo", form);
    return res.data; // { photo: "data:image/...;base64,..." }
  },
  uploaderPhotoEtudiant: async (idEtudiant, fichier) => {
    const form = new FormData();
    form.append("fichier", fichier);
    const res = await api.post("/etudiants/" + idEtudiant + "/photo", form);
    return res.data;
  },
  getPhotoEtudiant: async (idEtudiant) => {
    const res = await api.get("/etudiants/" + idEtudiant + "/photo");
    return res.data.photo;
  },
};
