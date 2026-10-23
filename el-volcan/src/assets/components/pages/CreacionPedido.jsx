import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext.jsx";
import "../../css/pedido.css";

// Denominaciones oficiales en Chile
const BILLETES_CHILE = [20000, 10000, 5000, 2000, 1000];
const MONEDAS_CHILE = [500, 100, 50, 10];

// Calcula sugerencias de montos con billetes y monedas (redondeos a 500, 1.000, 2.000, 5.000, 10.000, etc.)
function obtenerSugerenciasMonto(montoTotal) {
  if (!montoTotal || montoTotal <= 0) return [5000, 10000, 20000];

  const sugerencias = new Set();

  // Redondeo al siguiente múltiplo de 500 (moneda de $500)
  if (montoTotal % 500 !== 0) {
    const sig500 = Math.ceil(montoTotal / 500) * 500;
    if (sig500 > montoTotal) sugerencias.add(sig500);
  }

  // Redondeo al siguiente múltiplo de 1.000
  if (montoTotal % 1000 !== 0) {
    const sig1000 = Math.ceil(montoTotal / 1000) * 1000;
    if (sig1000 > montoTotal) sugerencias.add(sig1000);
  }

  // Billetes estándar mayores al total
  for (const b of [1000, 2000, 5000, 10000, 20000]) {
    if (b > montoTotal) {
      sugerencias.add(b);
    }
  }

  // Para montos superiores a 20.000
  if (montoTotal >= 20000) {
    const sig10k = Math.ceil(montoTotal / 10000) * 10000;
    const sig20k = Math.ceil(montoTotal / 20000) * 20000;
    if (sig10k > montoTotal) sugerencias.add(sig10k);
    if (sig20k > montoTotal) sugerencias.add(sig20k);
    sugerencias.add((sig20k || sig10k) + 10000);
  }

  return Array.from(sugerencias)
    .filter((val) => val > montoTotal)
    .sort((a, b) => a - b)
    .slice(0, 4);
}

// Desglosa el vuelto en billetes y monedas de Chile (disponible para vista de repartidor)
export function calcularDesgloseVuelto(montoVuelto) {
  if (!montoVuelto || montoVuelto <= 0) {
    return {
      totalBilletes: 0,
      totalMonedas: 0,
      billetes: [],
      monedas: [],
    };
  }

  let restante = montoVuelto;
  const billetes = [];
  let totalBilletes = 0;

  for (const d of BILLETES_CHILE) {
    if (restante >= d) {
      const cant = Math.floor(restante / d);
      restante = restante % d;
      totalBilletes += cant * d;
      billetes.push({ denominacion: d, cantidad: cant });
    }
  }

  const monedas = [];
  let totalMonedas = 0;

  for (const d of MONEDAS_CHILE) {
    if (restante >= d) {
      const cant = Math.floor(restante / d);
      restante = restante % d;
      totalMonedas += cant * d;
      monedas.push({ denominacion: d, cantidad: cant });
    }
  }

  return {
    totalBilletes,
    totalMonedas,
    billetes,
    monedas,
  };
}

export function CreacionPedido() {
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
  const [metodoPago, setMetodoPago] = useState("");
  const [subMetodoPago, setSubMetodoPago] = useState("efectivo");
  const [montoPaga, setMontoPaga] = useState("");
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

    if (!metodoPago) {
      setAlerta({
        mensaje: "Por favor, selecciona un método de pago antes de continuar.",
        tipo: "error",
      });
      return;
    }

    if (metodoPago === "pagar_ahora") {
      navigate("/pago", {
        state: {
          total,
          carrito,
          direccion: usarDirCuenta
            ? "cuenta"
            : { direccion1, direccion2, observacion },
        },
      });
      return;
    }

    if (metodoPago === "efectivo") {
      if (!subMetodoPago) {
        setAlerta({
          mensaje: "Por favor, selecciona si pagarás en efectivo o con tarjeta al repartidor.",
          tipo: "error",
        });
        return;
      }

      if (subMetodoPago === "efectivo") {
        const montoIngresado = Number(montoPaga);
        if (!montoPaga || isNaN(montoIngresado)) {
          setAlerta({
            mensaje: "Por favor, indica con cuánto dinero (billetes y/o monedas) pagarás para calcular el vuelto del repartidor.",
            tipo: "error",
          });
          return;
        }

        if (montoIngresado < total) {
          setAlerta({
            mensaje: `El monto ingresado ($${montoIngresado.toLocaleString("es-CL")}) no puede ser menor al total del pedido ($${total.toLocaleString("es-CL")}).`,
            tipo: "error",
          });
          return;
        }
      }

      const montoFinal = subMetodoPago === "efectivo" ? Number(montoPaga) : null;
      const vuelto = montoFinal ? Math.max(0, montoFinal - total) : 0;
      const desgloseVuelto = montoFinal ? calcularDesgloseVuelto(vuelto) : null;

      limpiarCarrito();
      setDireccion1("");
      setDireccion2("");
      setObservacion("");

      navigate("/pedido-creado", {
        state: {
          pago: "pendiente",
          estadoPago: "pendiente",
          metodoPago: "efectivo",
          subMetodoPago,
          montoPaga: montoFinal,
          vuelto,
          desgloseVuelto,
          total,
          carrito,
          direccion: usarDirCuenta
            ? "cuenta"
            : { direccion1, direccion2, observacion },
        },
      });
      return;
    }
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
                      type="checkbox"
                      name="metodoPago"
                      value="efectivo"
                      checked={metodoPago === "efectivo"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMetodoPago("efectivo");
                          if (!subMetodoPago) setSubMetodoPago("efectivo");
                        } else {
                          setMetodoPago("");
                        }
                      }}
                    />
                    <span>Pago al repartidor</span>
                  </label>

                  <label className={"payment-radio-label" + (metodoPago === "pagar_ahora" ? " selected" : "")}>
                    <input
                      type="checkbox"
                      name="metodoPago"
                      value="pagar_ahora"
                      checked={metodoPago === "pagar_ahora"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setMetodoPago("pagar_ahora");
                        } else {
                          setMetodoPago("");
                        }
                      }}
                    />
                    <span>Pagar Ahora</span>
                  </label>
                </div>

                {/* Sub-opciones de Pago al Repartidor */}
                {metodoPago === "efectivo" && (
                  <div className="pago-repartidor-container">
                    <p className="pago-repartidor-titulo">Pago al repartidor (Selecciona medio de pago):</p>
                    <div className="payment-submethods-grid">
                      <label className={"payment-radio-label submethod" + (subMetodoPago === "efectivo" ? " selected" : "")}>
                        <input
                          type="checkbox"
                          name="subMetodoPago"
                          value="efectivo"
                          checked={subMetodoPago === "efectivo"}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSubMetodoPago("efectivo");
                            } else if (subMetodoPago === "efectivo") {
                              setSubMetodoPago("");
                            }
                          }}
                        />
                        <span>Efectivo</span>
                      </label>

                      <label className={"payment-radio-label submethod" + (subMetodoPago === "tarjeta" ? " selected" : "")}>
                        <input
                          type="checkbox"
                          name="subMetodoPago"
                          value="tarjeta"
                          checked={subMetodoPago === "tarjeta"}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSubMetodoPago("tarjeta");
                            } else if (subMetodoPago === "tarjeta") {
                              setSubMetodoPago("");
                            }
                          }}
                        />
                        <span>Tarjeta</span>
                      </label>
                    </div>

                    {/* Manejo de vuelto para Pago en Efectivo al Repartidor */}
                    {subMetodoPago === "efectivo" && (
                      <div className="vuelto-efectivo-container">
                        <label className="vuelto-label" htmlFor="monto-efectivo">
                          ¿Con cuánto pagarás? (Billetes y/o Monedas)
                        </label>
                        <p className="vuelto-help">
                          Indica el monto con el que pagarás para que el repartidor lleve tu vuelto preparado (incluye monedas si corresponde):
                        </p>

                        <div className="billetes-sugeridos-grid">
                          <button
                            type="button"
                            className={"btn-billete" + (montoPaga === String(total) ? " active" : "")}
                            onClick={() => setMontoPaga(String(total))}
                          >
                            {"Exacto ($" + total.toLocaleString("es-CL") + ")"}
                          </button>
                          {obtenerSugerenciasMonto(total).map((montoSugerido) => (
                            <button
                              key={montoSugerido}
                              type="button"
                              className={"btn-billete" + (montoPaga === String(montoSugerido) ? " active" : "")}
                              onClick={() => setMontoPaga(String(montoSugerido))}
                            >
                              {"$" + montoSugerido.toLocaleString("es-CL")}
                            </button>
                          ))}
                        </div>

                        <div className="form-group" style={{ marginTop: "10px" }}>
                          <label htmlFor="monto-efectivo" style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.85)" }}>
                            O escribe otro monto en efectivo ($):
                          </label>
                          <input
                            type="number"
                            id="monto-efectivo"
                            placeholder={"Ej: 3000, 5000, 10000 (mínimo $" + total.toLocaleString("es-CL") + ")"}
                            min={total}
                            step="10"
                            value={montoPaga}
                            onChange={(e) => setMontoPaga(e.target.value)}
                          />
                        </div>

                        {/* Detalle del vuelto calculado */}
                        {montoPaga !== "" && !isNaN(Number(montoPaga)) && (
                          <div className="vuelto-resumen">
                            {Number(montoPaga) < total ? (
                              <span className="vuelto-alerta-insuficiente">
                                ⚠️ El monto ingresado (${Number(montoPaga).toLocaleString("es-CL")}) es menor al total a pagar (${total.toLocaleString("es-CL")}).
                              </span>
                            ) : Number(montoPaga) === total ? (
                              <span className="vuelto-alerta-exacto">
                                ✓ Pago exacto: el repartidor no necesita llevar vuelto.
                              </span>
                            ) : (
                              <div className="vuelto-info">
                                <span>Vuelto que debe entregar el repartidor:</span>
                                <strong className="vuelto-monto">
                                  {"$" + (Number(montoPaga) - total).toLocaleString("es-CL")}
                                </strong>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
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

export { CreacionPedido as Pedido };
