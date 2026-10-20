import { useRef, useState } from "react";
import "../../css/administradora.css";
import { TarjetasResumen } from "../admin/TarjetasResumen";
import { TablaStock } from "../admin/TablaStock";
import { PedidosClientes } from "../admin/PedidosClientes";
import { Repartidores } from "../admin/Repartidores";
import { SolicitarStock } from "../admin/SolicitarStock";
import { fechaDeHoy } from "../../data/utilidades";
import {
  productosIniciales,
  pedidosClientesIniciales,
  repartidores,
  solicitudesIniciales,
} from "../../data/administracion";

export function Administradora() {
  const [productos, setProductos] = useState(productosIniciales);
  const [pedidos, setPedidos] = useState(pedidosClientesIniciales);
  const [solicitudes, setSolicitudes] = useState(solicitudesIniciales);
  const [codigoSolicitud, setCodigoSolicitud] = useState(""); 

  const formularioRef = useRef(null);


  // Botón "Solicitar" de la tabla de stock
  function elegirProducto(codigo) {
    setCodigoSolicitud(codigo);
    formularioRef.current.scrollIntoView({ behavior: "smooth" });
  }

  // Formulario "Enviar solicitud"
  function solicitarStock(codigo, cantidad, nota) {
    const nueva = {
      id: Date.now(), // número único
      codigo,
      cantidad,
      nota,
      fecha: fechaDeHoy(),
      estado: "Pendiente",
    };
    setSolicitudes((anteriores) => [nueva, ...anteriores]);
    setCodigoSolicitud("");
  }

  // Botón "Marcar recibida": suma la cantidad al stock del producto
  function recibirSolicitud(id) {
    const solicitud = solicitudes.find((s) => s.id === id);
    if (!solicitud) return;

    setSolicitudes((anteriores) =>
      anteriores.map((s) => (s.id === id ? { ...s, estado: "Recibida" } : s))
    );
    setProductos((anteriores) =>
      anteriores.map((p) =>
        p.codigo === solicitud.codigo ? { ...p, stock: p.stock + solicitud.cantidad } : p
      )
    );
  }

  // Selector "Asignar…" de un pedido pendiente
  function asignarRepartidor(idPedido, nombreRepartidor) {
    setPedidos((anteriores) =>
      anteriores.map((p) =>
        p.id === idPedido ? { ...p, repartidor: nombreRepartidor, estado: "En ruta" } : p
      )
    );
  }

  return (
    <div className="admin">
      <h2>Panel de administración</h2>
      <p className="admin-subtitulo">Resumen del día · {fechaDeHoy()}</p>

      <TarjetasResumen productos={productos} pedidos={pedidos} solicitudes={solicitudes} />

      <section className="admin-seccion">
        <h3>Resumen de stock</h3>
        <TablaStock productos={productos} solicitudes={solicitudes} onSolicitar={elegirProducto} />
      </section>

      <section className="admin-seccion">
        <h3>Pedidos de clientes</h3>
        <PedidosClientes pedidos={pedidos} repartidores={repartidores} onAsignar={asignarRepartidor} />
      </section>

      <section className="admin-seccion">
        <h3>Repartidores</h3>
        <Repartidores repartidores={repartidores} pedidos={pedidos} />
      </section>

      <section className="admin-seccion" ref={formularioRef}>
        <h3>Solicitar más stock</h3>
        <SolicitarStock
          productos={productos}
          solicitudes={solicitudes}
          codigo={codigoSolicitud}
          onCambiarCodigo={setCodigoSolicitud}
          onSolicitar={solicitarStock}
          onRecibir={recibirSolicitud}
        />
      </section>
    </div>
  );
}
