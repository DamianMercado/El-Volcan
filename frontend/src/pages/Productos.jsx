import { useState, useEffect } from 'react'
import { obtenerProductosLocales } from '../assets/data/productos.js'
import { ListarProductos } from '../service/productoService.js'
import { useCarrito } from '../contexts/Carrito.jsx'
import { TarjetaProducto } from '../components/productos/TarjetaProducto.jsx'
import { FiltroCategorias } from '../components/productos/FiltroCategorias.jsx'

export function Productos() {
  const { agregarAlCarrito } = useCarrito()
  const [listaProductos, setListaProductos] = useState(() =>
    obtenerProductosLocales()
  )
  const [categoriaActiva, setCategoriaActiva] = useState('todos')

  useEffect(() => {
    let montado = true
    ListarProductos()
      .then((datos) => {
        if (montado && Array.isArray(datos) && datos.length > 0) {
          setListaProductos(datos)
        }
      })
      .catch(() => {
        // Se mantiene el catálogo local como respaldo
      })
    return () => {
      montado = false
    }
  }, [])

  const productosFiltrados =
    categoriaActiva === 'todos'
      ? listaProductos
      : listaProductos.filter(
          (p) =>
            String(p.categoria || '').toLowerCase() ===
            categoriaActiva.toLowerCase()
        )

  return (
    <main className="min-h-[calc(100vh-140px)] bg-gradient-to-b from-[#0A2540] to-[#113a63] px-5 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Nuestros Productos
          </h2>
          <p className="mt-2 text-base text-white/75">
            Selecciona los cilindros y accesorios que necesitas
          </p>
        </div>

        <FiltroCategorias
          categoriaActiva={categoriaActiva}
          alCambiarCategoria={setCategoriaActiva}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {productosFiltrados.map((prod) => (
            <TarjetaProducto
              key={prod.codigo || prod.id}
              producto={prod}
              alAgregar={agregarAlCarrito}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Productos
