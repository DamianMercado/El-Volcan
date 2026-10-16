import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./assets/components/layouts/Layout.jsx";
import { Login } from "./assets/components/pages/Login.jsx";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}