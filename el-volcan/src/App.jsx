import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./assets/components/layouts/Layout.jsx";
import { Login } from "./assets/components/pages/Login.jsx";
import { Home } from "./assets/components/pages/Home.jsx";
import { Pedido } from "./assets/components/pages/Pedido.jsx";
import { Productos } from "./assets/components/pages/Productos.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="pedido" element={<Pedido />} />
            <Route path="productos" element={<Productos />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}