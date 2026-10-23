// Funciones de utilidad para pedidos, montos y administración.

// Denominaciones oficiales en Chile
export const BILLETES_CHILE = [20000, 10000, 5000, 2000, 1000];
export const MONEDAS_CHILE = [500, 100, 50, 10];

// 12000 -> "$12.000"
export function formatearPesos(valor) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(valor || 0);
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

// Calcula sugerencias de montos con billetes y monedas (redondeos a 500, 1.000, 2.000, 5.000, 10.000, etc.)
export function obtenerSugerenciasMonto(montoTotal) {
  if (!montoTotal || montoTotal <= 0) return [5000, 10000, 20000];

  const sugerencias = new Set();

  // Redondeo al siguiente múltiplo de 500 (moneda de $500)
  if (montoTotal % 500 !== 0) {
    const sig500 = Math.ceil(montoTotal / 500) * 500;
    if (sig500 > montoTotal) sugerencias.add(sig500);
  }

  // Redondeo al siguiente múltiplo de 1.000
  if (montoTotal % 1000 !== 0) {
    const sig1000 = Math.ceil(montoTotal / 1000) * 1000;
    if (sig1000 > montoTotal) sugerencias.add(sig1000);
  }

  // Billetes estándar mayores al total
  for (const b of [1000, 2000, 5000, 10000, 20000]) {
    if (b > montoTotal) {
      sugerencias.add(b);
    }
  }

  // Para montos superiores a 20.000
  if (montoTotal >= 20000) {
    const sig10k = Math.ceil(montoTotal / 10000) * 10000;
    const sig20k = Math.ceil(montoTotal / 20000) * 20000;
    if (sig10k > montoTotal) sugerencias.add(sig10k);
    if (sig20k > montoTotal) sugerencias.add(sig20k);
    sugerencias.add((sig20k || sig10k) + 10000);
  }

  return Array.from(sugerencias)
    .filter((val) => val > montoTotal)
    .sort((a, b) => a - b)
    .slice(0, 4);
}

// Desglosa el vuelto en billetes y monedas de Chile (disponible para vista de repartidor)
export function calcularDesgloseVuelto(montoVuelto) {
  if (!montoVuelto || montoVuelto <= 0) {
    return {
      totalBilletes: 0,
      totalMonedas: 0,
      billetes: [],
      monedas: [],
    };
  }

  let restante = montoVuelto;
  const billetes = [];
  let totalBilletes = 0;

  for (const d of BILLETES_CHILE) {
    if (restante >= d) {
      const cant = Math.floor(restante / d);
      restante = restante % d;
      totalBilletes += cant * d;
      billetes.push({ denominacion: d, cantidad: cant });
    }
  }

  const monedas = [];
  let totalMonedas = 0;

  for (const d of MONEDAS_CHILE) {
    if (restante >= d) {
      const cant = Math.floor(restante / d);
      restante = restante % d;
      totalMonedas += cant * d;
      monedas.push({ denominacion: d, cantidad: cant });
    }
  }

  return {
    totalBilletes,
    totalMonedas,
    billetes,
    monedas,
  };
}
