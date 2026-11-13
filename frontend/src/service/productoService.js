import { Variables } from '../config/variables'
import { Rutas } from './endpoints'
import {
  obtenerCatalogoLocal,
  guardarCatalogoLocal,
  obtenerProductoLocalPorId,
  crearProductoLocal,
  actualizarProductoLocal,
  eliminarProductoLocal,
} from '../assets/data/productos'

const obtenerHeadersAuth = (conJson = false) => {
  const token = localStorage.getItem(Variables.tokenKey)
  const headers = {
    Accept: 'application/json',
  }
  if (conJson) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export const ListarProductos = async () => {
  try {
    const respuesta = await fetch(Rutas.productos, {
      method: 'GET',
      headers: obtenerHeadersAuth(false),
    })

    const datos = await respuesta.json().catch(() => null)
    if (!respuesta.ok || !Array.isArray(datos)) {
      return obtenerCatalogoLocal()
    }

    const normalizados = datos.map((item, idx) => ({
      id: item.id ?? idx + 1,
      codigo: item.codigo || `PR00${idx + 1}`,
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      categoria: item.categoria || 'Cilindros',
      precio: Number(item.precio ?? 0),
      stock: Number(item.stock ?? 0),
      minimo: Number(item.minimo ?? 20),
      imagen: item.imagen || '',
    }))

    guardarCatalogoLocal(normalizados)
    return normalizados
  } catch {
    return obtenerCatalogoLocal()
  }
}

export const ObtenerProducto = async (id) => {
  try {
    const respuesta = await fetch(Rutas.producto(id), {
      method: 'GET',
      headers: obtenerHeadersAuth(false),
    })

    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      const local = obtenerProductoLocalPorId(id)
      if (local) return local
      const error = new Error(datos.mensaje || datos.message || 'Producto no encontrado.')
      error.errores = datos.errores || {}
      throw error
    }

    return {
      id: datos.id,
      codigo: datos.codigo,
      nombre: datos.nombre,
      descripcion: datos.descripcion || '',
      categoria: datos.categoria || 'Cilindros',
      precio: Number(datos.precio ?? 0),
      stock: Number(datos.stock ?? 0),
      minimo: Number(datos.minimo ?? 20),
      imagen: datos.imagen || '',
    }
  } catch (err) {
    const local = obtenerProductoLocalPorId(id)
    if (local) return local
    throw err
  }
}

export const CrearProducto = async (producto) => {
  if (!producto.nombre || producto.precio <= 0) {
    const error = new Error('Completa todos los campos obligatorios con valores válidos.')
    error.errores = {}
    throw error
  }

  try {
    const respuesta = await fetch(Rutas.productos, {
      method: 'POST',
      headers: obtenerHeadersAuth(true),
      body: JSON.stringify(producto),
    })

    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      const error = new Error(datos.mensaje || datos.message || 'No se pudo crear el producto.')
      error.errores = datos.errores || {}
      throw error
    }

    crearProductoLocal(datos)
    return datos
  } catch (err) {
    if (err.errores && Object.keys(err.errores).length > 0) {
      throw err
    }
    return crearProductoLocal(producto)
  }
}

export const ActualizarProducto = async (id, producto) => {
  if (!producto.nombre || producto.precio <= 0) {
    const error = new Error('Completa todos los campos obligatorios con valores válidos.')
    error.errores = {}
    throw error
  }

  try {
    const respuesta = await fetch(Rutas.producto(id), {
      method: 'PUT',
      headers: obtenerHeadersAuth(true),
      body: JSON.stringify(producto),
    })

    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      const error = new Error(datos.mensaje || datos.message || 'No se pudo actualizar el producto.')
      error.errores = datos.errores || {}
      throw error
    }

    actualizarProductoLocal(id, datos)
    return datos
  } catch (err) {
    if (err.errores && Object.keys(err.errores).length > 0) {
      throw err
    }
    return actualizarProductoLocal(id, producto)
  }
}

export const EliminarProducto = async (id) => {
  try {
    const respuesta = await fetch(Rutas.producto(id), {
      method: 'DELETE',
      headers: obtenerHeadersAuth(false),
    })

    if (respuesta.status === 204 || respuesta.ok) {
      eliminarProductoLocal(id)
      return null
    }

    const datos = await respuesta.json().catch(() => ({}))
    const error = new Error(datos.mensaje || datos.message || 'No se pudo eliminar el producto.')
    error.errores = datos.errores || {}
    throw error
  } catch {
    eliminarProductoLocal(id)
    return null
  }
}
