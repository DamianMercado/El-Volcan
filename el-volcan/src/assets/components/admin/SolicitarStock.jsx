import { useState } from "react";

// Formulario para pedir más stock al proveedor + lista de solicitudes.
// codigo / onCambiarCodigo: el producto elegido lo controla la página,
// así el botón "Solicitar" de la tabla de stock puede rellenarlo.
export function SolicitarStock({
  productos,
  solicitudes,
  codigo,
  onCambiarCodigo,
  onSolicitar,
  onRecibir,
}) {
  const [cantidad, setCantidad] = useState("");
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");

  const producto = productos.find((p) => p.codigo === codigo);
  const sugerido = producto ? Math.max(producto.minimo * 2 - producto.stock, 0) : 0;

  function enviar(evento) {
    evento.preventDefault(); // evita que la página se recargue

    const numero = Number(cantidad);
    if (!producto) {
      setError("Elige un producto.");
      return;
    }
    if (!Number.isInteger(numero) || numero <= 0) {
      setError("La cantidad debe ser un número entero mayor que 0.");
      return;
    }

    onSolicitar(codigo, numero, nota.trim());
    setCantidad("");
    setNota("");
    setError("");
  }

  const nombreDe = (cod) => productos.find((p) => p.codigo === cod)?.nombre ?? cod;

  return (
    <div className="admin-solicitar">
      <form className="admin-form" onSubmit={enviar}>
        <label>
          Producto
          <select value={codigo} onChange={(e) => onCambiarCodigo(e.target.value)}>
            <option value="">Selecciona un producto…</option>
            {productos.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.codigo} · {p.nombre}
              </option>
            ))}
          </select>
        </label>

        {producto && (
          <p className="admin-ayuda">
            Stock actual: <strong>{producto.stock}</strong> · Mínimo: {producto.minimo}
            {sugerido > 0 && (
              <>
                {" "}· Sugerido:{" "}
                <button type="button" className="admin-link" onClick={() => setCantidad(String(sugerido))}>
                  {sugerido} unidades
                </button>
              </>
            )}
          </p>
        )}

        <label>
          Cantidad
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            placeholder="Ej: 50"
          />
        </label>

        <label>
          Observación (opcional)
          <input
            type="text"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Ej: entrega urgente"
          />
        </label>

        {error && <p className="admin-error">{error}</p>}

        <button type="submit" className="admin-btn">Enviar solicitud</button>
      </form>

      <div className="admin-solicitudes">
        <h3>Solicitudes realizadas</h3>
        {solicitudes.length === 0 && <p className="vacio">Aún no hay solicitudes.</p>}
        {solicitudes.map((s) => (
          <div className="admin-solicitud" key={s.id}>
            <div>
              <strong>
                {s.cantidad} × {nombreDe(s.codigo)}
              </strong>
              <small>
                {s.fecha}
                {s.nota && ` · ${s.nota}`}
              </small>
            </div>
            {s.estado === "Pendiente" ? (
              <button className="admin-btn secundario" onClick={() => onRecibir(s.id)}>
                Marcar recibida
              </button>
            ) : (
              <span className="admin-etiqueta stock-ok">Recibida</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
