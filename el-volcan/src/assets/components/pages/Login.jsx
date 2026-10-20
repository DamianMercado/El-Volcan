import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { users } from "../../data/users.js";
import { guardarSesion, rutaSegunRol } from "../../data/sesion.js";


export function Login() {
  const navigate = useNavigate(); // 2. Instanciar navigate
  // Cargar email recordado al montar el componente
  const [email, setEmail] = useState(() => localStorage.getItem("recordar_email") || "");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(() => Boolean(localStorage.getItem("recordar_email")));
  const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });

  function mostrarAlerta(mensaje, tipo = "error") {
    setAlerta({ mensaje, tipo });
  }

  function limpiarAlerta() {
    setAlerta({ mensaje: "", tipo: "" });
  }

  function verificarInicioSesion(event) {
    event.preventDefault();
    limpiarAlerta();

    const usuarioEncontrado = users.find(
      (u) => u.email === email && u.contraseña === password
    );

    if (usuarioEncontrado) {
      if (recordar) {
        localStorage.setItem("recordar_email", email);
      } else {
        localStorage.removeItem("recordar_email");
      }
      guardarSesion(usuarioEncontrado);
      mostrarAlerta(`¡Bienvenido, ${usuarioEncontrado.nombres}!`, "success");

      setTimeout(() => {
        navigate(rutaSegunRol(usuarioEncontrado.rol)); // 3. Redirigir según el rol
      }, 1500); // Redirigir después de 1.5 segundos

    } else {
      mostrarAlerta("Correo o contraseña incorrectos", "error");
    }
  }

  return (
    <main className="main-content">
      <div className="login-card">
        <div className="login-card-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta de El Volcán</p>
        </div>

        <form onSubmit={verificarInicioSesion} className="login-form">
          {alerta.mensaje && (
            <div className={`alert alert-${alerta.tipo}`}>
              {alerta.mensaje}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={recordar}
                onChange={(e) => setRecordar(e.target.checked)}
              />{" "}
              Recordarme
            </label>
            <a href="recuperar-contraseña.html" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="btn-primary">
            Iniciar Sesión
          </button>
        </form>
      </div>
    </main>
  );
}