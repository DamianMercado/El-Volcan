import { estadoStock, formatearPesos } from "./utilidades";

// Tabla con el stock de cada producto.
// El botón "Solicitar" avisa a la página qué producto se eligió (onSolicitar).
export function TablaStock({ productos, solicitudes, onSolicitar }) {
  // Códigos que ya tienen una solicitud pendiente
  const yaSolicitados = solicitudes
    .filter((s) => s.estado === "Pendiente")
    .map((s) => s.codigo);

  return (
    <div className="admin-tabla-contenedor">
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Código</th>
            <th>Producto</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Mínimo</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => {
            const estado = estadoStock(producto);
            return (
              <tr key={producto.codigo}>
                <td>{producto.codigo}</td>
                <td>{producto.nombre}</td>
                <td>{formatearPesos(producto.precio)}</td>
                <td className="numero">{producto.stock}</td>
                <td className="numero">{producto.minimo}</td>
                <td>
                  <span className={`admin-etiqueta stock-${estado.toLowerCase()}`}>{estado}</span>
                  {yaSolicitados.includes(producto.codigo) && (
                    <span className="admin-etiqueta solicitado">Solicitado</span>
                  )}
                </td>
                <td>
                  <button className="admin-btn secundario" onClick={() => onSolicitar(producto.codigo)}>
                    Solicitar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
