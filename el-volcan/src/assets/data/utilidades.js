// Funciones pequeñas que usan varios componentes de la vista administradora.

// 12000 -> "$12.000"
export function formatearPesos(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor);
}

// Devuelve "Crítico", "Bajo" u "OK" según el stock y el mínimo del producto
export function estadoStock(producto) {
  if (producto.stock <= producto.minimo / 2) return "Crítico";
  if (producto.stock < producto.minimo) return "Bajo";
  return "OK";
}

// Fecha de hoy en formato chileno: 17/10/2026
export function fechaDeHoy() {
  return new Date().toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).replaceAll("-", "/");
}
