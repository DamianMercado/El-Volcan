import { Rutas } from './endpoints'
import { buscarUsuarioPorCredenciales, registrarUsuario, actualizarPasswordLocal } from '../assets/data/users'
import { GenerarTokenLocal } from '../utils/token'

export const IniciarSesion = async ({ correo, email, clave, password }) => {
  const emailFinal = (correo || email || '').trim()
  const passwordFinal = clave || password || ''

  try {
    const respuesta = await fetch(Rutas.login, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailFinal,
        password: passwordFinal,
        correo: emailFinal,
        clave: passwordFinal,
      }),
    })

    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || datos.message || 'Correo o contraseña incorrectos')
    }

    return {
      token: datos.token,
      usuario: datos,
    }
  } catch (err) {
    // Si el error viene explícitamente del backend por credenciales inválidas, propagarlo
    if (err.message === 'Correo o contraseña incorrectos' || err.message.includes('Credenciales inválidas')) {
      throw new Error('Correo o contraseña incorrectos')
    }

    // Fallback local si el backend Docker no está en ejecución (ej. en entorno de desarrollo local o Vitest)
    const usuarioLocal = buscarUsuarioPorCredenciales(emailFinal, passwordFinal)
    if (!usuarioLocal) {
      throw new Error('Correo o contraseña incorrectos')
    }

    const tokenLocal = GenerarTokenLocal(usuarioLocal)
    return {
      token: tokenLocal,
      usuario: usuarioLocal,
    }
  }
}

export const RegistrarCuenta = async (datosRegistro) => {
  try {
    const respuesta = await fetch(Rutas.registro, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: datosRegistro.nombres,
        apellido: datosRegistro.apellidos,
        rut: datosRegistro.rut,
        telefono: datosRegistro.telefono,
        direccion: datosRegistro.direccion,
        comuna: datosRegistro.comuna,
        email: datosRegistro.email,
        password: datosRegistro.contraseña || datosRegistro.password,
        rol: (datosRegistro.rol || 'CLIENTE').toUpperCase(),
      }),
    })

    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      return {
        exito: false,
        mensaje: datos.mensaje || datos.message || 'No se pudo completar el registro.',
      }
    }

    // También sincronizar en almacenamiento local
    registrarUsuario(datosRegistro)
    return {
      exito: true,
      usuario: datos,
      token: datos.token,
    }
  } catch {
    return registrarUsuario(datosRegistro)
  }
}

export const RecuperarClaveServicio = async ({ email, nuevaPassword }) => {
  const emailLimpio = (email || '').trim().toLowerCase()

  try {
    const respuesta = await fetch(Rutas.recuperarClave, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: emailLimpio,
        password: nuevaPassword,
      }),
    })

    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      throw new Error(datos.mensaje || datos.message || 'No se encontró una cuenta asociada a ese correo.')
    }

    actualizarPasswordLocal(emailLimpio, nuevaPassword)
    return {
      exito: true,
      mensaje: 'Contraseña restablecida exitosamente.',
    }
  } catch (err) {
    // Intentar en el respaldo local
    const resultadoLocal = actualizarPasswordLocal(emailLimpio, nuevaPassword)
    if (!resultadoLocal.exito) {
      throw new Error(err.message || resultadoLocal.mensaje)
    }
    return resultadoLocal
  }
}
