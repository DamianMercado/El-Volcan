import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

export const Layout = () => {
  const { pathname } = useLocation()

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
