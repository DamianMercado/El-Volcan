import { Variables } from '../config/variables'

export const Rutas = {
  login: `${Variables.apiUrl}/auth/login`,
  registro: `${Variables.apiUrl}/auth/registro`,
  recuperarClave: `${Variables.apiUrl}/auth/recuperar-clave`,
  logout: `${Variables.apiUrl}/auth/logout`,
  productos: `${Variables.apiUrl}/catalogo`,
  producto: (id) => `${Variables.apiUrl}/catalogo/${id}`,
  inventario: `${Variables.apiUrl}/inventario`,
  ventas: `${Variables.apiUrl}/ventas`,
}
