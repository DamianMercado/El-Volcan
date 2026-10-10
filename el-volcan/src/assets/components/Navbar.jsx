export const Navbar = () => {
    return(
        <nav class="navbar">
            <div class="navbar-container">
                <a href="home.html" class="navbar-brand">
                    <span class="brand-name">El Volcán</span>
                    <span class="brand-tagline">Gas a la puerta de tu hogar.</span>
                </a>
                <ul class="navbar-links">
                    <li><a href="home.html">Inicio</a></li>
                    <li><a href="contacto.html">Contacto</a></li>
                    <li><a href="login.html" class="nav-btn-active">Iniciar Sesión</a></li>
                </ul>
            </div>
        </nav>
    )
}