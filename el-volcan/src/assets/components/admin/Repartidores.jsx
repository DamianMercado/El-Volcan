// Una tarjeta por repartidor con el avance de sus entregas.
// Los números se calculan contando los pedidos que tiene asignados.
export function Repartidores({ repartidores, pedidos }) {
  return (
    <div className="admin-repartidores">
      {repartidores.map((repartidor) => {
        const suyos = pedidos.filter((p) => p.repartidor === repartidor.nombre);
        const entregados = suyos.filter((p) => p.estado === "Entregado").length;
        const enRuta = suyos.length - entregados;
        const avance = suyos.length ? Math.round((entregados / suyos.length) * 100) : 0;

        return (
          <div className="admin-repartidor" key={repartidor.nombre}>
            <div className="admin-repartidor-cabecera">
              <div className="avatar">{repartidor.iniciales}</div>
              <div>
                <strong>{repartidor.nombre}</strong>
                <small>{repartidor.ruta}</small>
              </div>
            </div>

            <div className="admin-barra" aria-label={`Avance ${avance}%`}>
              <div className="admin-barra-relleno" style={{ width: `${avance}%` }}></div>
            </div>

            <p>
              {entregados} de {suyos.length} entregados · {enRuta} en ruta
            </p>
          </div>
        );
      })}
    </div>
  );
}
