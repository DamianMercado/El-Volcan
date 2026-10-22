import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("shopping_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("shopping_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.producto.codigo === product.codigo);
      if (exists) {
        if (exists.cantidad >= product.stock) {
          alert("Stock maximo disponible alcanzado (" + product.stock + " unidades)");
          return prevCart;
        }
        return prevCart.map((item) =>
          item.producto.codigo === product.codigo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevCart, { producto: product, cantidad: 1 }];
      }
    });
  };

  const increaseQuantity = (codigo) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.producto.codigo === codigo) {
          if (item.cantidad >= item.producto.stock) {
            alert("Stock maximo disponible alcanzado (" + item.producto.stock + ")");
            return item;
          }
          return { ...item, cantidad: item.cantidad + 1 };
        }
        return item;
      })
    );
  };

  const decreaseQuantity = (codigo) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.producto.codigo === codigo
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const removeFromCart = (codigo) => {
    setCart((prev) => prev.filter((item) => item.producto.codigo !== codigo));
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = cart.reduce(
    (acc, item) => acc + item.producto.precio * item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        total,
        // Alias de compatibilidad en español
        carrito: cart,
        agregarAlCarrito: addToCart,
        aumentarCantidad: increaseQuantity,
        disminuirCantidad: decreaseQuantity,
        eliminarDelCarrito: removeFromCart,
        limpiarCarrito: clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

// Alias de retrocompatibilidad
export const CarritoProvider = CartProvider;
export const useCarrito = useCart;

