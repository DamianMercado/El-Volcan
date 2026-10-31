/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

export const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState(() => {
    const carritoGuardado =
      localStorage.getItem("carrito_compras") ||
      localStorage.getItem("shopping_cart");
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  });

  useEffect(() => {
    localStorage.setItem("carrito_compras", JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoPrevio) => {
      const existe = carritoPrevio.find(
        (item) => item.producto.codigo === producto.codigo
      );
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          alert("Stock máximo disponible alcanzado (" + producto.stock + " unidades)");
          return carritoPrevio;
        }
        return carritoPrevio.map((item) =>
          item.producto.codigo === producto.codigo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...carritoPrevio, { producto, cantidad: 1 }];
      }
    });
  };

  const aumentarCantidad = (codigo) => {
    setCarrito((carritoPrevio) =>
      carritoPrevio.map((item) => {
        if (item.producto.codigo === codigo) {
          if (item.cantidad >= item.producto.stock) {
            alert(
              "Stock máximo disponible alcanzado (" +
                item.producto.stock +
                " unidades)"
            );
            return item;
          }
          return { ...item, cantidad: item.cantidad + 1 };
        }
        return item;
      })
    );
  };

  const disminuirCantidad = (codigo) => {
    setCarrito((carritoPrevio) =>
      carritoPrevio
        .map((item) =>
          item.producto.codigo === codigo
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (codigo) => {
    setCarrito((carritoPrevio) =>
      carritoPrevio.filter((item) => item.producto.codigo !== codigo)
    );
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const total = carrito.reduce(
    (acumulado, item) => acumulado + item.producto.precio * item.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        // Variables y funciones principales en español
        carrito,
        agregarAlCarrito,
        aumentarCantidad,
        disminuirCantidad,
        eliminarDelCarrito,
        limpiarCarrito,
        total,
        // Alias de compatibilidad
        cart: carrito,
        addToCart: agregarAlCarrito,
        increaseQuantity: aumentarCantidad,
        decreaseQuantity: disminuirCantidad,
        removeFromCart: eliminarDelCarrito,
        clearCart: limpiarCarrito,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  return useContext(CarritoContext);
}

// Alias de retrocompatibilidad
export const CartContext = CarritoContext;
export const CartProvider = CarritoProvider;
export const useCart = useCarrito;

export default CarritoProvider;

