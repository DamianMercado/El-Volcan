import { Navigate } from "react-router-dom";
import { obtenerSesion } from "../../data/sesion";

// Solo muestra la página si hay sesión y el rol está permitido.
// Si no hay sesión manda al login; si el rol no corresponde, al inicio.
export function RutaProtegida({ roles, children }) {
  const usuario = obtenerSesion();

  if (!usuario) return <Navigate to="/login" replace />;
  if (!roles.includes(usuario.rol)) return <Navigate to="/" replace />;

  return children;
}
