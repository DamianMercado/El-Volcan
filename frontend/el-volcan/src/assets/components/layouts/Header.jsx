import { administradora } from "../../data/administracion";

export function Header() {
  return (
    <header>
      <div className="titulo">
        <h1>El Volcan</h1>
        <p>Bienvenido, Administradora</p>
      </div>
      <div className="perfil">
        <div className="nombre">
          {administradora.nombre}
          <br />
          {administradora.cargo}
        </div>
        <div className="avatar">{administradora.iniciales}</div>
      </div>
    </header>
  );
}
