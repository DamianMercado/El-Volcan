import { estadoStock, formatearPesos } from "../../data/utilidades";

// Fila de tarjetas con los números principales.
// No guarda nada: todo se calcula a partir de los datos que recibe.
export function TarjetasResumen({ productos, pedidos, solicitudes }) {
  const valorInventario = productos.reduce((total, p) => total + p.stock * p.precio, 0);
  const unidades = productos.reduce((total, p) => total + p.stock, 0);
  const stockBajo = productos.filter((p) => estadoStock(p) !== "OK").length;
  const porEntregar = pedidos.filter((p) => p.estado !== "Entregado").length;
  const sinAsignar = pedidos.filter((p) => p.estado === "Pendiente").length;
  const entregados = pedidos.filter((p) => p.estado === "Entregado").length;
  const enCurso = solicitudes.filter((s) => s.estado === "Pendiente").length;

  return (
    <div className="admin-resumen">
      <div className="admin-tarjeta">
        <span className="admin-tarjeta-titulo">Valor del inventario</span>
        <strong>{formatearPesos(valorInventario)}</strong>
        <small>{unidades} unidades en bodega</small>
      </div>

      <div className={stockBajo > 0 ? "admin-tarjeta alerta" : "admin-tarjeta"}>
        <span className="admin-tarjeta-titulo">Productos con stock bajo</span>
        <strong>{stockBajo}</strong>
        <small>de {productos.length} productos</small>
      </div>

      <div className="admin-tarjeta">
        <span className="admin-tarjeta-titulo">Pedidos por entregar</span>
        <strong>{porEntregar}</strong>
        <small>{sinAsignar} sin repartidor asignado</small>
      </div>

      <div className="admin-tarjeta">
        <span className="admin-tarjeta-titulo">Pedidos entregados</span>
        <strong>{entregados}</strong>
        <small>{enCurso} solicitudes de stock en curso</small>
      </div>
    </div>
  );
}
