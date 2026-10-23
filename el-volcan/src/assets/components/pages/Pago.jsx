import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCarrito } from "../../../contexts/Carrito.jsx";
import { actualizarEstadoPago, obtenerUltimoPedido } from "../../data/pedidos.js";
import { formatearPesos } from "../../data/utilidades.js";
import "../../css/pago.css";

// Tarjetas oficiales de prueba de Transbank Webpay Plus
const TARJETAS_PRUEBA = {
  debito: {
    tipo: "debito",
    etiqueta: "Débito / Redcompra",
    numero: "6600 0000 0000 0001",
    expiracion: "12/28",
    cvv: "123",
  },
  credito: {
    tipo: "credito",
    etiqueta: "Tarjeta de Crédito",
    numero: "5970 2000 0000 0001",
    expiracion: "12/28",
    cvv: "123",
  },
};

export function Pago() {
  const location = useLocation();
  const navigate = useNavigate();
  const { limpiarCarrito } = useCarrito();

  // Obtener el pedido actual desde la navegación o localStorage
  const [pedido] = useState(() => {
    return location.state?.pedido || obtenerUltimoPedido();
  });

  // Datos del formulario necesarios exclusivamente para el comprobante
  const [email, setEmail] = useState(() => pedido?.email || "cliente@el-volcan.cl");
  const [nombreTitular, setNombreTitular] = useState(() => pedido?.cliente || "Cliente Particular");
  const [numeroTarjeta, setNumeroTarjeta] = useState(TARJETAS_PRUEBA.debito.numero);
  const [expiracion, setExpiracion] = useState(TARJETAS_PRUEBA.debito.expiracion);
  const [cvv, setCvv] = useState(TARJETAS_PRUEBA.debito.cvv);
  const [tipoMedio, setTipoMedio] = useState("debito");

  // Estados de simulación para la demostración
  const [procesando, setProcesando] = useState(false);
  const [errorRechazo, setErrorRechazo] = useState(null);

  // Formato del número de tarjeta agrupado cada 4 dígitos
  const handleCambioTarjeta = (valor) => {
    const soloNumeros = valor.replace(/\D/g, "").slice(0, 16);
    const agrupado = soloNumeros.replace(/(\d{4})/g, "$1 ").trim();
    setNumeroTarjeta(agrupado || valor);
  };

  // Cargar preset de prueba
  const handleCargarPreset = (clave) => {
    const preset = TARJETAS_PRUEBA[clave];
    if (!preset) return;
    setTipoMedio(preset.tipo);
    setNumeroTarjeta(preset.numero);
    setExpiracion(preset.expiracion);
    setCvv(preset.cvv);
    setErrorRechazo(null);
  };

  // Simular pago exitoso (Aprobado)
  const handleSubmitPago = (e) => {
    e.preventDefault();
    if (!pedido) return;

    setErrorRechazo(null);
    setProcesando(true);

    setTimeout(() => {
      const codigoTransaccion = `TRX-${Math.floor(100000 + Math.random() * 900000)}`;
      const codigoAutorizacion = `AUT-${Math.floor(100000 + Math.random() * 900000)}`;
      const ultimos4 = numeroTarjeta.replace(/\s/g, "").slice(-4) || "0001";

      const pedidoActualizado = actualizarEstadoPago(pedido.id, {
        email: email.trim(),
        cliente: nombreTitular.trim() || pedido.cliente,
        estadoPago: "pagado",
        subMetodoPago: `webpay_${tipoMedio}`,
        codigoTransaccion,
        codigoAutorizacion,
        tarjetaTerminacion: ultimos4,
      });

      limpiarCarrito();

      navigate("/pedido-creado", {
        state: {
          pedido:
            pedidoActualizado || {
              ...pedido,
              email: email.trim(),
              cliente: nombreTitular.trim() || pedido.cliente,
              estadoPago: "pagado",
              subMetodoPago: `webpay_${tipoMedio}`,
              codigoTransaccion,
              codigoAutorizacion,
              tarjetaTerminacion: ultimos4,
            },
        },
      });
    }, 1400);
  };

  // Simular rechazo bancario de demostración
  const handleSimularRechazo = () => {
    setProcesando(true);
    setErrorRechazo(null);

    setTimeout(() => {
      setProcesando(false);
      setErrorRechazo({
        codigo: "-1",
        mensaje: "Transacción rechazada por el banco emisor. No se realizó ningún cobro a su tarjeta.",
      });
    }, 1000);
  };

  if (!pedido) {
    return (
      <div className="checkout-pagina-contenedor">
        <div className="checkout-sin-pedido">
          <h2>No se encontró un pedido pendiente de pago</h2>
          <p>Por favor regresa a la tienda para seleccionar tus productos.</p>
          <button
            type="button"
            className="checkout-btn-pay"
            onClick={() => navigate("/productos")}
            style={{ maxWidth: "260px", margin: "16px auto 0" }}
          >
            Ir al Catálogo de Productos
          </button>
        </div>
      </div>
    );
  }

  // Resumen del producto principal o detalle
  const tituloProducto = pedido.items && pedido.items.length > 0
    ? pedido.items[0].producto?.nombre || "Cilindro de Gas Licuado"
    : pedido.detalle || "Cilindro de Gas Licuado";

  const descripcionPedido = pedido.direccion
    ? `Distribuidora de Gas El Volcán Ltda. Entrega en ${pedido.direccion}.`
    : "Distribuidora de Gas El Volcán Ltda. Entrega a domicilio.";

  return (
    <div className="checkout-pagina-contenedor">
      {/* Botón superior sutil para volver */}
      <div className="checkout-top-nav">
        <button
          type="button"
          className="checkout-back-btn"
          onClick={() => navigate("/creacion-pedido")}
        >
          ← Volver y modificar pedido
        </button>
        <span className="checkout-top-tag">Distribuidora de Gas El Volcán</span>
      </div>

      <div className="checkout-envoltorio-principal">
        {/* ========================================================
            COLUMNA IZQUIERDA: FORMULARIO DE INFORMACIÓN DE PAGO
            ======================================================== */}
        <section className="checkout-columna-formulario">
          <h1 className="checkout-titulo">Payment Information</h1>

          {errorRechazo && (
            <div className="checkout-alerta-rechazo">
              <strong>Transacción Rechazada (Código {errorRechazo.codigo})</strong>
              <p>{errorRechazo.mensaje}</p>
              <button
                type="button"
                className="checkout-reintentar-btn"
                onClick={() => setErrorRechazo(null)}
              >
                Reintentar pago
              </button>
            </div>
          )}

          <form onSubmit={handleSubmitPago} className="checkout-form">
            {/* Campo 1: Email (requerido para el comprobante del cliente) */}
            <div className="checkout-form-group">
              <label htmlFor="checkout-email" className="checkout-label">
                Email
              </label>
              <div className="checkout-input-email-wrapper">
                <svg
                  className="checkout-email-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="checkout-email"
                  type="email"
                  className="checkout-input checkout-input-with-icon"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@correo.cl"
                  required
                />
              </div>
            </div>

            {/* Campo 2: Nombre del Titular (requerido para el comprobante) */}
            <div className="checkout-form-group">
              <label htmlFor="checkout-titular" className="checkout-label">
                Cardholder name
              </label>
              <input
                id="checkout-titular"
                type="text"
                className="checkout-input"
                value={nombreTitular}
                onChange={(e) => setNombreTitular(e.target.value.toUpperCase())}
                placeholder="Nombre y Apellido del Titular"
                required
              />
            </div>

            {/* Campo 3: Número de tarjeta con sellos de marcas (Visa, Mastercard, Amex, Redcompra) */}
            <div className="checkout-form-group">
              <label htmlFor="checkout-card-number" className="checkout-label">
                Card number
              </label>
              <div className="checkout-card-input-wrapper">
                <input
                  id="checkout-card-number"
                  type="text"
                  className="checkout-input checkout-input-card"
                  value={numeroTarjeta}
                  onChange={(e) => handleCambioTarjeta(e.target.value)}
                  placeholder="1234 1234 1234 1234"
                  maxLength={19}
                  required
                />
                <div className="checkout-card-badges">
                  <span className="badge-card badge-visa">VISA</span>
                  <span className="badge-card badge-mc">MC</span>
                  <span className="badge-card badge-amex">AMEX</span>
                  <span className="badge-card badge-redcompra">REDCOMPRA</span>
                </div>
              </div>
            </div>

            {/* Campo 4: Expiration & CVC en fila de 2 columnas */}
            <div className="checkout-row-dos-col">
              <div className="checkout-form-group">
                <label htmlFor="checkout-exp" className="checkout-label">
                  Expiration
                </label>
                <input
                  id="checkout-exp"
                  type="text"
                  className="checkout-input"
                  value={expiracion}
                  onChange={(e) => setExpiracion(e.target.value)}
                  placeholder="MM / YY"
                  maxLength={5}
                  required
                />
              </div>

              <div className="checkout-form-group">
                <label htmlFor="checkout-cvc" className="checkout-label">
                  CVC
                </label>
                <div className="checkout-cvc-wrapper">
                  <input
                    id="checkout-cvc"
                    type="password"
                    className="checkout-input"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="CVC"
                    maxLength={4}
                    required
                  />
                  <span className="checkout-cvc-hint">123</span>
                </div>
              </div>
            </div>

            {/* Botón Principal Verde Azulado (Teal) tal como en la imagen de referencia */}
            <button
              type="submit"
              className="checkout-btn-pay"
              disabled={procesando}
            >
              {procesando ? (
                <span className="checkout-btn-loading">
                  <span className="checkout-mini-spinner"></span>
                  Procesando pago seguro...
                </span>
              ) : (
                `Pay ${formatearPesos(pedido.total)}`
              )}
            </button>

            {/* Nota de Seguridad con Candado debajo del botón */}
            <div className="checkout-security-notice">
              <svg
                className="checkout-lock-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Payment secured by Webpay Plus</span>
            </div>

            {/* Selector de Simulación de Demostración discreto */}
            <div className="checkout-demo-controls">
              <span className="checkout-demo-title">Datos de prueba (Sandbox):</span>
              <div className="checkout-demo-btns-row">
                <button
                  type="button"
                  className="checkout-demo-btn"
                  onClick={() => handleCargarPreset("debito")}
                >
                  Tarjeta Débito
                </button>
                <button
                  type="button"
                  className="checkout-demo-btn"
                  onClick={() => handleCargarPreset("credito")}
                >
                  Tarjeta Crédito
                </button>
                <button
                  type="button"
                  className="checkout-demo-btn checkout-demo-btn-fail"
                  onClick={handleSimularRechazo}
                  disabled={procesando}
                >
                  Simular Fallo
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ========================================================
            COLUMNA DERECHA: TARJETA DE RESUMEN DEL PEDIDO / TOTAL
            ======================================================== */}
        <aside className="checkout-columna-resumen">
          <div className="checkout-card-resumen">
            <div className="checkout-item-header">
              <h2 className="checkout-item-title">{tituloProducto}</h2>
              <p className="checkout-item-desc">{descripcionPedido}</p>
              <div className="checkout-item-price">
                {formatearPesos(pedido.total)}
              </div>
            </div>

            <div className="checkout-divider"></div>

            <div className="checkout-total-row">
              <span className="checkout-total-label">Total</span>
              <span className="checkout-total-amount">
                {formatearPesos(pedido.total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
