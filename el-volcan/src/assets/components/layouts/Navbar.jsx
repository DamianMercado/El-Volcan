import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext.jsx";
import logoVolcan from "../../img/elVolcan.svg";
import "../../css/navbar.css";

export const Navbar = () => {
  const navigate = useNavigate();
  const { carrito, total } = useCart();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const irA = (ruta) => {
    setMenuMovilAbierto(false);
    navigate(ruta);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Marca / Logo */}
        <a
          onClick={(e) => {
            e.preventDefault();
            irA("/");
          }}
          className="navbar-brand"
        >
          <img
            src={logoVolcan}
            alt="El Volcán Logo"
            className="brand-logo"
          />
          <span className="brand-name">El Volcán</span>
          <span className="brand-tagline">
            Gas a la puerta de tu hogar.
          </span>
        </a>

        {/* Grupo derecho Desktop: Inicio, Productos, Carrito | Ingresar, Registrarse */}
        <div className="navbar-desktop-group">
          <div className="navbar-nav-links">
            <button onClick={() => irA("/")} className="nav-btn">
              Inicio
            </button>
            <button onClick={() => irA("/productos")} className="nav-btn">
              Productos
            </button>

            {/* Botón Carrito */}
            <button
              type="button"
              className="nav-cart-btn"
              onClick={() => irA("/pedido")}
              title="Ver resumen y pagar pedido"
            >
              <span>🛒</span>
              <span>Carrito</span>
              {cantidadTotal > 0 && (
                <>
                  <span className="cart-badge">
                    {cantidadTotal}
                  </span>
                  <span className="cart-total-amount">
                    {"$" + total.toLocaleString("es-CL")}
                  </span>
                </>
              )}
            </button>
          </div>

          <div className="navbar-auth-links">
            <button onClick={() => irA("/login")} className="nav-btn">
              Ingresar
            </button>
            <button onClick={() => irA("/register")} className="nav-btn-primary">
              Registrarse
            </button>
          </div>
        </div>

        {/* Controles para Móvil */}
        <div className="navbar-mobile-controls">
          <button
            type="button"
            className="mobile-cart-btn"
            onClick={() => irA("/pedido")}
          >
            <span>🛒</span>
            {cantidadTotal > 0 && (
              <>
                <span className="cart-badge">{cantidadTotal}</span>
                <span className="cart-total-amount">
                  {"$" + total.toLocaleString("es-CL")}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            className={"hamburger-btn" + (menuMovilAbierto ? " active" : "")}
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            aria-label="Menú de navegación"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Menú Móvil */}
        {menuMovilAbierto && (
          <div className="navbar-mobile-menu">
            <button onClick={() => irA("/")} className="nav-btn">
              Inicio
            </button>
            <button onClick={() => irA("/productos")} className="nav-btn">
              Productos
            </button>
            <button onClick={() => irA("/pedido")} className="nav-btn">
              <span>Resumen de Pedido</span>
              {cantidadTotal > 0 && (
                <span className="cart-total-amount" style={{ marginLeft: "8px" }}>
                  {"(" + cantidadTotal + ") $" + total.toLocaleString("es-CL")}
                </span>
              )}
            </button>
            <div className="mobile-auth-divider">
              <button onClick={() => irA("/login")} className="nav-btn">
                Ingresar
              </button>
              <button onClick={() => irA("/register")} className="nav-btn-primary">
                Registrarse
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
