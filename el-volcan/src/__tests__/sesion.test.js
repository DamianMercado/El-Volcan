import { describe, it, expect, beforeEach } from "vitest";
import { guardarSesion, obtenerSesion, cerrarSesion, rutaSegunRol } from "../assets/data/sesion.js";
import { buscarUsuarioPorCredenciales, users } from "../assets/data/users.js";

describe("Pruebas Unitarias - Lógica de Negocio: Autenticación y Sesiones", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("8. guardarSesion almacena los datos públicos en localStorage omitiendo la contraseña", () => {
    const usuarioConClave = {
      id: "u-1",
      nombres: "Ana",
      apellidos: "Gómez",
      email: "ana@correo.cl",
      rol: "cliente",
      contraseña: "ClaveSuperSecreta123",
    };

    guardarSesion(usuarioConClave);

    const sesionRecuperada = obtenerSesion();
    expect(sesionRecuperada).toBeDefined();
    expect(sesionRecuperada.email).toBe("ana@correo.cl");
    expect(sesionRecuperada.nombres).toBe("Ana");
    expect(sesionRecuperada.contraseña).toBeUndefined(); // Seguridad: la contraseña nunca se guarda en sesión
  });

  it("9. cerrarSesion elimina la sesión activa y obtenerSesion retorna null", () => {
    guardarSesion({ nombres: "Pedro", email: "pedro@correo.cl" });
    expect(obtenerSesion()).not.toBeNull();

    cerrarSesion();
    expect(obtenerSesion()).toBeNull();
  });

  it("10. buscarUsuarioPorCredenciales autentica usuarios existentes y rechaza contraseñas o emails erróneos", () => {
    const usuarioBase = users[0]; // Usuario inicial registrado (admin)

    // Autenticación exitosa
    const autenticado = buscarUsuarioPorCredenciales(usuarioBase.email, usuarioBase.contraseña);
    expect(autenticado).toBeDefined();
    expect(autenticado.email).toBe(usuarioBase.email);

    // Error por contraseña incorrecta
    const claveErronea = buscarUsuarioPorCredenciales(usuarioBase.email, "clave_incorrecta_999");
    expect(claveErronea).toBeNull();

    // Error por correo inexistente
    const correoInexistente = buscarUsuarioPorCredenciales("no_existe@volcan.cl", "cualquiera");
    expect(correoInexistente).toBeNull();
  });

  it("11. rutaSegunRol redirecciona al administrador a /administradora y a clientes al inicio", () => {
    expect(rutaSegunRol("admin")).toBe("/administradora");
    expect(rutaSegunRol("cliente")).toBe("/");
    expect(rutaSegunRol(null)).toBe("/");
  });
});
