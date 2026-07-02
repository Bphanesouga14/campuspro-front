import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import RouteProtegee     from "./components/RouteProtegee";
import Layout            from "./components/Layout";

import Landing       from "./pages/Landing";
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import Etudiants     from "./pages/Etudiants";
import Paiements     from "./pages/Paiements";
import Specialites   from "./pages/Specialites";
import Import        from "./pages/Import";
import Utilisateurs  from "./pages/Utilisateurs";
import QRCodes       from "./pages/QRCodes";
import Notifications from "./pages/Notifications";
import Parametres    from "./pages/Parametres";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/accueil" element={<Landing/>}/>
            <Route path="/login"   element={<Login/>}/>
            <Route path="/" element={<RouteProtegee><Layout/></RouteProtegee>}>
              <Route index               element={<Dashboard/>}/>
              <Route path="etudiants"    element={<Etudiants/>}/>
              <Route path="paiements"    element={<Paiements/>}/>
              <Route path="specialites"  element={<Specialites/>}/>
              <Route path="qrcodes"      element={<QRCodes/>}/>
              <Route path="import"       element={<Import/>}/>
              <Route path="utilisateurs" element={<Utilisateurs/>}/>
              <Route path="notifications" element={<Notifications/>}/>
              <Route path="parametres"   element={<Parametres/>}/>
            </Route>
            <Route path="*" element={<Navigate to="/accueil" replace/>}/>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
