import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Layout } from "./assets/layouts/Layout"
import { Administradora } from "./assets/pages/Administradora"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={<p className="pendiente-merge">La vista del repartidor está en su propia rama y se agrega al hacer merge.</p>}
          />
          <Route path="administradora" element={<Administradora />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
