import { useState } from "react";
import "./repartidorstyle.css";
import { PedidoTicket } from "../components/PedidoTicket";
import { repartidor, pedidosDeHoy, historialEjemplo } from "../data/pedidos";
import { MapaEntregas } from "../components/Mapa";


export function Repartidor() {

    const [pedidos, setPedidos] = useState(pedidosDeHoy);
    const [historial, setHistorial] = useState(historialEjemplo);
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

  const pendientes = pedidos.filter((p) => !p.entregado).length;

return (
    <div className="panel-repartidor">
      <div className="columna-principal">
        <section className="bloque-mapa">
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
        </section>

        <section id="vista-pendientes" className="vista">
          <h2>
            Entregas pendientes de hoy
            <span className="contador">{pendientes} de {pedidos.length}</span>
          </h2>
          <div className="lista-pedidos">
            {pedidos.map((pedido) => (
              <PedidoTicket key={pedido.id} pedido={pedido} onEntregar={marcarEntregado} />
            ))}
          </div>
        </section>
      </div>

      <aside id="vista-historial" className="columna-historial">
        <h2>
          Historial de entregas
          <span className="contador">{historial.length}</span>
        </h2>
        <div className="lista-historial">
          {historial.map((pedido, i) => (
            <PedidoTicket key={`${pedido.id}-${i}`} pedido={pedido} />
          ))}
        </div>
      </aside>
    </div>
  );
}
