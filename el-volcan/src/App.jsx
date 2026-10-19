import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./assets/components/layouts/Layout.jsx";
import { Login } from "./assets/components/pages/Login.jsx";
import { Home } from "./assets/components/pages/Home.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}