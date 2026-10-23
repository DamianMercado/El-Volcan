import { useNavigate } from "react-router-dom";
import "../../css/home.css";
import bannerDespacho from "../../img/home/banner-despacho.jpg";

export function Home() {
  const navigate = useNavigate();
  return (
    <main className="home-container">
      <button
        type="button"
        className="home-banner"
        onClick={() => navigate("/productos")}
        aria-label="Haz tu pedido online"
      >
        <img
          src={bannerDespacho}
          alt="El Volcán: despacho a domicilio de cilindros de gas, reguladores y mangueras"
          className="home-banner-img"
        />
      </button>
    </main>
  );
}
