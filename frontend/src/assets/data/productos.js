export const productos = [
  {
    id: 1,
    codigo: "AC001",
    nombre: "Carro porta cilindro 11/15kg",
    descripcion: "Carro metálico reforzado para transporte seguro de cilindros de 11 y 15 kg",
    precio: 10990,
    stock: 57,
    minimo: 15,
    categoria: "Accesorios",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/AC001.webp"
  },
  {
    id: 2,
    codigo: "AC002",
    nombre: "Tapa protectora para válvula",
    descripcion: "Tapa de seguridad para proteger la válvula del cilindro contra polvo y golpes",
    precio: 1490,
    stock: 59,
    minimo: 25,
    categoria: "Accesorios",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/AC002.webp"
  },
  {
    id: 3,
    codigo: "AC003",
    nombre: "Detector de gas a batería",
    descripcion: "Sensor electrónico de fugas de gas GLP con alarma sonora de alta potencia",
    precio: 19990,
    stock: 8,
    minimo: 20,
    categoria: "Accesorios",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/AC003.webp"
  },
  {
    id: 4,
    codigo: "CL001",
    nombre: "Cilindro gas licuado 5 kg",
    descripcion: "Recarga de cilindro de gas licuado de 5 kg ideal para camping y estufas portátiles",
    precio: 12990,
    stock: 39,
    minimo: 40,
    categoria: "Cilindros",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/CL001.webp"
  },
  {
    id: 5,
    codigo: "CL002",
    nombre: "Cilindro gas licuado 11 kg",
    descripcion: "Recarga de cilindro de gas licuado de 11 kg de uso residencial",
    precio: 23990,
    stock: 60,
    minimo: 50,
    categoria: "Cilindros",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/CL002.webp"
  },
  {
    id: 6,
    codigo: "CL003",
    nombre: "Cilindro gas licuado 15 kg",
    descripcion: "Recarga de cilindro de gas licuado de 15 kg de alto rendimiento para el hogar",
    precio: 31990,
    stock: 25,
    minimo: 30,
    categoria: "Cilindros",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/CL003.webp"
  },
  {
    id: 7,
    codigo: "CL004",
    nombre: "Cilindro gas licuado 45 kg",
    descripcion: "Recarga de cilindro de gas licuado de 45 kg para calefacción central y comercios",
    precio: 45000,
    stock: 30,
    minimo: 20,
    categoria: "Cilindros",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/CL004.webp"
  },
  {
    id: 8,
    codigo: "KC004",
    nombre: "Kit conexión completo",
    descripcion: "Kit certificado que incluye regulador, manguera de 1.5m y dos abrazaderas",
    precio: 12990,
    stock: 25,
    minimo: 15,
    categoria: "Kits",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/KC004.webp"
  },
  {
    id: 9,
    codigo: "MG001",
    nombre: "Manguera gas 1.5 m",
    descripcion: "Manguera flexible certificada SEC de 1.5 metros para gas licuado",
    precio: 3990,
    stock: 77,
    minimo: 30,
    categoria: "Mangueras",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/MG001.webp"
  },
  {
    id: 10,
    codigo: "MG002",
    nombre: "Manguera gas 3 m",
    descripcion: "Manguera flexible certificada SEC de 3 metros para gas licuado",
    precio: 6990,
    stock: 50,
    minimo: 20,
    categoria: "Mangueras",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/MG002.webp"
  },
  {
    id: 11,
    codigo: "MG003",
    nombre: "Abrazadera metálica",
    descripcion: "Abrazadera de acero inoxidable para fijación segura de manguera de gas",
    precio: 990,
    stock: 200,
    minimo: 80,
    categoria: "Accesorios",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/MG003.webp"
  },
  {
    id: 12,
    codigo: "RG001",
    nombre: "Regulador doméstico estándar",
    descripcion: "Regulador de presión estándar certificado para cilindros de 5, 11 y 15 kg",
    precio: 8990,
    stock: 45,
    minimo: 20,
    categoria: "Reguladores",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/RG001.webp"
  },
  {
    id: 13,
    codigo: "RG002",
    nombre: "Regulador de alta presión",
    descripcion: "Regulador industrial de alta presión para hornos y cocinas gastronómicas",
    precio: 18990,
    stock: 12,
    minimo: 15,
    categoria: "Reguladores",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/RG002.webp"
  },
  {
    id: 14,
    codigo: "RG003",
    nombre: "Regulador dual (2 salidas)",
    descripcion: "Regulador de doble salida para conectar dos artefactos simultáneamente",
    precio: 14990,
    stock: 18,
    minimo: 15,
    categoria: "Reguladores",
    imagen: "https://res.cloudinary.com/hsr9lgyw/image/upload/v1793984850/RG003.webp"
  }
];

const CLAVE_CATALOGO = "catalogo_productos_volcan";

export function obtenerCatalogoLocal() {
  try {
    const guardado = localStorage.getItem(CLAVE_CATALOGO);
    if (!guardado) {
      localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(productos));
      return [...productos];
    }
    return JSON.parse(guardado);
  } catch {
    return [...productos];
  }
}

export function guardarCatalogoLocal(lista) {
  try {
    localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(lista));
  } catch {
    // Ignorar error de almacenamiento
  }
}

export function obtenerProductoLocalPorId(id) {
  const lista = obtenerCatalogoLocal();
  return (
    lista.find(
      (p) => String(p.id) === String(id) || String(p.codigo).toUpperCase() === String(id).toUpperCase()
    ) || null
  );
}

export function crearProductoLocal(nuevo) {
  const lista = obtenerCatalogoLocal();
  const maxId = lista.reduce((max, p) => Math.max(max, Number(p.id) || 0), 14);
  const nuevoId = nuevo.id || maxId + 1;
  const codigoGenerado =
    nuevo.codigo && nuevo.codigo.trim()
      ? nuevo.codigo.trim().toUpperCase()
      : `EV0${nuevoId}`;

  const creado = {
    id: nuevoId,
    codigo: codigoGenerado,
    nombre: nuevo.nombre,
    descripcion: nuevo.descripcion || "",
    categoria: nuevo.categoria || "Cilindros",
    precio: Number(nuevo.precio ?? 0),
    stock: Number(nuevo.stock ?? 0),
    minimo: Number(nuevo.minimo ?? 15),
    imagen: nuevo.imagen || "",
  };

  const actualizada = [...lista, creado];
  guardarCatalogoLocal(actualizada);
  return creado;
}

export function actualizarProductoLocal(id, datos) {
  const lista = obtenerCatalogoLocal();
  let actualizado = null;
  const nuevaLista = lista.map((p) => {
    if (String(p.id) === String(id) || String(p.codigo).toUpperCase() === String(id).toUpperCase()) {
      actualizado = {
        ...p,
        ...datos,
        id: p.id,
        codigo: datos.codigo ? datos.codigo.toUpperCase().trim() : p.codigo,
        precio: Number(datos.precio ?? p.precio),
        stock: Number(datos.stock ?? p.stock),
        minimo: Number(datos.minimo ?? p.minimo ?? 15),
      };
      return actualizado;
    }
    return p;
  });

  if (actualizado) {
    guardarCatalogoLocal(nuevaLista);
  }
  return actualizado;
}

export function eliminarProductoLocal(id) {
  const lista = obtenerCatalogoLocal();
  const filtrada = lista.filter(
    (p) => String(p.id) !== String(id) && String(p.codigo).toUpperCase() !== String(id).toUpperCase()
  );
  guardarCatalogoLocal(filtrada);
}

export const obtenerProductosLocales = obtenerCatalogoLocal;
export const guardarProductosLocales = guardarCatalogoLocal;

