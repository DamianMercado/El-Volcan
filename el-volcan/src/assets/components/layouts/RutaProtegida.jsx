import { Navigate } from "react-router-dom";
import { obtenerSesion } from "../../data/sesion";

export function RutaProtegida({ roles, children }) {
  const usuario = obtenerSesion();

  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to="/" replace />;

  return children;
}
