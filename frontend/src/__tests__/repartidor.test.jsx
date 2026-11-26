import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SesionProvider } from '../context/Sesion.jsx'
import { CarritoProvider } from '../context/Carrito.jsx'
import { Repartidor } from '../pages/Repartidor.jsx'
import { Layout } from '../components/layouts/Layout.jsx'
import { RutaPrivada } from '../components/layouts/Rutas.jsx'
import { guardarSesion, rutaSegunRol } from '../utils/token.js'

const VENTAS_REPARTO_MOCK = [
  {
    id: 10,
    codigoVenta: 'EV-110',
    idUsuario: 4,
    cliente: 'Cliente Usuario',
    rut: '44444444-4',
    telefono: '+56 9 4444 4444',
    direccion: 'Av. Concha y Toro 1420',
    comuna: 'Puente Alto',
    observacion: 'Portón negro, tocar timbre 2',
    detalle: '1 (Cilindro gas licuado 15 kg x1)',
    total: 31990,
    metodoPago: 'repartidor',
    estadoVenta: 'EN_RUTA',
    estadoPago: 'PENDIENTE',
    repartidor: 'Carlos Ruiz',
    fechaVenta: '2026-11-26T15:00:00Z',
    entrega: {
      direccion_entrega: 'Av. Concha y Toro 1420, Puente Alto',
      planta: 'Puente Alto',
      distancia_km: 4.8,
      tiempo_estimado_min: 8,
      ubicacion: {
        type: 'Point',
        coordinates: [-70.5828512, -33.5730806],
      },
    },
    items: [
      {
        codigoProducto: 'CL003',
        nombreProducto: 'Cilindro gas licuado 15 kg',
        precioUnitario: 31990,
        cantidad: 1,
        subtotal: 31990,
      },
    ],
  },
  {
    id: 11,
    codigoVenta: 'EV-111',
    idUsuario: 7,
    cliente: 'Camila Reyes',
    telefono: '+56 9 6666 7777',
    direccion: 'Av. Central 120',
    comuna: 'Puente Alto',
    observacion: 'Depto 204',
    detalle: '2 (Cilindro gas licuado 11 kg x2)',
    total: 47980,
    metodoPago: 'pagar_ahora',
    estadoVenta: 'PENDIENTE',
    estadoPago: 'PAGADO',
    repartidor: null,
    fechaVenta: '2026-11-26T15:10:00Z',
    items: [
      {
        codigoProducto: 'CL002',
        nombreProducto: 'Cilindro gas licuado 11 kg',
        precioUnitario: 23990,
        cantidad: 2,
        subtotal: 47980,
      },
    ],
  },
]

const REPARTIDORES_MOCK = [
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'Ruiz',
    telefono: '+56 9 3333 3333',
    comuna: 'Puente Alto',
    patenteCamion: 'KJ-WP-42',
    rol: 'REPARTIDOR',
  },
]

const renderAppRepartidor = (rutaInicial = '/repartidor') => {
  return render(
    <SesionProvider>
      <CarritoProvider>
        <MemoryRouter initialEntries={[rutaInicial]}>
          <Routes>
            <Route element={<RutaPrivada roles={['repartidor']} />}>
              <Route path="/repartidor" element={<Repartidor />} />
              <Route path="/repartidor/:id" element={<Repartidor />} />
            </Route>
            <Route element={<Layout />}>
              <Route path="/" element={<div>Inicio Tienda</div>} />
              <Route path="/productos" element={<div>Catálogo Tienda</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CarritoProvider>
    </SesionProvider>
  )
}

describe('Ruta aislada Mobile-First de Repartidor (/repartidor)', () => {
  beforeEach(() => {
    localStorage.clear()
    guardarSesion({
      id: 3,
      idUsuario: 3,
      nombreUsuario: 'Carlos Ruiz',
      nombres: 'Carlos',
      apellidos: 'Ruiz',
      email: 'repartidor@el-volcan.com',
      rol: 'repartidor',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('aisla al repartidor de Inicio, Productos, Seguimiento y Carrito y redirige su rol a /repartidor', async () => {
    expect(rutaSegunRol('repartidor')).toBe('/repartidor')
    expect(rutaSegunRol('REPARTIDOR')).toBe('/repartidor')

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (String(url).includes('/usuarios/rol/REPARTIDOR')) {
        return { ok: true, json: async () => REPARTIDORES_MOCK }
      }
      return { ok: true, json: async () => VENTAS_REPARTO_MOCK }
    })

    // Aunque intente entrar a /productos, Layout lo redirige a /repartidor
    renderAppRepartidor('/productos')

    expect(await screen.findByText('Mis entregas en ruta')).toBeInTheDocument()
    expect(screen.queryByText('Catálogo Tienda')).not.toBeInTheDocument()
    expect(screen.queryByText('Productos')).not.toBeInTheDocument()
    expect(screen.queryByText('Seguimiento')).not.toBeInTheDocument()
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument()
  })

  it('muestra detalle del pedido con enlaces reales a Google Maps y Waze y permite completar la entrega', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, opts) => {
      if (String(url).includes('/usuarios/rol/REPARTIDOR')) {
        return { ok: true, json: async () => REPARTIDORES_MOCK }
      }
      if (opts?.method === 'PUT' && String(url).includes('/entregar')) {
        return {
          ok: true,
          json: async () => ({
            ...VENTAS_REPARTO_MOCK[0],
            estadoVenta: 'ENTREGADO',
            estadoPago: 'PAGADO',
          }),
        }
      }
      return { ok: true, json: async () => VENTAS_REPARTO_MOCK }
    })

    renderAppRepartidor('/repartidor')

    // Seleccionar pedido en ruta #EV-110
    const tarjeta = await screen.findByText('Av. Concha y Toro 1420, Puente Alto')
    fireEvent.click(tarjeta)

    // Verifica detalle, nota y enlaces de navegación con coordenadas exactas
    expect(await screen.findByText('DESTINO DE ENTREGA')).toBeInTheDocument()
    expect(screen.getByText('Portón negro, tocar timbre 2')).toBeInTheDocument()

    const linkMaps = screen.getByRole('link', { name: /Google Maps/i })
    expect(linkMaps).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=-33.5730806,-70.5828512&travelmode=driving'
    )

    const linkWaze = screen.getByRole('link', { name: /Abrir Waze/i })
    expect(linkWaze).toHaveAttribute(
      'href',
      'https://waze.com/ul?ll=-33.5730806,-70.5828512&navigate=yes'
    )

    // Confirmación de entrega en 2 pasos
    fireEvent.click(screen.getByRole('button', { name: /Completar entrega/i }))
    fireEvent.click(
      screen.getByRole('button', { name: /Sí, marcar Entregado/i })
    )

    expect(
      await screen.findByText(/Entrega de #EV-110 completada correctamente/i)
    ).toBeInTheDocument()
  })

  it('permite tomar un pedido pendiente desde la pestaña Por Tomar', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, opts) => {
      if (String(url).includes('/usuarios/rol/REPARTIDOR')) {
        return { ok: true, json: async () => REPARTIDORES_MOCK }
      }
      if (
        opts?.method === 'PUT' &&
        String(url).includes('/asignar-repartidor')
      ) {
        return {
          ok: true,
          json: async () => ({
            ...VENTAS_REPARTO_MOCK[1],
            estadoVenta: 'EN_RUTA',
            repartidor: 'Carlos Ruiz',
          }),
        }
      }
      return { ok: true, json: async () => VENTAS_REPARTO_MOCK }
    })

    renderAppRepartidor('/repartidor')

    await screen.findByText('Mis entregas en ruta')
    const barraInferior = screen.getByLabelText('Navegación de repartidor')
    fireEvent.click(
      within(barraInferior).getByRole('button', { name: /Por Tomar/i })
    )

    const pedidoPendiente = await screen.findByText('Av. Central 120, Puente Alto')
    fireEvent.click(pedidoPendiente)

    fireEvent.click(
      screen.getByRole('button', { name: /Tomar pedido e iniciar ruta/i })
    )

    expect(
      await screen.findByText(/Pedido #EV-111 asignado/i)
    ).toBeInTheDocument()
  })
})
