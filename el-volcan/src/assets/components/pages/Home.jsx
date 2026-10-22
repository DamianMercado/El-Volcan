import { useNavigate } from "react-router-dom";
import "../../css/home.css";

export function Home() {
  const navigate = useNavigate();
  return (
    <main className="home-container">
      <div className="home-hero-card">
        <h1 className="home-title">
          Gas a la puerta de tu hogar
        </h1>
        <p className="home-description">
          Pide tus cilindros de gas licuado y accesorios con la mejor atención,
          rapidez y seguridad garantizada.
        </p>

        <button
          className="home-cta-btn"
          onClick={() => navigate("/productos")}
        >
          Crea tu pedido aquí →
        </button>
      </div>
    </main>
  );
}
