import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CarritoProvider } from "../contexts/Carrito.jsx";
import { Navbar } from "../assets/components/layouts/Navbar.jsx";
import { Footer } from "../assets/components/layouts/Footer.jsx";
import { Productos } from "../assets/components/pages/Productos.jsx";
import { Login } from "../assets/components/pages/Login.jsx";
import { RecuperarContrasena } from "../pages/RecuperarContrasena.jsx";
import { AdminProductosLista } from "../pages/AdminProductosLista.jsx";
import { AdminProductoFormulario } from "../pages/AdminProductoFormulario.jsx";
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

    expect(screen.getByText("Eduardo Pérez")).toBeInTheDocument();

    const btnSalir = screen.getByRole("button", { name: "Salir" });
    expect(btnSalir).toBeInTheDocument();

    fireEvent.click(btnSalir);

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

    expect(screen.getByText("Nuestros Productos")).toBeInTheDocument();
    expect(screen.getByText("Cilindro gas licuado 15 kg")).toBeInTheDocument();

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

    fireEvent.change(emailInput, { target: { value: "usuario_falso@correo.cl" } });
    fireEvent.change(passInput, { target: { value: "clave_erronea_123" } });
    fireEvent.click(submitBtn);

    const alertaError = await screen.findByText("Correo o contraseña incorrectos");
    expect(alertaError).toBeInTheDocument();
  });

  it("16. Footer: Muestra los textos informativos sin etiquetas de redirección href", () => {
    const { container } = render(<Footer />);
    expect(screen.getByText("Pedidos de Gas")).toBeInTheDocument();
    expect(screen.getByText("Términos y Condiciones")).toBeInTheDocument();
    expect(container.querySelectorAll("a[href]").length).toBe(0);
  });

  it("17. RecuperarContrasena: Renderiza la vista de recuperación de contraseña y enlace de retorno a Login", () => {
    render(
      <MemoryRouter>
        <RecuperarContrasena />
      </MemoryRouter>
    );

    expect(screen.getByText("Recuperar Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Restablecer Contraseña/i })).toBeInTheDocument();
    expect(screen.getByText(/Volver a Iniciar Sesión/i)).toBeInTheDocument();
  });

  it("18. AdminProductosLista (Vista 1 Admin CRUD): Lista los productos existentes y permite confirmar eliminación en línea", () => {
    render(
      <MemoryRouter>
        <AdminProductosLista />
      </MemoryRouter>
    );

    expect(screen.getByText("Gestión de Productos del Catálogo")).toBeInTheDocument();
    expect(screen.getByText("Cilindro gas licuado 15 kg")).toBeInTheDocument();

    const botonesEliminar = screen.getAllByRole("button", { name: "Eliminar" });
    expect(botonesEliminar.length).toBeGreaterThan(0);

    fireEvent.click(botonesEliminar[0]);
    expect(screen.getByText("¿Eliminar?")).toBeInTheDocument();
  });

  it("19. AdminProductoFormulario (Vista 2 Admin CRUD): Renderiza el formulario de creación de producto con vista previa", () => {
    render(
      <MemoryRouter>
        <AdminProductoFormulario />
      </MemoryRouter>
    );

    expect(screen.getByText("Crear Nuevo Producto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear producto/i })).toBeInTheDocument();
    expect(screen.getByText("Vista Previa de Tarjeta")).toBeInTheDocument();
  });
});
