import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSesion } from '../context/Sesion.jsx'
import {
  ListarPedidosServicio,
  asignarRepartidorPedido,
  marcarPedidoEntregado,
} from '../service/pedidoService.js'
import { ListarRepartidores } from '../service/inventarioService.js'
import { BarraSuperiorRepartidor } from '../components/repartidor/BarraSuperiorRepartidor.jsx'
import { TarjetaPedidoRepartidor } from '../components/repartidor/TarjetaPedidoRepartidor.jsx'
import { DetallePedidoRepartidor } from '../components/repartidor/DetallePedidoRepartidor.jsx'
import { BarraInferiorRepartidor } from '../components/repartidor/BarraInferiorRepartidor.jsx'
import { BannerAlerta } from '../components/ui/BannerAlerta.jsx'
import {
  EsqueletoRepartidorMovil,
  esperarEsqueleto,
} from '../components/ui/Esqueleto.jsx'

const normalizarNombre = (texto) =>
  String(texto || '')
    .trim()
    .toLowerCase()

export function Repartidor() {
  const { id: idRuta } = useParams()
  const navigate = useNavigate()
  const { usuario, cerrar } = useSesion()

  const nombreRepartidor = useMemo(() => {
    const combinado = `${usuario?.nombres || usuario?.nombre || ''} ${
      usuario?.apellidos || ''
    }`.trim()
    return (usuario?.nombreUsuario || combinado || 'Repartidor').trim()
  }, [usuario])

  const [pedidos, setPedidos] = useState([])
  const [patente, setPatente] = useState('')
  const [tabActiva, setTabActiva] = useState('en_ruta')
  const [busqueda, setBusqueda] = useState('')
  const [pedidoSeleccionadoId, setPedidoSeleccionadoId] = useState(
    () => idRuta || ''
  )
  const [cargando, setCargando] = useState(true)
  const [actualizando, setActualizando] = useState(false)
  const [procesandoAccion, setProcesandoAccion] = useState(false)
  const [alerta, setAlerta] = useState({ mensaje: '', tipo: '' })

  const obtenerDatos = useCallback(async () => {
    const [listaPedidos, listaRepartidores] = await Promise.all([
      ListarPedidosServicio(),
      ListarRepartidores().catch(() => []),
    ])

    const miPerfil = Array.isArray(listaRepartidores)
      ? listaRepartidores.find(
          (r) =>
            normalizarNombre(r.nombre) === normalizarNombre(nombreRepartidor)
        )
      : null

    return {
      listaPedidos: Array.isArray(listaPedidos) ? listaPedidos : [],
      patenteEncontrada: miPerfil?.patenteCamion || '',
    }
  }, [nombreRepartidor])

  useEffect(() => {
    let montado = true

    Promise.all([obtenerDatos(), esperarEsqueleto()])
      .then(([{ listaPedidos, patenteEncontrada }]) => {
        if (!montado) return
        setPedidos(listaPedidos)
        setPatente(patenteEncontrada)
        setAlerta({ mensaje: '', tipo: '' })
      })
      .catch(async (err) => {
        await esperarEsqueleto()
        if (!montado) return
        setAlerta({
          mensaje:
            err?.message ||
            'No pudimos cargar los pedidos de reparto en este momento.',
          tipo: 'error',
        })
      })
      .finally(() => {
        if (montado) setCargando(false)
      })

    return () => {
      montado = false
    }
  }, [obtenerDatos])

  const recargar = async () => {
    setActualizando(true)
    try {
      const { listaPedidos, patenteEncontrada } = await obtenerDatos()
      setPedidos(listaPedidos)
      if (patenteEncontrada) setPatente(patenteEncontrada)
      setAlerta({ mensaje: '', tipo: '' })
    } catch (err) {
      setAlerta({
        mensaje:
          err?.message || 'No pudimos actualizar los pedidos en este momento.',
        tipo: 'error',
      })
    } finally {
      setActualizando(false)
    }
  }

  const cerrarSesionRepartidor = () => {
    cerrar()
    navigate('/login', { replace: true })
  }

  const esMio = useCallback(
    (pedido) =>
      normalizarNombre(pedido?.repartidor) ===
      normalizarNombre(nombreRepartidor),
    [nombreRepartidor]
  )

  const grupos = useMemo(() => {
    const enRuta = pedidos.filter(
      (p) => String(p.estado || '').toLowerCase() === 'en ruta' && esMio(p)
    )
    const disponibles = pedidos.filter(
      (p) =>
        String(p.estado || '').toLowerCase() === 'pendiente' &&
        (!p.repartidor || esMio(p))
    )
    const entregados = pedidos.filter(
      (p) => String(p.estado || '').toLowerCase() === 'entregado' && esMio(p)
    )
    return {
      en_ruta: enRuta,
      disponibles,
      entregados,
    }
  }, [pedidos, esMio])

  const pedidosTabActual = useMemo(() => {
    const base = grupos[tabActiva] || []
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return base
    return base.filter((p) => {
      const textoItems = Array.isArray(p.items)
        ? p.items.map((it) => it.producto?.nombre || '').join(' ')
        : ''
      const campos = [
        p.codigo,
        p.cliente,
        p.direccion,
        p.comuna,
        p.detalle,
        textoItems,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return campos.includes(texto)
    })
  }, [grupos, tabActiva, busqueda])

  const idActivo = idRuta || pedidoSeleccionadoId
  const pedidoActivo = useMemo(() => {
    if (!idActivo) return null
    return (
      pedidos.find(
        (p) =>
          String(p.id) === String(idActivo) ||
          String(p.codigo).toLowerCase() === String(idActivo).toLowerCase()
      ) || null
    )
  }, [pedidos, idActivo])

  const seleccionarPedido = (pedido) => {
    setAlerta({ mensaje: '', tipo: '' })
    setPedidoSeleccionadoId(String(pedido.id))
    navigate(`/repartidor/${pedido.id}`)
  }

  const volverALista = () => {
    setPedidoSeleccionadoId('')
    navigate('/repartidor')
  }

  const tomarPedido = async (pedido) => {
    setProcesandoAccion(true)
    setAlerta({ mensaje: '', tipo: '' })
    try {
      const actualizado = await asignarRepartidorPedido(
        pedido.id,
        nombreRepartidor
      )
      setPedidos((prev) =>
        prev.map((p) => (String(p.id) === String(pedido.id) ? actualizado : p))
      )
      setTabActiva('en_ruta')
      setAlerta({
        mensaje: `Pedido #${actualizado.codigo} asignado. Ya puedes iniciar la ruta en Google Maps o Waze.`,
        tipo: 'exito',
      })
    } catch (err) {
      setAlerta({
        mensaje:
          err?.message ||
          'No pudimos tomar el pedido en este momento. Inténtalo nuevamente.',
        tipo: 'error',
      })
    } finally {
      setProcesandoAccion(false)
    }
  }

  const completarEntrega = async (pedido) => {
    setProcesandoAccion(true)
    setAlerta({ mensaje: '', tipo: '' })
    try {
      const actualizado = await marcarPedidoEntregado(pedido.id)
      setPedidos((prev) =>
        prev.map((p) => (String(p.id) === String(pedido.id) ? actualizado : p))
      )
      setTabActiva('entregados')
      setAlerta({
        mensaje: `Entrega de #${actualizado.codigo} completada correctamente.`,
        tipo: 'exito',
      })
    } catch (err) {
      setAlerta({
        mensaje:
          err?.message ||
          'No pudimos completar la entrega en este momento. Inténtalo nuevamente.',
        tipo: 'error',
      })
    } finally {
      setProcesandoAccion(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f7fb] text-[#1A1D20]">
      <BarraSuperiorRepartidor
        nombreRepartidor={nombreRepartidor}
        patente={patente}
        actualizando={actualizando}
        alActualizar={recargar}
        alCerrarSesion={cerrarSesionRepartidor}
      />

      <main className="flex-1">
        {alerta.mensaje && (
          <div className="mx-auto max-w-2xl px-4 pt-3">
            <BannerAlerta mensaje={alerta.mensaje} tipo={alerta.tipo} />
          </div>
        )}

        {cargando ? (
          <EsqueletoRepartidorMovil />
        ) : pedidoActivo ? (
          <DetallePedidoRepartidor
            pedido={pedidoActivo}
            nombreRepartidor={nombreRepartidor}
            procesando={procesandoAccion}
            alVolver={volverALista}
            alTomarPedido={tomarPedido}
            alCompletarEntrega={completarEntrega}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4 pb-24">
            {/* Tarjetas resumen rápidas */}
            <section
              aria-label="Resumen de entregas"
              className="grid grid-cols-3 gap-2.5"
            >
              <button
                type="button"
                onClick={() => setTabActiva('en_ruta')}
                className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                  tabActiva === 'en_ruta'
                    ? 'border-[#2358b9] bg-[#f4f8ff] shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  En ruta
                </p>
                <p className="m-0 mt-1 text-2xl font-extrabold text-[#2358b9]">
                  {grupos.en_ruta.length}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('disponibles')}
                className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                  tabActiva === 'disponibles'
                    ? 'border-[#FF4500] bg-orange-50/70 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Por tomar
                </p>
                <p className="m-0 mt-1 text-2xl font-extrabold text-[#FF4500]">
                  {grupos.disponibles.length}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTabActiva('entregados')}
                className={`cursor-pointer rounded-2xl border p-3 text-left transition ${
                  tabActiva === 'entregados'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Entregados
                </p>
                <p className="m-0 mt-1 text-2xl font-extrabold text-emerald-600">
                  {grupos.entregados.length}
                </p>
              </button>
            </section>

            {/* Buscador rápido móvil */}
            <div>
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por dirección, código (#EV-110) o cliente..."
                aria-label="Buscar pedidos de reparto"
                className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-xs transition focus:border-[#2358b9] focus:outline-none"
              />
            </div>

            {/* Encabezado de sección activa */}
            <div className="flex items-center justify-between">
              <h1 className="m-0 text-base font-extrabold text-[#0A2540]">
                {tabActiva === 'en_ruta'
                  ? 'Mis entregas en ruta'
                  : tabActiva === 'disponibles'
                    ? 'Pedidos disponibles por tomar'
                    : 'Entregas completadas'}
              </h1>
              <span className="text-xs font-semibold text-slate-500">
                {pedidosTabActual.length}{' '}
                {pedidosTabActual.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>

            {/* Listado de tarjetas */}
            {pedidosTabActual.length > 0 ? (
              <div className="flex flex-col gap-3">
                {pedidosTabActual.map((pedido) => (
                  <TarjetaPedidoRepartidor
                    key={pedido.id}
                    pedido={pedido}
                    alSeleccionar={seleccionarPedido}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center shadow-xs">
                <p className="m-0 text-base font-bold text-[#0A2540]">
                  {tabActiva === 'en_ruta'
                    ? 'No tienes pedidos en ruta en este momento'
                    : tabActiva === 'disponibles'
                      ? 'No hay pedidos pendientes por tomar'
                      : 'Aún no registras entregas completadas'}
                </p>
                <p className="m-0 mt-1.5 text-xs text-slate-500">
                  {tabActiva === 'en_ruta' && grupos.disponibles.length > 0
                    ? `Hay ${grupos.disponibles.length} pedidos pendientes esperando repartidor.`
                    : 'Pulsa el botón superior de actualizar para consultar nuevos despachos.'}
                </p>
                {tabActiva === 'en_ruta' && grupos.disponibles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTabActiva('disponibles')}
                    className="mt-4 min-h-[44px] cursor-pointer rounded-xl bg-[#FF4500] px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-[#e03d00]"
                  >
                    Ver pedidos por tomar ({grupos.disponibles.length})
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Tab Bar visible en vista de lista */}
      {!pedidoActivo && (
        <BarraInferiorRepartidor
          tabActiva={tabActiva}
          alCambiarTab={(tab) => {
            setTabActiva(tab)
            setBusqueda('')
          }}
          contadores={{
            en_ruta: grupos.en_ruta.length,
            disponibles: grupos.disponibles.length,
            entregados: grupos.entregados.length,
          }}
        />
      )}
    </div>
  )
}

export default Repartidor
