//import { useState } from 'react'
import {Navbar} from "./assets/components/Navbar";
import {CardLogin} from "./assets/components/CardLogin";
import {Footer} from "./assets/components/Footer";

export default function App() {

  return (
    <main>
      <Navbar/>

      <CardLogin/>

      <Footer/>
    </main>
  )
}