import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./assets/components/layouts/Layout.jsx";
import { Login } from "./assets/components/pages/Login.jsx";
import { Home } from "./assets/components/pages/Home.jsx";
import { Administradora } from "./assets/pages/Administradora.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="administradora" element={<Administradora />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
