import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrarUsuario } from "../../data/users.js";
import "../../css/register.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function Register() {
  const navigate = useNavigate();

  // Estados de información personal
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rut, setRut] = useState("");
  const [telefono, setTelefono] = useState("");

  // Estados de dirección de despacho
  const [direccion, setDireccion] = useState("");
  const [depto, setDepto] = useState("");
  const [comuna, setComuna] = useState("");

  // Estados de acceso y credenciales
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados de interfaz
  const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });
  const [cargando, setCargando] = useState(false);

  const mostrarAlerta = (mensaje, tipo = "error") => {
    setAlerta({ mensaje, tipo });
  };

  const limpiarAlerta = () => {
    setAlerta({ mensaje: "", tipo: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    limpiarAlerta();

    const nombreTrim = nombre.trim();
    const apellidoTrim = apellido.trim();
    const rutTrim = rut.trim();
    const telefonoTrim = telefono.trim();
    const direccionTrim = direccion.trim();
    const comunaTrim = comuna.trim();
    const emailTrim = email.trim();

    // Validar campos obligatorios
    if (
      !nombreTrim ||
      !apellidoTrim ||
      !rutTrim ||
      !telefonoTrim ||
      !direccionTrim ||
      !comunaTrim ||
      !emailTrim ||
      !password ||
      !confirmPassword
    ) {
      mostrarAlerta("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Validar formato de correo electrónico
    if (!EMAIL_REGEX.test(emailTrim)) {
      mostrarAlerta("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    // Validar longitud mínima de la contraseña
    if (password.length < MIN_PASSWORD_LENGTH) {
      mostrarAlerta(
        "La contraseña debe tener al menos " + MIN_PASSWORD_LENGTH + " caracteres."
      );
      return;
    }

    // Validar coincidencia de contraseñas
    if (password !== confirmPassword) {
      mostrarAlerta("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    const resultado = registrarUsuario({
      nombres: nombreTrim,
      apellidos: apellidoTrim,
      rut: rutTrim,
      telefono: telefonoTrim,
      direccion: direccionTrim,
      depto: depto.trim(),
      comuna: comunaTrim,
      email: emailTrim,
      contraseña: password,
      rol: "cliente",
    });

    if (!resultado.exito) {
      setCargando(false);
      mostrarAlerta(resultado.mensaje, "error");
      return;
    }

    setTimeout(() => {
      mostrarAlerta("¡Cuenta creada con éxito! Redirigiendo...", "success");

      setNombre("");
      setApellido("");
      setRut("");
      setTelefono("");
      setDireccion("");
      setDepto("");
      setComuna("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }, 1000);
  };

  return (
    <main className="contenedor-registro">
      <div className="tarjeta-registro">
        <div className="cabecera-tarjeta-registro">
          <h1>Crear Cuenta</h1>
          <p>Únete a El Volcán y pide tu gas más rápido</p>
        </div>

        <form onSubmit={handleSubmit} className="formulario-registro">
          {alerta.mensaje && (
            <div
              className={
                "caja-alerta " +
                (alerta.tipo === "error" ? "caja-alerta-error" : "caja-alerta-exito")
              }
            >
              {alerta.mensaje}
            </div>
          )}

          {/* Sección 1: Información Personal */}
          <h2 className="titulo-seccion-registro">1. Datos Personales</h2>

          <div className="fila-formulario fila-dos-columnas">
            <div className="grupo-campo-registro">
              <label htmlFor="nombre" className="etiqueta-campo-registro">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                className="entrada-campo-registro"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu Nombre"
                required
              />
            </div>

            <div className="grupo-campo-registro">
              <label htmlFor="apellido" className="etiqueta-campo-registro">
                Apellido
              </label>
              <input
                type="text"
                id="apellido"
                className="entrada-campo-registro"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Tu Apellido"
                required
              />
            </div>
          </div>

          <div className="fila-formulario fila-dos-columnas">
            <div className="grupo-campo-registro">
              <label htmlFor="rut" className="etiqueta-campo-registro">
                RUT
              </label>
              <input
                type="text"
                id="rut"
                className="entrada-campo-registro"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                placeholder="12.345.678-9"
                required
              />
            </div>

            <div className="grupo-campo-registro">
              <label htmlFor="telefono" className="etiqueta-campo-registro">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                id="telefono"
                className="entrada-campo-registro"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+56 9 1234 5678"
                required
              />
            </div>
          </div>

          {/* Sección 2: Dirección de Despacho */}
          <h2 className="titulo-seccion-registro">2. Dirección de Entrega (Gas a Domicilio)</h2>

          <div className="fila-formulario">
            <div className="grupo-campo-registro columna-direccion-principal">
              <label htmlFor="direccion" className="etiqueta-campo-registro">
                Calle y Número
              </label>
              <input
                type="text"
                id="direccion"
                className="entrada-campo-registro"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Av. Principal 1234"
                required
              />
            </div>

            <div className="grupo-campo-registro columna-direccion-secundaria">
              <label htmlFor="depto" className="etiqueta-campo-registro">
                Depto / Block (Opcional)
              </label>
              <input
                type="text"
                id="depto"
                className="entrada-campo-registro"
                value={depto}
                onChange={(e) => setDepto(e.target.value)}
                placeholder="Depto 302"
              />
            </div>
          </div>

          <div className="fila-formulario fila-ancho-completo">
            <div className="grupo-campo-registro">
              <label htmlFor="comuna" className="etiqueta-campo-registro">
                Comuna / Ciudad
              </label>
              <input
                type="text"
                id="comuna"
                className="entrada-campo-registro"
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                placeholder="Ej: Puente Alto, La Florida, Santiago..."
                required
              />
            </div>
          </div>

          {/* Sección 3: Seguridad y Acceso */}
          <h2 className="titulo-seccion-registro">3. Datos de Acceso y Seguridad</h2>

          <div className="fila-formulario fila-ancho-completo">
            <div className="grupo-campo-registro">
              <label htmlFor="email" className="etiqueta-campo-registro">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                className="entrada-campo-registro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="fila-formulario fila-dos-columnas">
            <div className="grupo-campo-registro">
              <label htmlFor="password" className="etiqueta-campo-registro">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                className="entrada-campo-registro"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="grupo-campo-registro">
              <label htmlFor="confirm-password" className="etiqueta-campo-registro">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirm-password"
                className="entrada-campo-registro"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="boton-registro-principal"
            disabled={cargando}
          >
            {cargando ? "Verificando credenciales..." : "Crear Cuenta"}
          </button>

          <div className="pie-tarjeta-registro">
            <span className="texto-iniciar-sesion">
              ¿Ya tienes una cuenta?
              <Link to="/login" className="enlace-iniciar-sesion">
                Inicia sesión aquí
              </Link>
            </span>
          </div>
        </form>
      </div>
    </main>
  );
}
