/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  BorrarToken,
  GuardarToken,
  LeerToken,
  UsuarioDesdeToken,
  esJwtEstructural,
  estaTokenExpirado,
  tokenProximoAExpirar,
  obtenerSesion,
  guardarSesion,
  cerrarSesion as cerrarSesionStorage,
  rutaSegunRol,
} from '../utils/token'
import {
  ValidarTokenServicio,
  RenovarTokenServicio,
  CerrarSesionBackend,
} from '../service/sesionService'

const SesionContext = createContext(null)

const resolverEstadoInicial = () => {
  const tokenGuardado = LeerToken()

  // Si existe un JWT estructural expirado o corrupto, se invalida de inmediato la sesión local
  if (tokenGuardado && estaTokenExpirado(tokenGuardado)) {
    cerrarSesionStorage()
    return { token: null, usuario: null }
  }

  const usuarioDesdeJwt = UsuarioDesdeToken(tokenGuardado)
  const sesionGuardada = obtenerSesion()

  if (sesionGuardada) {
    return {
      token: tokenGuardado,
      usuario: { ...(usuarioDesdeJwt || {}), ...sesionGuardada },
    }
  }

  if (usuarioDesdeJwt) {
    return { token: tokenGuardado, usuario: usuarioDesdeJwt }
  }

  return { token: null, usuario: null }
}

export const SesionProvider = ({ children }) => {
  const [{ token, usuario }, setEstadoSesion] = useState(resolverEstadoInicial)

  const iniciar = useCallback((nuevoToken, datosUsuarioOpcional = null) => {
    GuardarToken(nuevoToken)
    const decodificado = UsuarioDesdeToken(nuevoToken)
    const usuarioFinal = datosUsuarioOpcional
      ? { ...(decodificado || {}), ...datosUsuarioOpcional }
      : decodificado

    if (usuarioFinal) {
      guardarSesion(usuarioFinal)
    }
    setEstadoSesion({ token: nuevoToken, usuario: usuarioFinal })
  }, [])

  const cerrar = useCallback(() => {
    const tokenActivo = token || LeerToken()
    if (tokenActivo && esJwtEstructural(tokenActivo)) {
      void CerrarSesionBackend(tokenActivo)
    }
    BorrarToken()
    cerrarSesionStorage()
    setEstadoSesion({ token: null, usuario: null })
  }, [token])

  const renovar = useCallback(async () => {
    const tokenActivo = token || LeerToken()
    if (!tokenActivo || !esJwtEstructural(tokenActivo)) {
      return null
    }
    const { token: nuevoToken, usuario: datosRenovados } =
      await RenovarTokenServicio(tokenActivo)
    const usuarioPrevio = obtenerSesion() || usuario || {}
    const usuarioActualizado = {
      ...usuarioPrevio,
      ...datosRenovados,
      rol: String(
        datosRenovados?.rol || usuarioPrevio?.rol || 'cliente',
      ).toLowerCase(),
      token: nuevoToken,
    }
    iniciar(nuevoToken, usuarioActualizado)
    return nuevoToken
  }, [token, usuario, iniciar])

  useEffect(() => {
    const sincronizar = () => {
      const tokenActual = LeerToken()
      if (tokenActual && estaTokenExpirado(tokenActual)) {
        cerrarSesionStorage()
        setEstadoSesion({ token: null, usuario: null })
        return
      }

      const sesionActual = obtenerSesion()
      const usuarioJwt = UsuarioDesdeToken(tokenActual)

      if (sesionActual) {
        setEstadoSesion({
          token: tokenActual,
          usuario: { ...(usuarioJwt || {}), ...sesionActual },
        })
      } else if (usuarioJwt) {
        setEstadoSesion({ token: tokenActual, usuario: usuarioJwt })
      } else {
        setEstadoSesion({ token: null, usuario: null })
      }
    }

    const manejarSesionExpirada = () => {
      cerrarSesionStorage()
      setEstadoSesion({ token: null, usuario: null })
    }

    window.addEventListener('sesion_cambiada', sincronizar)
    window.addEventListener('storage', sincronizar)
    window.addEventListener('sesion_expirada', manejarSesionExpirada)
    return () => {
      window.removeEventListener('sesion_cambiada', sincronizar)
      window.removeEventListener('storage', sincronizar)
      window.removeEventListener('sesion_expirada', manejarSesionExpirada)
    }
  }, [])

  // Valida contra ms-auth o renueva proactivamente el JWT al cargar o recargar la página
  useEffect(() => {
    if (!token || !esJwtEstructural(token)) return undefined
    let cancelado = false

    const verificarORenovar = async () => {
      if (estaTokenExpirado(token)) {
        cerrarSesionStorage()
        if (!cancelado) setEstadoSesion({ token: null, usuario: null })
        return
      }

      if (tokenProximoAExpirar(token)) {
        try {
          await renovar()
          return
        } catch {
          // Si falla la renovación proactiva, validamos el token vigente
        }
      }

      try {
        const resultado = await ValidarTokenServicio(token)
        if (!cancelado && resultado && resultado.valido === false) {
          cerrarSesionStorage()
          setEstadoSesion({ token: null, usuario: null })
        }
      } catch {
        // Sin conexión con ms-auth: se conserva la sesión local mientras el JWT siga vigente
      }
    }

    void verificarORenovar()
    return () => {
      cancelado = true
    }
  }, [token, renovar])

  const rolNormalizado = (usuario?.rol || usuario?.perfil || '').toLowerCase()
  const esAdmin = rolNormalizado === 'admin'

  return (
    <SesionContext.Provider
      value={{
        token,
        usuario,
        activa: Boolean(usuario),
        esAdmin,
        iniciar,
        cerrar,
        renovar,
      }}
    >
      {children}
    </SesionContext.Provider>
  )
}

export const useSesion = () => {
  const ctx = useContext(SesionContext)
  if (!ctx) {
    const usuarioActual = obtenerSesion()
    const tokenActual = LeerToken()
    return {
      token: tokenActual,
      usuario: usuarioActual,
      activa: Boolean(usuarioActual),
      esAdmin: (usuarioActual?.rol || '').toLowerCase() === 'admin',
      iniciar: (nuevoToken, usr) => {
        GuardarToken(nuevoToken)
        const dec = usr || UsuarioDesdeToken(nuevoToken)
        if (dec) guardarSesion(dec)
      },
      cerrar: () => {
        if (tokenActual && esJwtEstructural(tokenActual)) {
          void CerrarSesionBackend(tokenActual)
        }
        BorrarToken()
        cerrarSesionStorage()
      },
      renovar: async () => null,
    }
  }
  return ctx
}

export { obtenerSesion, guardarSesion, cerrarSesionStorage as cerrarSesion, rutaSegunRol }
