import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./assets/components/layouts/Layout.jsx";
import { Login } from "./assets/components/pages/Login.jsx";
import { Register } from "./assets/components/pages/Register.jsx";
import { Home } from "./assets/components/pages/Home.jsx";
import { CreacionPedido } from "./assets/components/pages/CreacionPedido.jsx";
import { Productos } from "./assets/components/pages/Productos.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";
import { Administradora } from "./assets/components/pages/Administradora.jsx";
import { RutaProtegida } from "./assets/components/layouts/RutaProtegida.jsx";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="administradora"
              element={
                <RutaProtegida roles={["admin"]}>
                  <Administradora />
                </RutaProtegida>
              }
            />
            <Route path="creacion-pedido" element={<CreacionPedido />} />
            <Route path="pedido" element={<CreacionPedido />} />
            <Route path="productos" element={<Productos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
