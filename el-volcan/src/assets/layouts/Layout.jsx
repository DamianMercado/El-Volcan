import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";

export function Layout() {
    return(
        <div>
            <Header/>
            <main>
                <Outlet/>   
            </main>
        </div>
    )
}