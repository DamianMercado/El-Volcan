import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Layout} from "./assets/layouts/Layout"
import { Repartidor} from "./assets/pages/Repartidor"

export default function App() {
 return (
    <BrowserRouter>
      <Routes>
        <Route path= "/" element= {<Layout/>}>
          <Route index element={<Repartidor/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
