// Guarda el usuario que inició sesión en localStorage (sin la contraseña).

const CLAVE = "usuario_sesion";

export function guardarSesion(usuario) {
  const datosPublicos = { ...usuario };
  delete datosPublicos.contraseña;
  localStorage.setItem(CLAVE, JSON.stringify(datosPublicos));
  try {
    window.dispatchEvent(new Event("sesion_cambiada"));
  } catch {
    // Entorno sin soporte de window
  }
}

// Devuelve el usuario conectado, o null si no hay sesión
export function obtenerSesion() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE);
  try {
    window.dispatchEvent(new Event("sesion_cambiada"));
  } catch {
    // Entorno sin soporte de window
  }
}

// Página a la que va cada rol después de iniciar sesión
export function rutaSegunRol(rol) {
  if (rol === "admin") return "/administradora";
  return "/";
}
