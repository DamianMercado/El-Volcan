import { useNavigate } from 'react-router-dom'

const bannerDespacho =
  'https://res.cloudinary.com/hsr9lgyw/image/upload/banner-despacho.jpg'

export function Inicio() {
  const navigate = useNavigate()
  return (
    <main className="flex w-full flex-1 flex-col bg-[#0A2540]">
      <button
        type="button"
        className="block w-full flex-1 cursor-pointer border-0 bg-transparent p-0 leading-none"
        onClick={() => navigate('/productos')}
        aria-label="Haz tu pedido online"
      >
        <img
          src={bannerDespacho}
          alt="El Volcán: despacho a domicilio de cilindros de gas, reguladores y mangueras"
          className="block h-[calc(100vh-64px)] w-full object-fill"
        />
      </button>
    </main>
  )
}

export const Home = Inicio
export default Inicio
