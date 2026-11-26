import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../../context/Sesion.jsx'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const Layout = () => {
  const { pathname } = useLocation()
  const { usuario } = useSesion()

  const esRepartidor =
    String(usuario?.rol || usuario?.perfil || '').toLowerCase() === 'repartidor'

  // El repartidor opera únicamente en su ruta aislada (/repartidor), sin acceso a la tienda
  if (esRepartidor) {
    return <Navigate to="/repartidor" replace />
  }

  // En la pasarela de Webpay Plus (/pago) se muestra la interfaz externa oficial de Transbank
  if (pathname === '/pago') {
    return <Outlet />
  }

  const esRutaAdmin = pathname.startsWith('/administradora')

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F9FC]">
      <Navbar />
      <main
        className={
          esRutaAdmin
            ? 'mx-auto w-full max-w-[1120px] flex-1 px-4 py-6 sm:px-6'
            : 'flex flex-1 flex-col'
        }
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
