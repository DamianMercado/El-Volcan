// Guarda el usuario que inició sesión en localStorage (sin la contraseña).

const CLAVE = "usuario_sesion";

export function guardarSesion(usuario) {
  const { id, nombres, email, rol } = usuario;
  localStorage.setItem(CLAVE, JSON.stringify({ id, nombres, email, rol }));
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
}

// Página a la que va cada rol después de iniciar sesión
export function rutaSegunRol(rol) {
  if (rol === "admin") return "/administradora";
  return "/";
}
