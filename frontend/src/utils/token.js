import { Variables } from '../config/variables'

export const GuardarToken = (token) => {
  if (!token) return
  localStorage.setItem(Variables.tokenKey, token)
}

export const LeerToken = () => localStorage.getItem(Variables.tokenKey)

export const BorrarToken = () => {
  localStorage.removeItem(Variables.tokenKey)
}

/**
 * Genera un JWT Base64URL válido para el entorno local / pruebas cuando el backend Docker no está activo.
 */
export const GenerarTokenLocal = (usuario) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const nombreCompleto =
    usuario.nombre ||
    usuario.nombreUsuario ||
    `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() ||
    'Cliente El Volcán'
  const correo = usuario.correo || usuario.email || ''
  const perfil = (usuario.perfil || usuario.rol || 'cliente').toLowerCase()

  const payloadObj = {
    sub: correo,
    idUsuario: usuario.id || 1,
    nombre: nombreCompleto,
    nombreUsuario: nombreCompleto,
    nombres: usuario.nombres || nombreCompleto.split(' ')[0] || nombreCompleto,
    apellidos: usuario.apellidos || nombreCompleto.split(' ').slice(1).join(' ') || '',
    correo,
    email: correo,
    perfil,
    rol: perfil,
    rut: usuario.rut || '',
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    depto: usuario.depto || '',
    comuna: usuario.comuna || '',
    exp: Math.floor(Date.now() / 1000) + 86400,
  }

  const jsonPayload = encodeURIComponent(JSON.stringify(payloadObj)).replace(
    /%([0-9A-F]{2})/g,
    (_, p1) => String.fromCharCode(parseInt(p1, 16)),
  )

  const payload = btoa(jsonPayload)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  return `${header}.${payload}.local-signature`
}

export const UsuarioDesdeToken = (token) => {
  if (!token) return null

  try {
    const parte = token.split('.')[1]
    if (!parte) return null
    const base64 = parte.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((caracter) => `%${caracter.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    const datos = JSON.parse(json)

    const nombre = datos.nombre || datos.nombreUsuario || datos.nombres
    const perfil = (datos.perfil || datos.rol || '').toLowerCase()
    const correo = datos.correo || datos.email || datos.sub

    if (!nombre || !perfil || !correo) return null
    if (datos.exp && datos.exp * 1000 < Date.now()) return null

    const partesNombre = String(nombre).trim().split(' ')
    const nombres = datos.nombres || partesNombre[0] || nombre
    const apellidos = datos.apellidos ?? partesNombre.slice(1).join(' ')

    return {
      id: datos.idUsuario || datos.id || 1,
      nombre,
      nombres,
      apellidos,
      perfil,
      rol: perfil,
      correo,
      email: correo,
      rut: datos.rut || '',
      telefono: datos.telefono || '',
      direccion: datos.direccion || '',
      depto: datos.depto || '',
      comuna: datos.comuna || '',
    }
  } catch {
    return null
  }
}
