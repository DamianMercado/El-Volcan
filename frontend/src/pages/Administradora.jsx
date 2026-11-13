import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CabeceraAdminNav } from '../components/admin/CabeceraAdminNav.jsx'
import { TarjetasResumen } from '../components/admin/TarjetasResumen.jsx'
import { TablaStock } from '../components/admin/TablaStock.jsx'
import { PedidosClientes } from '../components/admin/PedidosClientes.jsx'
import { Repartidores } from '../components/admin/Repartidores.jsx'
import { SolicitarStock } from '../components/admin/SolicitarStock.jsx'
import { fechaDeHoy } from '../utils/formato.js'
import {
  ListarSolicitudesStock,
  CrearSolicitudStock,
  ConfirmarRecepcionStock,
  ListarRepartidores,
} from '../service/inventarioService.js'
import { ListarProductos } from '../service/productoService.js'
import {
  ListarPedidosServicio,
  asignarRepartidorPedido,
} from '../service/pedidoService.js'

export function Administradora() {
  const [productos, setProductos] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [repartidores, setRepartidores] = useState([])
  const [codigoSolicitud, setCodigoSolicitud] = useState('')

  const formularioRef = useRef(null)

  useEffect(() => {
    let montado = true

    ListarProductos()
      .then((lista) => {
        if (montado && Array.isArray(lista)) {
          setProductos(lista)
        }
      })
      .catch(() => {})

    ListarPedidosServicio()
      .then((listaPedidos) => {
        if (montado && Array.isArray(listaPedidos)) {
          setPedidos(listaPedidos)
        }
      })
      .catch(() => {})

    ListarSolicitudesStock()
      .then((listaSol) => {
        if (montado && Array.isArray(listaSol)) {
          setSolicitudes(listaSol)
        }
      })
      .catch(() => {})

    ListarRepartidores()
      .then((listaRep) => {
        if (montado && Array.isArray(listaRep)) {
          setRepartidores(listaRep)
        }
      })
      .catch(() => {})

    return () => {
      montado = false
    }
  }, [])

  function elegirProducto(codigo) {
    setCodigoSolicitud(codigo)
    formularioRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function solicitarStock(codigo, cantidad, nota) {
    const creada = await CrearSolicitudStock({ codigo, cantidad, nota })
    setSolicitudes((anteriores) => [creada, ...anteriores])
    setCodigoSolicitud('')
  }

  async function recibirSolicitud(id) {
    const solicitud = solicitudes.find((s) => s.id === id)
    if (!solicitud) return

    await ConfirmarRecepcionStock(id)
    setSolicitudes((anteriores) =>
      anteriores.map((s) => (s.id === id ? { ...s, estado: 'Recibida' } : s))
    )
    setProductos((anteriores) =>
      anteriores.map((p) =>
        p.codigo === solicitud.codigo
          ? { ...p, stock: p.stock + solicitud.cantidad }
          : p
      )
    )
  }

  async function asignarRepartidor(idPedido, nombreRepartidor) {
    const pedidoActualizado = await asignarRepartidorPedido(
      idPedido,
      nombreRepartidor
    )
    setPedidos((anteriores) =>
      anteriores.map((p) =>
        String(p.id) === String(idPedido) ? pedidoActualizado : p
      )
    )
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#f4f7fb] px-4 py-7 text-[#1f2d3d] md:px-6">
      <div className="mx-auto max-w-[1150px]">
        <CabeceraAdminNav
          titulo="Panel de administración"
          subtitulo={`Resumen del día · ${fechaDeHoy()}`}
          accionesDerecha={
            <Link
              to="/administradora/productos/nuevo"
              className="rounded-lg bg-[#FF4500] px-4 py-2 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-[#e03d00]"
            >
              + Nuevo Producto
            </Link>
          }
        />

        <TarjetasResumen
          productos={productos}
          pedidos={pedidos}
          solicitudes={solicitudes}
        />

        <section className="mb-5 rounded-[10px] bg-white p-5 shadow-sm">
          <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
            <h3 className="m-0 text-lg font-bold text-[#1d3963]">
              Resumen de stock
            </h3>
            <Link
              to="/administradora/productos"
              className="text-xs font-semibold text-[#2358b9] no-underline hover:underline"
            >
              Gestionar catálogo completo (Crear / Editar / Eliminar) →
            </Link>
          </div>
          <TablaStock
            productos={productos}
            solicitudes={solicitudes}
            alSolicitar={elegirProducto}
          />
        </section>

        <section className="mb-5 rounded-[10px] bg-white p-5 shadow-sm">
          <h3 className="mb-3.5 text-lg font-bold text-[#1d3963]">
            Pedidos de clientes
          </h3>
          <PedidosClientes
            pedidos={pedidos}
            repartidores={repartidores}
            alAsignar={asignarRepartidor}
          />
        </section>

        <section className="mb-5 rounded-[10px] bg-white p-5 shadow-sm">
          <h3 className="mb-3.5 text-lg font-bold text-[#1d3963]">
            Repartidores
          </h3>
          <Repartidores repartidores={repartidores} pedidos={pedidos} />
        </section>

        <section
          className="mb-5 rounded-[10px] bg-white p-5 shadow-sm"
          ref={formularioRef}
        >
          <h3 className="mb-3.5 text-lg font-bold text-[#1d3963]">
            Solicitar más stock
          </h3>
          <SolicitarStock
            productos={productos}
            solicitudes={solicitudes}
            codigo={codigoSolicitud}
            alCambiarCodigo={setCodigoSolicitud}
            alSolicitar={solicitarStock}
            alRecibir={recibirSolicitud}
          />
        </section>
      </div>
    </div>
  )
}

export default Administradora
