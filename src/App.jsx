import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }  from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import RouteProtegee     from "./components/RouteProtegee";
import Layout            from "./components/Layout";

import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Etudiants    from "./pages/Etudiants";
import Paiements    from "./pages/Paiements";
import Specialites  from "./pages/Specialites";
import Import       from "./pages/Import";
import Utilisateurs from "./pages/Utilisateurs";
import QRCodes      from "./pages/QRCodes";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <RouteProtegee>
                  <Layout />
                </RouteProtegee>
              }
            >
              <Route index               element={<Dashboard />} />
              <Route path="etudiants"    element={<Etudiants />} />
              <Route path="paiements"    element={<Paiements />} />
              <Route path="specialites"  element={<Specialites />} />
              <Route path="qrcodes"      element={<QRCodes />} />
              <Route path="import"       element={<Import />} />
              <Route path="utilisateurs" element={<Utilisateurs />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
