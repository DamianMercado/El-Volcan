import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
export const Layout = () => {
  const { pathname } = useLocation();
  const claseMain = pathname.startsWith("/administradora") ? "main-admin" : "";

  return (
    <>
      <Navbar />
      <main className={claseMain}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};