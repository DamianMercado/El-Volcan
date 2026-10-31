import "../../css/footer.css";
export const Footer = () => {
    return(
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <div className="footer-brand">
                        <span className="titulo-footer">El Volcán</span>
                    </div>
                    <p className="footer-desc">Distribuidora de gas comprometida con la seguridad y calidad de servicio.</p>
                </div>

                <div className="footer-section">
                    <h4>Contacto</h4>
                    <p>+56 9 1234 5678</p>
                    <p>contacto@elvolcan.cl</p>
                    <p>Chile</p>
                </div>

                <div className="footer-section">
                    <h4>Servicios</h4>
                    <ul className="footer-links">
                        <li><a href="pedidos-de-gas.html">Pedidos de Gas</a></li>
                        <li><a href="seguimiento.html">Seguimiento</a></li>
                        <li><a href="atencion-al-cliente.html">Atención al Cliente</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4>Legal</h4>
                    <ul className="footer-links">
                        <li><a href="terminos-y-condiciones.html">Términos y Condiciones</a></li>
                        <li><a href="politica-de-privacidad.html">Política de Privacidad</a></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© 2026 El Volcán. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}