// Denominaciones oficiales en Chile
export const BILLETES_CHILE = [20000, 10000, 5000, 2000, 1000]
export const MONEDAS_CHILE = [500, 100, 50, 10]

const formateadorClp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export const formatearPesos = (valor) => {
  const numero = Number(valor)
  if (Number.isNaN(numero)) return '$0'
  return formateadorClp.format(numero)
}

export const formatoPrecio = formatearPesos

export const estadoStock = (producto) => {
  const stock = Number(producto?.stock ?? 0)
  const minimo = Number(producto?.minimo ?? 20)
  if (stock <= minimo / 2) return 'Crítico'
  if (stock < minimo) return 'Bajo'
  return 'OK'
}

export const fechaDeHoy = () => {
  return new Date()
    .toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replaceAll('-', '/')
}
