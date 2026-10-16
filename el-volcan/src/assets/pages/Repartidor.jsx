import { useState } from "react";
import "./repartidorstyle.css";
import { PedidoTicket } from "../components/PedidoTicket";
import { repartidor, pedidosDeHoy, historialEjemplo } from "../data/pedidos";
import { historial } from "../../data/pedidos";


export function Repartidor() {

    const [pedido, setPedidos] = useState(pedidosDeHoy);
    const [historial, setHistorial] = useState(historialEjemplo);
    const [visualViewport, setVista] = useState("pendientes");
    const [destino, setDestino] = useState(null);

  function marcarEntregado(pedido) {
    setPedidos((anteriores) =>anteriores.map((p) => (p.id === pedido.id ? { ...p, entregado: true } : p))
    );

    if (destino && destino.id === pedido.id) {
        setDestino(null);
    }

    const hoy = new Date().toLocaleDateString("es-CL");
    setHistorial((anteriores) => [{...pedido, entregado: true, fecha: hoy}, ...anteriores]);
  }
   
  const esHistorial = vista === "historal";

return (
    <>
      <h2>Mapa de entregas</h2>
      <p className="ayuda-mapa">
        Selecciona un punto rojo para ver la ruta más corta desde tu ubicación.
      </p>

      <MapaEntregas
        pedidos={pedidos}
        repartidor={repartidor}
        destino={destino}
        onSeleccionar={setDestino}
      />

      <div className="tabs">
        <button
          className={esHistorial ? "tab-btn" : "tab-btn active"}
          onClick={() => setVista("pendientes")}
        >
          Entregas de hoy
        </button>
        <button
          className={esHistorial ? "tab-btn active" : "tab-btn"}
          onClick={() => setVista("historial")}
        >
          Historial de entregas
        </button>
      </div>

      <section id="vista-pendientes" hidden={esHistorial}>
        <h2>Entregas pendientes de hoy</h2>
        {pedidos.map((pedido) => (
          <PedidoCard key={pedido.id} pedido={pedido} onEntregar={marcarEntregado} />
        ))}
      </section>

      <section id="vista-historial" hidden={!esHistorial}>
        <h2>Historial de entregas</h2>
        {historial.map((pedido, i) => (
          <PedidoCard key={`${pedido.id}-${i}`} pedido={pedido} />
        ))}
      </section>
    </>
  );
}