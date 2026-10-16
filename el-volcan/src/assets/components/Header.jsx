import { repartidor } from "../data/pedidos";

export function Header() {
  return (
    <header>
      <div className="titulo">
        <h1>El Volcan</h1>
        <p>Bienvenido, Repartidor</p>
      </div>
      <div className="perfil">
        <div className="nombre">
          {repartidor.nombre}
          <br />
          {repartidor.ruta}
        </div>
        <div className="avatar">{repartidor.iniciales}</div>
      </div>
    </header>
  );
}
