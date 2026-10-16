export function PedidoTicket({ pedido, onEntregar }) {
  const enHistorial = !onEntregar;

  let clases = "pedido";
  if (enHistorial) clases += " historial";
  else if (pedido.entregado) clases += " entregado";

  return (
    <div className={clases}>
      <h3>Pedido #{pedido.id}</h3>
      <p>Cliente: {pedido.cliente}</p>
      <p>Direccion: {pedido.direccion}</p>
      <p>Teléfono: {pedido.telefono}</p>
      <p>Cantidad de cilindros: {pedido.cantidad}</p>

      {enHistorial && <p className="fecha">Entregado el {pedido.fecha}</p>}

      <span className={pedido.entregado ? "estado entregado" : "estado"}>
        {pedido.entregado ? "Entregado" : "Pendiente"}
      </span>

      {!enHistorial && (
        <>
          <br />
          <button
            className="btn-entregar"
            disabled={pedido.entregado}
            onClick={() => onEntregar(pedido)}
          >
            {pedido.entregado ? "Entregado" : "Marcar como entregado"}
          </button>
        </>
      )}
    </div>
  );
}