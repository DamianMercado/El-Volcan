import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CarritoProvider } from "../contexts/Carrito.jsx";
import { Navbar } from "../assets/components/layouts/Navbar.jsx";
import { Productos } from "../assets/components/pages/Productos.jsx";
import { Login } from "../assets/components/pages/Login.jsx";
import { guardarSesion } from "../assets/data/sesion.js";

describe("Pruebas Unitarias - Comportamiento de Componentes y Manipulación del DOM", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("12. Navbar: Renderiza botones de invitado ('Ingresar' y 'Registrarse') cuando no hay sesión activa", () => {
    render(
      <CarritoProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </CarritoProvider>
    );

    // Debe mostrar los enlaces de acceso para invitados
    expect(screen.getAllByText("Ingresar").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Registrarse").length).toBeGreaterThan(0);
  });

  it("13. Navbar: Renderiza el nombre del cliente y botón 'Salir' cuando hay sesión, y al hacer clic cierra la sesión en el DOM", () => {
    guardarSesion({
      nombres: "Eduardo",
      apellidos: "Pérez",
      email: "eduardo@correo.cl",
      rol: "cliente",
    });

    render(
      <CarritoProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </CarritoProvider>
    );

    // Debe mostrar el nombre del cliente conectado en el DOM
    expect(screen.getByText("Eduardo Pérez")).toBeInTheDocument();

    // Debe mostrar el botón Salir y al hacer clic debe limpiar la sesión
    const btnSalir = screen.getByRole("button", { name: "Salir" });
    expect(btnSalir).toBeInTheDocument();

    fireEvent.click(btnSalir);

    // Al salir, vuelve al estado sin sesión y reaparecen los botones de ingreso
    expect(screen.queryByText("Eduardo Pérez")).not.toBeInTheDocument();
    expect(screen.getAllByText("Ingresar").length).toBeGreaterThan(0);
  });

  it("14. Productos: Renderiza el catálogo de productos con sus nombres, precios y botones para agregar al carrito", () => {
    render(
      <CarritoProvider>
        <MemoryRouter>
          <Productos />
        </MemoryRouter>
      </CarritoProvider>
    );

    // Verifica que se renderice el encabezado del catálogo
    expect(screen.getByText("Nuestros Productos")).toBeInTheDocument();

    // Verifica que existan productos cargados (ej: cilindros)
    expect(screen.getByText("Cilindro gas licuado 15 kg")).toBeInTheDocument();

    // Verifica que existan botones para agregar al carrito
    const botonesAgregar = screen.getAllByRole("button", { name: /Agregar/i });
    expect(botonesAgregar.length).toBeGreaterThan(0);
  });

  it("15. Login: Valida los campos y manipula el DOM mostrando alerta ante credenciales incorrectas", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("tu@correo.com");
    const passInput = screen.getByPlaceholderText("Contraseña");
    const submitBtn = screen.getByRole("button", { name: "Iniciar Sesión" });

    // Ingresar credenciales inválidas
    fireEvent.change(emailInput, { target: { value: "usuario_falso@correo.cl" } });
    fireEvent.change(passInput, { target: { value: "clave_erronea_123" } });
    fireEvent.click(submitBtn);

    // Debe manipular el DOM y mostrar la alerta de error
    const alertaError = await screen.findByText("Correo o contraseña incorrectos");
    expect(alertaError).toBeInTheDocument();
  });
});
