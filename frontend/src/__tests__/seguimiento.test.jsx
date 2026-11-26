import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SesionProvider } from '../context/Sesion.jsx'
import { SeguimientoPedido } from '../pages/SeguimientoPedido.jsx'
import { guardarSesion } from '../utils/token.js'

const PEDIDOS_MOCK = [
  {
    id: 10,
    codigoVenta: 'EV-110',
    idUsuario: 4,
    idPago: 5,
    cliente: 'Cliente Usuario',
    email: 'cliente@el-volcan.com',
    direccion: 'Av. Concha y Toro 1420',
    comuna: 'Puente Alto',
    detalle: '1 (Carro porta cilindro 11/15kg x1)',
    total: 10990,
    metodoPago: 'pagar_ahora',
    subMetodoPago: 'webpay',
    estadoVenta: 'EN_RUTA',
    estadoPago: 'PAGADO',
    repartidor: 'Carlos Ruiz',
    fechaVenta: '2026-11-25T15:05:00Z',
    entrega: {
      direccion_entrega: 'Av. Concha y Toro 1420, Puente Alto',
      planta: 'Puente Alto',
      tiempo_estimado_min: 5,
      distancia_km: 2.3,
    },
    auditoria: [
      {
        mensaje: 'Pedido EV-110 registrado por Cliente Usuario',
        fechaHoraChile: '25/11/2026 12:05',
      },
      {
        mensaje: 'Pago ID 5 confirmado',
        fechaHoraChile: '25/11/2026 12:05',
      },
      {
        mensaje: 'Estado de despacho actualizado a: en_camino',
        fechaHoraChile: '25/11/2026 12:11',
      },
    ],
    items: [
      {
        codigoProducto: 'AC001',
        nombreProducto: 'Carro porta cilindro 11/15kg',
        precioUnitario: 10990,
        cantidad: 1,
        subtotal: 10990,
      },
    ],
  },
  ...Array.from({ length: 6 }, (_, idx) => {
    const num = 109 - idx
    return {
      id: 9 - idx,
      codigoVenta: `EV-${num}`,
      idUsuario: 4,
      cliente: 'Cliente Usuario',
      email: 'cliente@el-volcan.com',
      direccion: `Calle Prueba ${num}`,
      comuna: idx % 2 === 0 ? 'Puente Alto' : 'La Florida',
      detalle: '1 (Cilindro 11 kg x1)',
      total: 23990,
      metodoPago: 'repartidor',
      estadoVenta: idx % 2 === 0 ? 'ENTREGADO' : 'PENDIENTE',
      estadoPago: idx % 2 === 0 ? 'PAGADO' : 'PENDIENTE',
      repartidor: idx % 2 === 0 ? 'Diego Fuentes' : null,
      fechaVenta: `2026-11-${String(24 - idx).padStart(2, '0')}T14:00:00Z`,
      items: [
        {
          codigoProducto: 'CL002',
          nombreProducto: 'Cilindro 11 kg',
          precioUnitario: 23990,
          cantidad: 1,
          subtotal: 23990,
        },
      ],
    }
  }),
]

const REPARTIDORES_MOCK = [
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'Ruiz',
    telefono: '+56 9 3333 3333',
    direccion: 'Ruta Norte 120',
    comuna: 'Puente Alto',
    patenteCamion: 'KJ-WP-42',
    rol: 'REPARTIDOR',
  },
  {
    id: 5,
    nombre: 'Diego',
    apellido: 'Fuentes',
    telefono: '+56 9 5555 5555',
    direccion: 'Ruta Sur 240',
    comuna: 'La Florida',
    patenteCamion: 'LP-RT-88',
    rol: 'REPARTIDOR',
  },
]

const configurarMocksFetch = () => {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    if (String(url).includes('/usuarios/rol/REPARTIDOR')) {
      return { ok: true, json: async () => REPARTIDORES_MOCK }
    }
    return { ok: true, json: async () => PEDIDOS_MOCK }
  })
}

const renderSeguimiento = (rutaInicial = '/seguimiento') => {
  return render(
    <SesionProvider>
      <MemoryRouter initialEntries={[rutaInicial]}>
        <Routes>
          <Route path="/seguimiento" element={<SeguimientoPedido />} />
          <Route path="/seguimiento/:id" element={<SeguimientoPedido />} />
        </Routes>
      </MemoryRouter>
    </SesionProvider>
  )
}

describe('SeguimientoPedido - Ruta de seguimiento del cliente y lista paginable', () => {
  beforeEach(() => {
    localStorage.clear()
    guardarSesion({
      id: 99,
      idUsuario: 4,
      nombres: 'Cliente',
      apellidos: 'Usuario',
      email: 'cliente@el-volcan.com',
      rol: 'cliente',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('muestra todos los campos de seguimiento en vivo, repartidor, detalle e historial Hora Chile', async () => {
    configurarMocksFetch()
    renderSeguimiento('/seguimiento')

    // Cabecera de seguimiento y stepper
    expect(
      await screen.findByText('Tu cilindro de gas está en camino')
    ).toBeInTheDocument()
    expect(screen.getByText('Pedido #EV-110')).toBeInTheDocument()
    expect(screen.getByText('~5 min')).toBeInTheDocument()
    expect(screen.getByText('A 2.3 km de distancia')).toBeInTheDocument()
    const stepper = screen.getByLabelText('Progreso del despacho')
    expect(within(stepper).getByText('Pedido Recibido')).toBeInTheDocument()
    expect(within(stepper).getByText('Pedido Cargado')).toBeInTheDocument()
    expect(within(stepper).getByText('En Camino')).toBeInTheDocument()
    expect(within(stepper).getByText('Entregado')).toBeInTheDocument()

    // Selector "Tus pedidos:"
    expect(screen.getByLabelText('Tus pedidos:')).toBeInTheDocument()

    // Tarjeta Repartidor Asignado (sin datos ficticios como calificación ni entregas fijas)
    expect(screen.getByText('REPARTIDOR ASIGNADO')).toBeInTheDocument()
    expect(screen.getAllByText('Carlos Ruiz').length).toBeGreaterThan(0)
    expect(screen.queryByText(/428 entregas/i)).not.toBeInTheDocument()
    expect(screen.getByText('KJ-WP-42')).toBeInTheDocument()
    expect(screen.getByText('Puente Alto')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Llamar al Repartidor/i })
    ).toHaveAttribute('href', 'tel:+56933333333')

    // Detalle del Pedido
    expect(screen.getByText('Detalle del Pedido')).toBeInTheDocument()
    expect(
      screen.getAllByText(/Carro porta cilindro 11\/15kg/i).length
    ).toBeGreaterThan(0)

    // Historial del Pedido (Hora Chile)
    expect(
      screen.getByText('Historial del Pedido (Hora Chile)')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Pedido EV-110 registrado por Cliente Usuario')
    ).toBeInTheDocument()
    expect(screen.getByText('Pago ID 5 confirmado')).toBeInTheDocument()
    expect(
      screen.getByText('Estado de despacho actualizado a: en_camino')
    ).toBeInTheDocument()
  })

  it('pagina la lista de pedidos del cliente y permite cambiar de página y seleccionar otro pedido', async () => {
    configurarMocksFetch()
    renderSeguimiento('/seguimiento')

    // Página 1 de 2 (5 de 7 pedidos)
    expect(await screen.findByText('#EV-110')).toBeInTheDocument()
    expect(screen.getByText('#EV-106')).toBeInTheDocument()
    expect(screen.queryByText('#EV-105')).not.toBeInTheDocument()

    // Cambiar a página 2
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(await screen.findByText('#EV-105')).toBeInTheDocument()
    expect(screen.getByText('#EV-104')).toBeInTheDocument()
    expect(screen.queryByText('#EV-110')).not.toBeInTheDocument()

    // Seleccionar EV-105 (Entregado, repartidor Diego Fuentes)
    fireEvent.click(screen.getByText('#EV-105'))
    expect(
      await screen.findByText('Tu pedido fue entregado')
    ).toBeInTheDocument()
    expect(screen.getByText('Pedido #EV-105')).toBeInTheDocument()
    expect(screen.getByText('LP-RT-88')).toBeInTheDocument()
  })

  it('filtra estrictamente y nunca muestra pedidos de otros usuarios', async () => {
    const pedidosConAjenos = [
      ...PEDIDOS_MOCK.slice(0, 1),
      {
        id: 201,
        codigoVenta: 'EV-901',
        idUsuario: 4,
        cliente: 'Maria Gomez',
        email: 'maria.gomez@gmail.com',
        direccion: 'Calle Ajena 123',
        comuna: 'Puente Alto',
        detalle: '1 (Cilindro 15 kg x1)',
        total: 31990,
        metodoPago: 'pagar_ahora',
        estadoVenta: 'EN_RUTA',
        estadoPago: 'PAGADO',
        repartidor: 'Carlos Ruiz',
        fechaVenta: '2026-11-25T16:00:00Z',
        items: [],
      },
      {
        id: 202,
        codigoVenta: 'EV-902',
        idUsuario: 88,
        cliente: 'Otro Cliente',
        email: 'otro@correo.cl',
        direccion: 'Av. Otra 456',
        comuna: 'La Florida',
        detalle: '1 (Cilindro 5 kg x1)',
        total: 12990,
        metodoPago: 'repartidor',
        estadoVenta: 'PENDIENTE',
        estadoPago: 'PENDIENTE',
        repartidor: null,
        fechaVenta: '2026-11-25T17:00:00Z',
        items: [],
      },
    ]

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/usuarios/rol/REPARTIDOR')) {
        return { ok: true, json: async () => REPARTIDORES_MOCK }
      }
      return { ok: true, json: async () => pedidosConAjenos }
    })

    renderSeguimiento('/seguimiento/201')

    expect(await screen.findByText('Pedido #EV-110')).toBeInTheDocument()
    expect(screen.queryByText('#EV-901')).not.toBeInTheDocument()
    expect(screen.queryByText('#EV-902')).not.toBeInTheDocument()
    expect(screen.queryByText('Calle Ajena 123')).not.toBeInTheDocument()
  })
})
