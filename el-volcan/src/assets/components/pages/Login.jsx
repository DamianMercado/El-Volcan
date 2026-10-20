import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { users } from "../../../datos/users.js";


export function Login() {
  const navigate = useNavigate(); // 2. Instanciar navigate
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [alerta, setAlerta] = useState({ mensaje: "", tipo: "" });

  // Cargar email recordado al montar el componente
  useEffect(() => {
    const emailGuardado = localStorage.getItem("recordar_email");
    if (emailGuardado) {
      setEmail(emailGuardado);
      setRecordar(true);
    }
  }, []);

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
      mostrarAlerta(`¡Bienvenido, ${usuarioEncontrado.nombres}!`, "success");

      setTimeout(() => {
        navigate("/"); // 3. Redirigir a la página de inicio
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