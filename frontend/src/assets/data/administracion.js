export const administradora = {
  nombre: "Andrea Muñoz",
  cargo: "Administradora",
  iniciales: "AM",
};

export const productosIniciales = [
  { codigo: "CL001", nombre: "Cilindro GLP 5 kg", categoria: "Cilindros", precio: 6500, stock: 80, minimo: 40 },
  { codigo: "CL002", nombre: "Cilindro GLP 11 kg", categoria: "Cilindros", precio: 12000, stock: 200, minimo: 100 },
  { codigo: "CL003", nombre: "Cilindro GLP 15 kg", categoria: "Cilindros", precio: 16000, stock: 90, minimo: 50 },
  { codigo: "CL004", nombre: "Cilindro GLP 45 kg", categoria: "Cilindros", precio: 45000, stock: 30, minimo: 20 },
  { codigo: "RG001", nombre: "Regulador doméstico estándar", categoria: "Reguladores", precio: 8990, stock: 45, minimo: 20 },
  { codigo: "RG002", nombre: "Regulador de alta presión", categoria: "Reguladores", precio: 18990, stock: 12, minimo: 15 },
  { codigo: "RG003", nombre: "Regulador dual (2 salidas)", categoria: "Reguladores", precio: 14990, stock: 18, minimo: 15 },
  { codigo: "MG001", nombre: "Manguera gas 1.5 m", categoria: "Mangueras", precio: 3990, stock: 80, minimo: 30 },
  { codigo: "MG002", nombre: "Manguera gas 3 m", categoria: "Mangueras", precio: 6990, stock: 50, minimo: 20 },
  { codigo: "MG003", nombre: "Abrazadera metálica", categoria: "Mangueras", precio: 990, stock: 200, minimo: 80 },
  { codigo: "MG004", nombre: "Kit conexión completo", categoria: "Mangueras", precio: 12990, stock: 25, minimo: 15 },
  { codigo: "AC001", nombre: "Carro porta cilindro 11/15 kg", categoria: "Accesorios", precio: 12990, stock: 20, minimo: 10 },
  { codigo: "AC002", nombre: "Tapa protectora para válvula", categoria: "Accesorios", precio: 1490, stock: 60, minimo: 25 },
  { codigo: "AC003", nombre: "Detector de gas a batería", categoria: "Accesorios", precio: 19990, stock: 8, minimo: 20 },
];

export const repartidores = [
  { nombre: "Carlos Ruiz", ruta: "Ruta Norte", iniciales: "CR" },
  { nombre: "Diego Fuentes", ruta: "Ruta Sur", iniciales: "DF" },
  { nombre: "Valentina Soto", ruta: "Ruta Centro", iniciales: "VS" },
];

// estado: "Pendiente" (sin repartidor), "En ruta" o "Entregado"
export const pedidosClientesIniciales = [
  { id: "101", cliente: "Maria Gomez", direccion: "Calle Las Flores #23", detalle: "2 (5kg x1, 11kg x1)", estado: "En ruta", repartidor: "Carlos Ruiz" },
  { id: "102", cliente: "Juan Perez", direccion: "Av. Central #45", detalle: "1 (15kg x1)", estado: "En ruta", repartidor: "Carlos Ruiz" },
  { id: "103", cliente: "Ana Torres", direccion: "Barrio San Jose #10", detalle: "3 (5kg x2, 11kg x1)", estado: "Entregado", repartidor: "Carlos Ruiz" },
  { id: "104", cliente: "Panadería El Sol", direccion: "Calle Lagos 980", detalle: "3 (45kg x3)", estado: "Entregado", repartidor: "Diego Fuentes" },
  { id: "105", cliente: "Restaurante La Picada", direccion: "Av. O'Higgins 1520", detalle: "2 (45kg x1, regulador alta presión x1)", estado: "En ruta", repartidor: "Diego Fuentes" },
  { id: "106", cliente: "Jorge Soto", direccion: "Pasaje Los Robles 45", detalle: "2 (11kg x2)", estado: "Pendiente", repartidor: null },
  { id: "107", cliente: "Camila Reyes", direccion: "Av. Central #120", detalle: "1 (detector de gas x1)", estado: "Pendiente", repartidor: null },
  { id: "108", cliente: "Pedro Salinas", direccion: "Pasaje Los Aromos #5", detalle: "1 (11kg x1)", estado: "Entregado", repartidor: "Valentina Soto" },
  { id: "109", cliente: "Almacén Don Luis", direccion: "Calle Maipón 340", detalle: "4 (15kg x4)", estado: "En ruta", repartidor: "Valentina Soto" },
];

export const solicitudesIniciales = [
  { id: 1, codigo: "AC003", cantidad: 30, nota: "Proveedor habitual", fecha: "15/10/2026", estado: "Pendiente" },
  { id: 2, codigo: "CL004", cantidad: 20, nota: "", fecha: "10/10/2026", estado: "Recibida" },
];
