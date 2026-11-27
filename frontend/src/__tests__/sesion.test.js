import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  guardarSesion,
  obtenerSesion,
  cerrarSesion,
  rutaSegunRol,
  estaTokenExpirado,
  tokenProximoAExpirar,
} from "../utils/token.js";
import {
  IniciarSesion,
  RenovarTokenServicio,
  CerrarSesionBackend,
} from "../service/sesionService.js";

const construirJwtPrueba = (payload) => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.firma-prueba`;
};

describe("Pruebas Unitarias - Lógica de Negocio: Autenticación y Sesiones con Backend", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
    expect(sesionRecuperada.contraseña).toBeUndefined();
  });

  it("9. cerrarSesion elimina la sesión activa y obtenerSesion retorna null", () => {
    guardarSesion({ nombres: "Pedro", email: "pedro@correo.cl" });
    expect(obtenerSesion()).not.toBeNull();

    cerrarSesion();
    expect(obtenerSesion()).toBeNull();
  });

  it("10. IniciarSesion autentica contra ms-auth y rechaza credenciales erróneas", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          idUsuario: 1,
          nombreUsuario: "Andrea Muñoz",
          email: "admin@el-volcan.com",
          rol: "ADMIN",
          token: "jwt-token-real-backend",
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          mensaje: "Correo o contraseña incorrectos",
        }),
      });

    const autenticado = await IniciarSesion({
      email: "admin@el-volcan.com",
      password: "admin123",
    });
    expect(autenticado.token).toBe("jwt-token-real-backend");
    expect(autenticado.usuario.email).toBe("admin@el-volcan.com");

    await expect(
      IniciarSesion({
        email: "admin@el-volcan.com",
        password: "clave_incorrecta_999",
      })
    ).rejects.toThrow("Correo o contraseña incorrectos");
  });

  it("11. rutaSegunRol redirecciona al administrador a /administradora y a clientes al inicio", () => {
    expect(rutaSegunRol("admin")).toBe("/administradora");
    expect(rutaSegunRol("ADMIN")).toBe("/administradora");
    expect(rutaSegunRol("repartidor")).toBe("/repartidor");
    expect(rutaSegunRol("cliente")).toBe("/");
    expect(rutaSegunRol(null)).toBe("/");
  });

  it("12. estaTokenExpirado y tokenProximoAExpirar detectan correctamente expiración de JWT", () => {
    const ahoraSeg = Math.floor(Date.now() / 1000);
    const jwtExpirado = construirJwtPrueba({
      email: "cliente@el-volcan.com",
      rol: "CLIENTE",
      exp: ahoraSeg - 60,
    });
    const jwtPorExpirar = construirJwtPrueba({
      email: "cliente@el-volcan.com",
      rol: "CLIENTE",
      exp: ahoraSeg + 300,
    });
    const jwtVigente = construirJwtPrueba({
      email: "cliente@el-volcan.com",
      rol: "CLIENTE",
      exp: ahoraSeg + 7200,
    });

    expect(estaTokenExpirado(jwtExpirado)).toBe(true);
    expect(estaTokenExpirado(jwtVigente)).toBe(false);
    expect(tokenProximoAExpirar(jwtPorExpirar)).toBe(true);
    expect(tokenProximoAExpirar(jwtVigente)).toBe(false);
  });

  it("13. RenovarTokenServicio invoca POST /api/v1/auth/refresh y retorna el token rotado", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        idUsuario: 1,
        email: "admin@el-volcan.com",
        rol: "ADMIN",
        token: "nuevo-jwt-rotado",
      }),
    });

    const resultado = await RenovarTokenServicio("jwt-anterior");
    expect(resultado.token).toBe("nuevo-jwt-rotado");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/refresh"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-anterior",
        }),
      })
    );
  });

  it("14. CerrarSesionBackend revoca el token llamando a POST /api/v1/auth/logout", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ estado: "CERRADA" }),
    });

    await CerrarSesionBackend("jwt-activo");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/auth/logout"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer jwt-activo",
        }),
      })
    );
  });
});
