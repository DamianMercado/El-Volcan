import { BorrarToken, GenerarTokenLocal, GuardarToken } from "../../utils/token.js";

const CLAVE = "usuario_sesion";

export function guardarSesion(usuario) {
  const datosPublicos = { ...usuario };
  delete datosPublicos.contraseña;
  delete datosPublicos.password;
  if (datosPublicos.rol) {
    datosPublicos.rol = String(datosPublicos.rol).toLowerCase();
  }
  localStorage.setItem(CLAVE, JSON.stringify(datosPublicos));

  // Sincronizar token JWT en localStorage si aún no existe uno emitido por el backend
  if (!localStorage.getItem("token")) {
    GuardarToken(GenerarTokenLocal(datosPublicos));
  }

  try {
    window.dispatchEvent(new Event("sesion_cambiada"));
  } catch {
    // Entorno sin soporte de window
  }
}

export function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE);
  BorrarToken();
  try {
    window.dispatchEvent(new Event("sesion_cambiada"));
  } catch {
    // Entorno sin soporte de window
  }
}

export function rutaSegunRol(rol) {
  if (String(rol || "").toLowerCase() === "admin") return "/administradora";
  return "/";
}
