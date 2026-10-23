import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCarrito } from "../../../contexts/Carrito.jsx";
import { obtenerSesion } from "../../data/sesion.js";
import { crearNuevoPedido } from "../../data/pedidos.js";
import {
  formatearPesos,
  formatearTelefono,
  TELEFONO_REGEX,
} from "../../data/utilidades.js";
import "../../css/pedido.css";

export function CreacionPedido() {
  const navigate = useNavigate();
  const {
    carrito,
    aumentarCantidad,
    disminuirCantidad,
    eliminarDelCarrito,
    limpiarCarrito,
    total,
  } = useCarrito();

  const usuario = obtenerSesion();

  // Estados de datos del cliente
  const [nombreCliente, setNombreCliente] = useState(
    usuario ? `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim() : ""
  );
  const [telefonoCliente, setTelefonoCliente] = useState(
    formatearTelefono(usuario?.telefono || "")
  );

  // Estados de dirección de entrega
  const [direccion1, setDireccion1] = useState(usuario?.direccion || "");
  const [direccion2, setDireccion2] = useState(usuario?.depto || "");
  const [comuna, setComuna] = useState(usuario?.comuna || "Puente Alto");
  const [observacion, setObservacion] = useState("");

  const [usarDirCuenta, setUsarDirCuenta] = useState(() => Boolean(usuario?.direccion));
  const [metodoPago, setMetodoPago] = useState("");
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

    // Resolver datos del cliente y dirección
    let nombreFinal = nombreCliente.trim();
    let telefonoFinal = telefonoCliente.trim();
    const rutFinal = usuario?.rut || "";
    const emailFinal = usuario?.email || "";
    let direccionFinal;

    if (usarDirCuenta && usuario?.direccion) {
      nombreFinal = `${usuario.nombres || ""} ${usuario.apellidos || ""}`.trim() || "Cliente El Volcán";
      telefonoFinal = usuario.telefono || telefonoCliente.trim() || "+569 xxxx xxx";
      direccionFinal = `${usuario.direccion}${usuario.depto ? `, Depto ${usuario.depto}` : ""}, ${usuario.comuna || "Santiago"}`;
    } else {
      if (!nombreFinal) {
        setAlerta({
          mensaje: "Por favor, ingresa el nombre de la persona que recibe el pedido.",
          tipo: "error",
        });
        return;
      }
      if (!telefonoFinal) {
        setAlerta({
          mensaje: "Por favor, ingresa un teléfono de contacto para que el repartidor pueda coordinar la entrega.",
          tipo: "error",
        });
        return;
      }
      if (!TELEFONO_REGEX.test(telefonoFinal)) {
        setAlerta({
          mensaje: "Por favor, ingresa un teléfono válido. Ej: +569 xxxx xxxx",
          tipo: "error",
        });
        return;
      }
      if (!direccion1.trim()) {
        setAlerta({
          mensaje: "Por favor, ingresa la calle y número de entrega del gas.",
          tipo: "error",
        });
        return;
      }
      if (!comuna.trim()) {
        setAlerta({
          mensaje: "Por favor, ingresa la comuna de entrega.",
          tipo: "error",
        });
        return;
      }

      direccionFinal = `${direccion1.trim()}${direccion2.trim() ? `, Depto ${direccion2.trim()}` : ""}, ${comuna.trim()}`;
    }

    // FLUJO 1: PAGAR AHORA (En línea)

    if (metodoPago === "pagar_ahora") {
      const nuevoPedido = crearNuevoPedido({
        cliente: nombreFinal,
        telefono: telefonoFinal,
        rut: rutFinal,
        email: emailFinal,
        direccion: direccionFinal,
        direccionDetalle: {
          direccion1: usarDirCuenta ? (usuario?.direccion || "") : direccion1.trim(),
          direccion2: usarDirCuenta ? (usuario?.depto || "") : direccion2.trim(),
          comuna: usarDirCuenta ? (usuario?.comuna || "") : comuna.trim(),
          observacion: observacion.trim(),
        },
        items: carrito.map((item) => ({
          producto: item.producto,
          cantidad: item.cantidad,
          subtotal: item.producto.precio * item.cantidad,
        })),
        total,
        metodoPago: "pagar_ahora",
        subMetodoPago: "webpay",
        montoPaga: total,
        vuelto: 0,
        desgloseVuelto: null,
        estadoPago: "pendiente",
      });

      navigate("/pago", {
        state: { pedido: nuevoPedido },
      });
      return;
    }

    // FLUJO 2: PAGO AL REPARTIDOR (Efectivo o Tarjeta POS)
    if (metodoPago === "efectivo") {
      const nuevoPedido = crearNuevoPedido({
        cliente: nombreFinal,
        telefono: telefonoFinal,
        rut: rutFinal,
        email: emailFinal,
        direccion: direccionFinal,
        direccionDetalle: {
          direccion1: usarDirCuenta ? (usuario?.direccion || "") : direccion1.trim(),
          direccion2: usarDirCuenta ? (usuario?.depto || "") : direccion2.trim(),
          comuna: usarDirCuenta ? (usuario?.comuna || "") : comuna.trim(),
          observacion: observacion.trim(),
        },
        items: carrito.map((item) => ({
          producto: item.producto,
          cantidad: item.cantidad,
          subtotal: item.producto.precio * item.cantidad,
        })),
        total,
        metodoPago: "repartidor",
        subMetodoPago: "efectivo",
        montoPaga: total,
        vuelto: 0,
        desgloseVuelto: null,
        estadoPago: "pendiente",
      });

      limpiarCarrito();

      navigate("/pedido-creado", {
        state: { pedido: nuevoPedido },
      });
      return;
    }
  };

  return (
    <main className="pedido-container">
      <div className="pedido-card">
        {/* Cabecera */}
        <div className="pedido-header">
          <h1>Crear Pedido de Gas</h1>
          <p>Revisa tus productos y selecciona el flujo de entrega y pago</p>
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
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#ffffff",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "2px",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={item.producto.imagen}
                          alt={item.producto.nombre}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </div>
                    )}

                    <div className="pedido-item-info">
                      <strong className="pedido-item-nombre">
                        {item.producto.nombre}
                      </strong>
                      <span className="pedido-item-precio">
                        {formatearPesos(item.producto.precio * item.cantidad)}
                      </span>
                    </div>

                    <div className="pedido-item-controls">
                      <div className="qty-controls">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => disminuirCantidad(item.producto.codigo)}
                          title="Disminuir"
                        >
                          -
                        </button>
                        <span className="qty-amount">{item.cantidad}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => aumentarCantidad(item.producto.codigo)}
                          title="Aumentar"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => eliminarDelCarrito(item.producto.codigo)}
                        title="Quitar"
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
                  {formatearPesos(total)}
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
              Datos de Despacho y Contacto
            </h2>

            <form onSubmit={handleCrearPedido} className="login-form">
              {/* Opción Dirección Registrada */}
              {usuario && usuario.direccion ? (
                <div className="cuenta-direccion-tarjeta">
                  <div className="cuenta-direccion-header">
                    <input
                      type="checkbox"
                      id="usar-dir"
                      checked={usarDirCuenta}
                      onChange={(e) => setUsarDirCuenta(e.target.checked)}
                      className="cuenta-direccion-checkbox"
                    />
                    <label
                      htmlFor="usar-dir"
                      className="cuenta-direccion-label"
                    >
                      Usar mi dirección registrada de cuenta
                    </label>
                  </div>

                  {usarDirCuenta && (
                    <div className="cuenta-datos-panel">
                      <div className="cuenta-datos-grid">
                        <div className="cuenta-dato-item">
                          <span className="cuenta-dato-titulo">Cliente</span>
                          <span className="cuenta-dato-texto">
                            {usuario.nombres} {usuario.apellidos || ""}
                          </span>
                        </div>
                        <div className="cuenta-dato-item">
                          <span className="cuenta-dato-titulo">Teléfono</span>
                          <span className="cuenta-dato-texto">
                            {usuario.telefono || "No especificado"}
                          </span>
                        </div>
                        {usuario.rut && (
                          <div className="cuenta-dato-item">
                            <span className="cuenta-dato-titulo">RUT</span>
                            <span className="cuenta-dato-texto">{usuario.rut}</span>
                          </div>
                        )}
                        {usuario.email && (
                          <div className="cuenta-dato-item">
                            <span className="cuenta-dato-titulo">Correo Electrónico</span>
                            <span className="cuenta-dato-texto">{usuario.email}</span>
                          </div>
                        )}
                        <div className="cuenta-dato-item full">
                          <span className="cuenta-dato-titulo">Dirección de Entrega</span>
                          <span className="cuenta-dato-texto destacado">
                            {usuario.direccion}
                            {usuario.depto ? `, Depto/Block ${usuario.depto}` : ""}, {usuario.comuna || "Santiago"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="cuenta-aviso-invitado">
                  ¿Tienes cuenta?{" "}
                  <Link
                    to="/login"
                    className="cuenta-aviso-link"
                  >
                    Inicia sesión aquí
                  </Link>{" "}
                  para autocompletar tu dirección. O ingresa tus datos a continuación:
                </div>
              )}

              {/* Formulario de Dirección Manual (cuando no usa la de la cuenta) */}
              {(!usarDirCuenta || !usuario?.direccion) && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    paddingTop: "4px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="nombre-cliente">Nombre y Apellido</label>
                      <input
                        type="text"
                        id="nombre-cliente"
                        placeholder="Ej: Juan Pérez"
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="telefono-cliente">Teléfono de Contacto</label>
                      <input
                        type="tel"
                        id="telefono-cliente"
                        placeholder="+569 9999 9999"
                        inputMode="numeric"
                        maxLength={14}
                        value={telefonoCliente}
                        onChange={(e) => setTelefonoCliente(formatearTelefono(e.target.value))}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="direccion-1">Calle y Número de Entrega</label>
                    <input
                      type="text"
                      id="direccion-1"
                      placeholder="Ej: Av. Concha y Toro 1420"
                      value={direccion1}
                      onChange={(e) => setDireccion1(e.target.value)}
                      required
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="direccion-2">Depto / Block (Opcional)</label>
                      <input
                        type="text"
                        id="direccion-2"
                        placeholder="Ej: Depto 302, Torre B"
                        value={direccion2}
                        onChange={(e) => setDireccion2(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="comuna-despacho">Comuna / Ciudad</label>
                      <input
                        type="text"
                        id="comuna-despacho"
                        placeholder="Ej: Puente Alto, La Florida"
                        value={comuna}
                        onChange={(e) => setComuna(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Observación para el repartidor (disponible siempre) */}
              <div className="form-group" style={{ marginTop: "10px" }}>
                <label htmlFor="observacion-pedido">
                  Indicaciones para el repartidor (Opcional)
                </label>
                <input
                  type="text"
                  id="observacion-pedido"
                  placeholder="Ej: Portón negro, tocar timbre blanco, dejar en conserjería"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                />
              </div>

              {/* Selector de Pago */}
              <div style={{ marginTop: "18px" }}>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "rgba(255, 255, 255, 0.95)",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  Elige cómo deseas pagar:
                </label>
                <div className="payment-methods-grid">
                  <label
                    className={
                      "payment-radio-label" +
                      (metodoPago === "efectivo" ? " selected" : "")
                    }
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value="efectivo"
                      checked={metodoPago === "efectivo"}
                      onChange={() => setMetodoPago("efectivo")}
                    />
                    <div>
                      <strong>Pago al Repartidor</strong>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.74rem",
                          color: "rgba(255, 255, 255, 0.7)",
                          marginTop: "2px",
                        }}
                      >
                        Pagas en efectivo o tarjeta al recibir tus cilindros
                      </span>
                    </div>
                  </label>

                  <label
                    className={
                      "payment-radio-label" +
                      (metodoPago === "pagar_ahora" ? " selected" : "")
                    }
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value="pagar_ahora"
                      checked={metodoPago === "pagar_ahora"}
                      onChange={() => setMetodoPago("pagar_ahora")}
                    />
                    <div>
                      <strong>Pagar Ahora (En Línea)</strong>
                      <span
                        style={{
                          display: "block",
                          fontSize: "0.74rem",
                          color: "rgba(255, 255, 255, 0.7)",
                          marginTop: "2px",
                        }}
                      >
                        Pagas con Webpay, Débito o Crédito sin contacto
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-confirmar-pedido">
                {"Confirmar y Crear Pedido (" + formatearPesos(total) + ")"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
