import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCarrito } from "../../../contexts/Carrito.jsx";
import { obtenerSesion, cerrarSesion } from "../../data/sesion.js";
import logoVolcan from "../../img/elVolcan.svg";
import "../../css/navbar.css";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito, total } = useCarrito();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Estado del usuario con sesión activa
  const [usuario, setUsuario] = useState(() => obtenerSesion());

  // Sincronizar la sesión al cambiar de ruta o al emitirse eventos de sesión
  useEffect(() => {
    const sincronizarSesion = () => {
      setUsuario(obtenerSesion());
    };

    sincronizarSesion();

    window.addEventListener("sesion_cambiada", sincronizarSesion);
    window.addEventListener("storage", sincronizarSesion);

    return () => {
      window.removeEventListener("sesion_cambiada", sincronizarSesion);
      window.removeEventListener("storage", sincronizarSesion);
    };
  }, [location.pathname]);

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  const irA = (ruta) => {
    setMenuMovilAbierto(false);
    navigate(ruta);
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    setUsuario(null);
    setMenuMovilAbierto(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
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

        {/* Grupo derecho Desktop: Inicio, Productos, Carrito | Sesión o Ingreso */}
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
              onClick={() => irA("/creacion-pedido")}
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
            {usuario ? (
              <div className="navbar-user-box">
                <span className="navbar-user-name" title={usuario.email || "Cliente"}>
                  {usuario.nombres} {usuario.apellidos || ""}
                </span>
                {usuario.rol === "admin" && (
                  <button
                    type="button"
                    onClick={() => irA("/administradora")}
                    className="nav-btn nav-btn-admin"
                  >
                    Panel Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCerrarSesion}
                  className="nav-btn nav-btn-logout"
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => irA("/login")} className="nav-btn">
                  Ingresar
                </button>
                <button onClick={() => irA("/register")} className="nav-btn-primary">
                  Registrarse
                </button>
              </>
            )}
          </div>
        </div>

        {/* Controles para Móvil */}
        <div className="navbar-mobile-controls">
          <button
            type="button"
            className="mobile-cart-btn"
            onClick={() => irA("/creacion-pedido")}
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
            <button onClick={() => irA("/creacion-pedido")} className="nav-btn">
              <span>Resumen de Pedido</span>
              {cantidadTotal > 0 && (
                <span className="cart-total-amount" style={{ marginLeft: "8px" }}>
                  {"(" + cantidadTotal + ") $" + total.toLocaleString("es-CL")}
                </span>
              )}
            </button>

            <div className="mobile-auth-divider">
              {usuario ? (
                <div className="mobile-user-section">
                  <div className="mobile-user-info">
                    <span className="mobile-user-label">Cliente:</span>
                    <strong className="mobile-user-name">
                      {usuario.nombres} {usuario.apellidos || ""}
                    </strong>
                  </div>
                  {usuario.rol === "admin" && (
                    <button
                      type="button"
                      onClick={() => irA("/administradora")}
                      className="nav-btn"
                    >
                      Panel Administrador
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCerrarSesion}
                    className="nav-btn-logout mobile"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={() => irA("/login")} className="nav-btn">
                    Ingresar
                  </button>
                  <button onClick={() => irA("/register")} className="nav-btn-primary">
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
