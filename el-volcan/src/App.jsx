import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./assets/components/layouts/Layout.jsx";
import { Login } from "./assets/components/pages/Login.jsx";
import { Home } from "./assets/components/pages/Home.jsx";
import { Administradora } from "./assets/components/pages/Administradora.jsx";
import { RutaProtegida } from "./assets/components/layouts/RutaProtegida.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route
            path="administradora"
            element={
              <RutaProtegida roles={["admin"]}>
                <Administradora />
              </RutaProtegida>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
