export const Footer = () => {
    return(
        <footer class="footer">
            <div class="footer-container">
                <div class="footer-section">
                    <div class="footer-brand">
                        <span class="titulo-footer">El Volcán</span>
                    </div>
                    <p class="footer-desc">Distribuidora de gas comprometida con la seguridad y calidad de servicio.</p>
                </div>

                <div class="footer-section">
                    <h4>Contacto</h4>
                    <p>+56 9 1234 5678</p>
                    <p>contacto@elvolcan.cl</p>
                    <p>Chile</p>
                </div>

                <div class="footer-section">
                    <h4>Servicios</h4>
                    <ul class="footer-links">
                        <li><a href="pedidos-de-gas.html">Pedidos de Gas</a></li>
                        <li><a href="seguimiento.html">Seguimiento</a></li>
                        <li><a href="atencion-al-cliente.html">Atención al Cliente</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4>Legal</h4>
                    <ul class="footer-links">
                        <li><a href="terminos-y-condiciones.html">Términos y Condiciones</a></li>
                        <li><a href="politica-de-privacidad.html">Política de Privacidad</a></li>
                    </ul>
                </div>
            </div>

            <div class="footer-bottom">
                <p>© 2026 El Volcán. Todos los derechos reservados.</p>
            </div>
        </footer>
    )
}