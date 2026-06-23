import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/services";
import { useAuth }  from "../context/AuthContext";
import SelecteurTheme from "../components/SelecteurTheme";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [mdp, setMdp]           = useState("");
  const [erreur, setErreur]     = useState("");
  const [chargement, setCharge] = useState(false);

  const { connecter } = useAuth();
  const navigate      = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setCharge(true);
    try {
      const data = await authService.login(email, mdp);
      connecter(data.access_token, data.utilisateur);
      navigate("/");
    } catch (err) {
      setErreur(err.response?.data?.detail || "Erreur de connexion.");
    } finally {
      setCharge(false);
    }
  };

  return (
    <div className="login-page">
      {/* Sélecteur de thème en haut à droite — accessible AVANT connexion */}
      <div className="login-theme-switcher">
        <SelecteurTheme />
      </div>

      <div className="login-card">
        <div className="login-logo">🎓</div>
        <h1>LGS</h1>
        <p className="login-subtitle">Logiciel de Gestion Scolaire</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecole.cm"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={mdp}
              onChange={(e) => setMdp(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {erreur && <div className="alert alert-erreur">{erreur}</div>}
          <button type="submit" className="btn btn-primary btn-full" disabled={chargement}>
            {chargement ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
