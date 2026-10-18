import { NavLink } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" end>
        Repartidor
      </NavLink>
      <NavLink to="/administradora">Administradora</NavLink>
    </nav>
  );
}
