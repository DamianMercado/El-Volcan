import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Navbar } from "../components/Navbar";

export function Layout() {
  const { pathname } = useLocation();
  const claseMain = pathname.startsWith("/administradora") ? "main-admin" : "";

  return (
    <div>
      <Header />
      <Navbar />
      <main className={claseMain}>
        <Outlet />
      </main>
    </div>
  );
}
