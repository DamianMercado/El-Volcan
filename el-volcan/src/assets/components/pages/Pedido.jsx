import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext.jsx";
import "../../css/pedido.css";

export function Pedido() {
  const navigate = useNavigate();
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    limpiarCarrito,
    total,
  } = useCart();

  const [direccion1, setDireccion1] = useState("");
  const [direccion2, setDireccion2] = useState("");
  const [observacion, setObservacion] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [usarDirCuenta, setUsarDirCuenta] = useState(true);
  const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });

  const handleCrearPedido = (e) => {
    e.preventDefault();
    if (carrito.length === 0) {
      setAlerta({
        mensaje: "No tienes productos en tu pedido. Vuelve al catálogo para agregar.",
        tipo: "error",
      });
      return;
    }

    const detallePago = metodoPago === "efectivo" ? "Efectivo contra entrega" : "Pago en línea";
    setAlerta({
      mensaje: "¡Pedido creado con éxito! Método de pago: " + detallePago + ". Total a pagar: $" + total.toLocaleString("es-CL"),
      tipo: "success",
    });

    limpiarCarrito();
    setDireccion1("");
    setDireccion2("");
    setObservacion("");
  };

  return (
    <main className="pedido-container">
      <div className="pedido-card">
        {/* Cabecera */}
        <div className="pedido-header">
          <h1>Carrito</h1>
          <p>Revisa tus productos y confirma tu pedido</p>
        </div>

        {alerta.mensaje && (
          <div
            className={
              "alert-box " +
              (alerta.tipo === "error" ? "alert-error" : "alert-success")
            }
            style={{ marginBottom: "20px" }}
          >
            {alerta.mensaje}
          </div>
        )}

        {/* Sección: Lista de Productos */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <h2 className="pedido-section-title">
            {"Detalle de Productos (" + carrito.length + ")"}
          </h2>

          {carrito.length === 0 ? (
            <div className="pedido-empty">
              <p>No hay productos en el pedido.</p>
              <button
                type="button"
                className="btn-confirmar-pedido"
                onClick={() => navigate("/productos")}
              >
                Ir al Catálogo de Productos
              </button>
            </div>
          ) : (
            <>
              <div className="pedido-items-list">
                {carrito.map((item) => (
                  <div key={item.producto.codigo} className="pedido-item">
                    {/* Miniatura del producto si está disponible */}
                    {item.producto.imagen && (
                      <div style={{
                        width: "48px",
                        height: "48px",
                        backgroundColor: "#ffffff",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "2px",
                        flexShrink: 0
                      }}>
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                        />
                      </div>
                    )}

                    <div className="pedido-item-info">
                      <strong className="pedido-item-nombre">
                        {item.producto.nombre}
                      </strong>
                      <span className="pedido-item-precio">
                        {"$" + (item.producto.precio * item.cantidad).toLocaleString("es-CL")}
                      </span>
                    </div>

                    <div className="pedido-item-controls">
                      <div className="qty-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => disminuirCantidad(item.producto.codigo)}
                        >
                          -
                        </button>
                        <span className="qty-amount">{item.cantidad}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => aumentarCantidad(item.producto.codigo)}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => eliminarDelCarrito(item.producto.codigo)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pedido-total-row">
                <span>Total a Pagar:</span>
                <strong className="pedido-total-amount">
                  {"$" + total.toLocaleString("es-CL")}
                </strong>
              </div>

              <button
                type="button"
                onClick={() => navigate("/productos")}
                className="btn-seguir-comprando"
              >
                ← Seguir agregando más productos
              </button>
            </>
          )}
        </div>

        {/* Sección: Datos de Entrega y Pago */}
        {carrito.length > 0 && (
          <div className="pedido-checkout-section">
            <h2 className="pedido-section-title">
              Datos de Entrega y Pago
            </h2>

            <form onSubmit={handleCrearPedido} className="login-form">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  id="usar-dir"
                  checked={usarDirCuenta}
                  onChange={(e) => setUsarDirCuenta(e.target.checked)}
                  style={{ accentColor: "var(--color-accent)", cursor: "pointer" }}
                />
                <label htmlFor="usar-dir" style={{ fontSize: "0.88rem", fontWeight: "500", cursor: "pointer" }}>
                  Utilizar mi dirección de cuenta
                </label>
              </div>

              {!usarDirCuenta && (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "4px" }}>
                  <div className="form-group">
                    <label htmlFor="direccion-1">Dirección 1</label>
                    <input
                      type="text"
                      id="direccion-1"
                      placeholder="Calle y número"
                      value={direccion1}
                      onChange={(e) => setDireccion1(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="direccion-2">Dirección 2 (opcional)</label>
                    <input
                      type="text"
                      id="direccion-2"
                      placeholder="Depto / block / piso"
                      value={direccion2}
                      onChange={(e) => setDireccion2(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="observacion-pedido">Observación de la dirección</label>
                    <input
                      type="text"
                      id="observacion-pedido"
                      placeholder="Ej: Cierre perimetral negro, esquina Pereira"
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Selector de Pago */}
              <div style={{ marginTop: "8px" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "rgba(255, 255, 255, 0.9)" }}>
                  Método de Pago
                </label>
                <div className="payment-methods-grid">
                  <label className={"payment-radio-label" + (metodoPago === "efectivo" ? " selected" : "")}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="efectivo"
                      checked={metodoPago === "efectivo"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <span>Efectivo</span>
                  </label>

                  <label className={"payment-radio-label" + (metodoPago === "pagar_ahora" ? " selected" : "")}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value="pagar_ahora"
                      checked={metodoPago === "pagar_ahora"}
                      onChange={(e) => setMetodoPago(e.target.value)}
                    />
                    <span>Pagar Ahora</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-confirmar-pedido">
                {"Confirmar y Crear Pedido ($" + total.toLocaleString("es-CL") + ")"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
