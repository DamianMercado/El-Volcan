import { useNavigate } from "react-router-dom";
    
export const Navbar = () => {
    const navigate = useNavigate();
    return(
        <nav className="navbar">
            <div className="navbar-container">
                <a onClick={(e) => { e.preventDefault(); navigate("/"); }} className="navbar-brand" style={{ cursor: "pointer" }}>
                    <span className="brand-name">El Volcán</span>
                    <span className="brand-tagline">Gas a la puerta de tu hogar.</span>
                </a>
                <ul className="navbar-links">
                    <li><button onClick={() => navigate("/")}>Inicio</button></li>
                    <li><button onClick={() => navigate("/login")}>Ingresar</button></li>
                    <li><button className="nav-btn-active" onClick={() => navigate("/register")}>Registrarse</button></li>
                </ul>
            </div>
        </nav>
    )
}