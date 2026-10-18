import { useState } from "react";

// Tabla con los pedidos de los clientes.
// Se puede filtrar por estado y asignar un repartidor a los pedidos pendientes.
export function PedidosClientes({ pedidos, repartidores, onAsignar }) {
  const [filtro, setFiltro] = useState("Todos");

  const pedidosFiltrados =
    filtro === "Todos" ? pedidos : pedidos.filter((p) => p.estado === filtro);

  return (
    <>
      <div className="admin-filtro">
        <label htmlFor="filtro-estado">Mostrar:</label>
        <select id="filtro-estado" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option>Todos</option>
          <option>Pendiente</option>
          <option>En ruta</option>
          <option>Entregado</option>
        </select>
        <span>{pedidosFiltrados.length} pedidos</span>
      </div>

      <div className="admin-tabla-contenedor">
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>N°</th>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Cilindros / productos</th>
              <th>Estado</th>
              <th>Repartidor</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map((pedido) => (
              <tr key={pedido.id}>
                <td>#{pedido.id}</td>
                <td>{pedido.cliente}</td>
                <td>{pedido.direccion}</td>
                <td>{pedido.detalle}</td>
                <td>
                  <span className={`admin-etiqueta pedido-${pedido.estado.replace(" ", "-").toLowerCase()}`}>
                    {pedido.estado}
                  </span>
                </td>
                <td>
                  {pedido.repartidor ? (
                    pedido.repartidor
                  ) : (
                    <select
                      defaultValue=""
                      onChange={(e) => onAsignar(pedido.id, e.target.value)}
                      aria-label={`Asignar repartidor al pedido ${pedido.id}`}
                    >
                      <option value="" disabled>
                        Asignar…
                      </option>
                      {repartidores.map((r) => (
                        <option key={r.nombre} value={r.nombre}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
            {pedidosFiltrados.length === 0 && (
              <tr>
                <td colSpan={6} className="vacio">No hay pedidos con ese estado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
