import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { obtenerUltimoPedido } from "../../data/pedidos.js";
import { obtenerSesion } from "../../data/sesion.js";
import { formatearPesos } from "../../data/utilidades.js";
import "../../css/pedido-creado.css";

export function PedidoCreado() {
  const location = useLocation();
  const navigate = useNavigate();
  const usuario = obtenerSesion();

  // Obtener el pedido desde location.state o como fallback desde localStorage al montar
  const [pedido] = useState(() => {
    return location.state?.pedido || obtenerUltimoPedido();
  });

  // Número de recibo compuesto únicamente de dígitos numéricos
  const numeroRecibo = String(pedido?.id || "").replace(/\D/g, "") || String(pedido?.id || "1");

  const handleDescargar = () => {
    if (!pedido) return;
    const prevTitle = document.title;
    document.title = `Comprobante-${numeroRecibo}`;
    window.print();
    document.title = prevTitle;
  };

  if (!pedido) {
    return (
      <main className="contenedor-recibo-pagina">
        <div className="envoltorio-recibo-pagina">
          <div className="caja-sin-pedido">
            <h2>No se encontró ningún pedido reciente</h2>
            <p>
              Aún no has generado un pedido en esta sesión.
            </p>
            <button
              type="button"
              className="boton-accion-secundario"
              onClick={() => navigate("/productos")}
            >
              Ir al Catálogo de Productos
            </button>
          </div>
        </div>
      </main>
    );
  }

  const esPagado = pedido.estadoPago === "pagado";
  const esEfectivo = pedido.metodoPago === "repartidor" && pedido.subMetodoPago === "efectivo";
  const esTarjetaRepartidor = pedido.metodoPago === "repartidor" && pedido.subMetodoPago === "tarjeta";

  return (
    <main className="contenedor-recibo-pagina">
      <div className="envoltorio-recibo-pagina">
        {/* =========================================================
            DOCUMENTO FORMAL: RECIBO DE VENTAS Y ENTREGA
            (Estructura y diseño basada en la plantilla oficial)
            ========================================================= */}
        <article className="hoja-recibo-documento" id="documento-imprimible">
          {/* 1. Encabezado principal */}
          <div className="recibo-seccion-cabecera">
            <div className="recibo-empresa-col">
              <h1 className="recibo-titulo-documento">RECIBO DE VENTAS</h1>
              <div className="recibo-empresa-datos">
                <p className="empresa-nombre">Distribuidora de Gas El Volcán Ltda.</p>
                <p>Av. Principal 1234, Santiago</p>
                <p>Región Metropolitana, Chile</p>
                <p>Mesa Central: (02) 2800 4000</p>
                <p>contacto@el-volcan.cl</p>
              </div>
            </div>

            <div className="recibo-meta-col">
              <table className="tabla-metadatos-recibo">
                <tbody>
                  <tr>
                    <td className="meta-etiqueta">FECHA</td>
                    <td className="meta-valor">{pedido.fecha} {pedido.hora ? `· ${pedido.hora} hrs` : ""}</td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">N.° DE RECIBO</td>
                    <td className="meta-valor destacado">{numeroRecibo}</td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">N.° DE CLIENTE / RUT</td>
                    <td className="meta-valor">{pedido.rut || `CLI-${numeroRecibo}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Sección Vendedor/Repartidor y Datos de Entrega del Cliente */}
          <div className="recibo-seccion-datos-entrega">
            <div className="recibo-datos-pago-col">
              <table className="tabla-metadatos-recibo tabla-datos-pago">
                <tbody>
                  <tr>
                    <td className="meta-etiqueta">REPARTIDOR / MÓVIL</td>
                    <td className="meta-valor">{pedido.repartidor || "Por asignar en ruta"}</td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">MÉTODO DE PAGO</td>
                    <td className="meta-valor">
                      {esPagado
                        ? "Webpay Plus (Débito/Crédito en línea)"
                        : esEfectivo
                        ? "Efectivo contra entrega"
                        : "Tarjeta al repartidor (POS móvil)"}
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">ESTADO DE PAGO</td>
                    <td className="meta-valor">
                      {esPagado ? "PAGADO (Aprobado)" : "PENDIENTE DE COBRO"}
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">N.° TRANSACCIÓN / AUT</td>
                    <td className="meta-valor">
                      {pedido.codigoAutorizacion
                        ? `${pedido.codigoAutorizacion} / ${pedido.codigoTransaccion || "OK"}`
                        : "No aplica"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="recibo-cliente-col">
              <div className="recibo-bloque-cliente">
                <span className="cliente-destinatario-etiqueta">A/A: Nombre / Receptor</span>
                <p className="cliente-nombre-principal">{pedido.cliente}</p>
                <p className="cliente-direccion-linea">{pedido.direccion}</p>
                <p className="cliente-telefono-linea">Teléfono: {pedido.telefono || "No especificado"}</p>
                <p className="cliente-correo-linea">Correo: {pedido.email || "No especificado"}</p>
              </div>
            </div>
          </div>

          {/* 3. Tabla principal de artículos y productos */}
          <div className="recibo-seccion-articulos">
            <div className="recibo-tabla-scroll-wrapper">
              <table className="tabla-articulos-recibo">
                <thead>
                  <tr>
                    <th className="th-articulo">N.° DE ARTÍCULO</th>
                    <th className="th-descripcion">DESCRIPCIÓN</th>
                    <th className="th-cantidad">CANTIDAD</th>
                    <th className="th-precio">PRECIO UNITARIO</th>
                    <th className="th-total">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.items && pedido.items.length > 0 ? (
                    pedido.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="celda-codigo">{it.producto?.codigo || `ART-${idx + 1}`}</td>
                        <td className="celda-descripcion">{it.producto?.nombre || "Producto de gas"}</td>
                        <td className="celda-cantidad">{it.cantidad}</td>
                        <td className="celda-precio">{formatearPesos(it.producto?.precio || 0)}</td>
                        <td className="celda-total">
                          {formatearPesos(it.subtotal || (it.producto?.precio || 0) * it.cantidad)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="celda-codigo">EV-001</td>
                      <td className="celda-descripcion">{pedido.detalle || "Cilindro de gas"}</td>
                      <td className="celda-cantidad">1</td>
                      <td className="celda-precio">{formatearPesos(pedido.total)}</td>
                      <td className="celda-total">{formatearPesos(pedido.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Sección Observaciones / Instrucciones y Tabla de Totales */}
          <div className="recibo-seccion-totales">
            <div className="recibo-observaciones-col">
              <div className="caja-observaciones-recibo">
                <span className="observaciones-titulo">Observaciones / Instrucciones:</span>
                <div className="observaciones-contenido">
                  {pedido.direccionDetalle?.observacion ? (
                    <p>
                      <strong>Indicaciones de entrega:</strong> {pedido.direccionDetalle.observacion}
                    </p>
                  ) : (
                    <p>Sin observaciones adicionales.</p>
                  )}
                </div>
              </div>

              <div className="recibo-agradecimiento-bloque">
                <p className="agradecimiento-texto">GRACIAS POR SU PREFERENCIA</p>
                <div className="recibo-casillas-pago">
                  <span className={"casilla-item" + (esEfectivo ? " seleccionada" : "")}>
                    [{esEfectivo ? "X" : " "}] EFECTIVO
                  </span>
                  <span className={"casilla-item" + (esTarjetaRepartidor ? " seleccionada" : "")}>
                    [{esTarjetaRepartidor ? "X" : " "}] TARJETA AL REPARTIDOR (POS)
                  </span>
                  <span className={"casilla-item" + (esPagado ? " seleccionada" : "")}>
                    [{esPagado ? "X" : " "}] WEBPAY / EN LÍNEA
                  </span>
                </div>
              </div>
            </div>

            <div className="recibo-tabla-totales-col">
              <table className="tabla-totales-recibo">
                <tbody>
                  <tr>
                    <td className="totales-etiqueta">SUBTOTAL</td>
                    <td className="totales-valor">{formatearPesos(pedido.total)}</td>
                  </tr>
                  <tr>
                    <td className="totales-etiqueta">ENVÍO / MANIPULACIÓN</td>
                    <td className="totales-valor">GRATIS</td>
                  </tr>
                  <tr>
                    <td className="totales-etiqueta">IMPUESTO (IVA INCL.)</td>
                    <td className="totales-valor">INCLUIDO</td>
                  </tr>
                  <tr className="fila-total-principal">
                    <td className="totales-etiqueta">TOTAL</td>
                    <td className="totales-valor">{formatearPesos(pedido.total)}</td>
                  </tr>
                  {esEfectivo && (
                    <>
                      <tr>
                        <td className="totales-etiqueta">IMPORTE RECIBIDO</td>
                        <td className="totales-valor">{formatearPesos(pedido.montoPaga || pedido.total)}</td>
                      </tr>
                      <tr>
                        <td className="totales-etiqueta">VUELTO A ENTREGAR</td>
                        <td className="totales-valor">{formatearPesos(pedido.vuelto || 0)}</td>
                      </tr>
                    </>
                  )}
                  {esPagado && (
                    <tr>
                      <td className="totales-etiqueta">IMPORTE PAGADO</td>
                      <td className="totales-valor">{formatearPesos(pedido.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="recibo-contacto-pie">
            <p>
              Si tiene preguntas relacionadas con este recibo, comuníquese con Mesa de Ayuda: (02) 2800 4000, contacto@el-volcan.cl
            </p>
            <p className="web-destacada">www.el-volcan.cl</p>
          </div>

          {/* 5. Línea de corte para el talón */}
          <div className="linea-corte-talon">
            <span className="etiqueta-linea-corte">CORTE AQUÍ</span>
          </div>

          {/* 6. Talón de Recepción y Entrega para el Repartidor / Cliente */}
          <div className="recibo-seccion-talon">
            <div className="talon-cliente-col">
              <div className="talon-caja-header">CLIENTE / RECEPTOR</div>
              <div className="talon-cliente-info">
                <p><strong>A/A:</strong> {pedido.cliente}</p>
                <p><strong>Dirección:</strong> {pedido.direccion}</p>
                <p><strong>Teléfono:</strong> {pedido.telefono || "No especificado"}</p>
              </div>

              <div className="talon-firmas-fila">
                <div className="talon-firma-campo">
                  <div className="linea-firma"></div>
                  <span>Firma / RUT Recepción Conforme Cliente</span>
                </div>
                <div className="talon-firma-campo">
                  <div className="linea-firma"></div>
                  <span>Firma / Timbre Repartidor</span>
                </div>
              </div>
            </div>

            <div className="talon-recibo-col">
              <h2 className="talon-titulo">RECIBO DE VENTAS</h2>
              <table className="tabla-metadatos-recibo">
                <tbody>
                  <tr>
                    <td className="meta-etiqueta">FECHA</td>
                    <td className="meta-valor">{pedido.fecha}</td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">N.° DE RECIBO</td>
                    <td className="meta-valor">{numeroRecibo}</td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">IMPORTE PAGADO</td>
                    <td className="meta-valor">
                      {esPagado ? formatearPesos(pedido.total) : (esEfectivo ? formatearPesos(pedido.total) : formatearPesos(pedido.total))}
                    </td>
                  </tr>
                  <tr>
                    <td className="meta-etiqueta">ESTADO</td>
                    <td className="meta-valor">{esPagado ? "PAGADO" : "POR COBRAR"}</td>
                  </tr>
                </tbody>
              </table>

              <div className="talon-pie-datos">
                <p>Distribuidora de Gas El Volcán Ltda.</p>
                <p>Av. Principal 1234, Santiago · (02) 2800 4000</p>
                <p className="web-destacada">www.el-volcan.cl</p>
              </div>
            </div>
          </div>
        </article>

        {/* Acciones de Navegación al final del comprobante */}
        <div className="recibo-acciones-navegacion">
          <button
            type="button"
            className="boton-accion-descargar"
            onClick={handleDescargar}
          >
            Descargar Comprobante
          </button>
          <button
            type="button"
            className="boton-accion-secundario"
            onClick={() => navigate("/productos")}
          >
            Realizar Otro Pedido
          </button>
          <button
            type="button"
            className="boton-accion-secundario"
            onClick={() => navigate("/")}
          >
            Volver al Inicio
          </button>
          {usuario?.rol === "admin" && (
            <Link to="/administradora" className="boton-accion-admin">
              Ver Pedidos en Panel de Administración
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
