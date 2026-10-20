import { useNavigate, useLocation } from "react-router-dom";
import { obtenerSesion, cerrarSesion } from "../../data/sesion";

export const Navbar = () => {
    const navigate = useNavigate();
    useLocation(); // vuelve a leer la sesión cada vez que cambia la ruta
    const usuario = obtenerSesion();

    function salir() {
        cerrarSesion();
        navigate("/login");
    }

    return(
        <nav className="navbar">
            <div className="navbar-container">
                <a onClick={(e) => { e.preventDefault(); navigate("/"); }} className="navbar-brand" style={{ cursor: "pointer" }}>
                    <span className="brand-name">El Volcán</span>
                    <span className="brand-tagline">Gas a la puerta de tu hogar.</span>
                </a>
                <ul className="navbar-links">
                    <li><button onClick={() => navigate("/")}>Inicio</button></li>
                    {usuario ? (
                        <>
                            {usuario.rol === "admin" && (
                                <li><button onClick={() => navigate("/administradora")}>Administración</button></li>
                            )}
                            <li><button className="nav-btn-active" onClick={salir}>Cerrar sesión</button></li>
                        </>
                    ) : (
                        <>
                            <li><button onClick={() => navigate("/login")}>Ingresar</button></li>
                            <li><button className="nav-btn-active" onClick={() => navigate("/register")}>Registrarse</button></li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    )
}
