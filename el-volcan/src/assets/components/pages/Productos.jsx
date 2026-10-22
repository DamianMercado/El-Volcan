import { productos } from "../../../data/productos.js";
import { useCart } from "../../../contexts/CartContext.jsx";
import "../../css/productos.css";

export function Productos() {
  const { agregarAlCarrito } = useCart();

  return (
    <main className="productos-container">
      <div className="productos-header">
        <h2>Nuestros Productos</h2>
        <p>Selecciona los cilindros y accesorios que necesitas</p>
      </div>

      <div className="productos-grid">
        {productos.map((prod) => (
          <div key={prod.codigo} className="producto-card">
            {/* Imagen del Producto */}
            <div className="producto-img-container">
              {prod.imagen ? (
                <img
                  src={prod.imagen}
                  alt={prod.nombre}
                  className="producto-img"
                  loading="lazy"
                />
              ) : (
                <div className="producto-img-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}
            </div>

            <h3 className="producto-nombre">
              {prod.nombre}
            </h3>

            <p className="producto-precio">
              {"$" + prod.precio.toLocaleString("es-CL")}
            </p>

            <p className="producto-stock">
              {"Stock disponible: " + prod.stock}
            </p>

            <button
              className="btn-agregar-carrito"
              onClick={() => agregarAlCarrito(prod)}
            >
              Agregar al Carrito
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
