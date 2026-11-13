export const users = [
  {
    id: 1,
    nombres: "admin",
    apellidos: "sistema",
    email: "admin@el-volcan.com",
    contraseña: "admin123",
    rol: "admin",
    rut: "11.111.111-1",
    telefono: "+56 9 1111 1111",
    direccion: "Casa Matriz El Volcán 100",
    comuna: "Puente Alto",
  },
  {
    id: 2,
    nombres: "operador",
    apellidos: "empleado",
    email: "operador@el-volcan.com",
    contraseña: "operador123",
    rol: "operador",
  },
  {
    id: 3,
    nombres: "repartidor",
    apellidos: "empleado",
    email: "repartidor@el-volcan.com",
    contraseña: "repartidor123",
    rol: "repartidor",
  },
  {
    id: 4,
    nombres: "cliente",
    apellidos: "usuario",
    email: "cliente@el-volcan.com",
    contraseña: "cliente123",
    rol: "cliente",
    rut: "44.444.444-4",
    telefono: "+56 9 4444 4444",
    direccion: "Av. Concha y Toro 1420",
    comuna: "Puente Alto",
  },
];

const CLAVE_USUARIOS = "usuarios_registrados";

export function obtenerUsuarios() {
  try {
    const guardados = localStorage.getItem(CLAVE_USUARIOS);
    if (!guardados) {
      localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(users));
      return [...users];
    }
    return JSON.parse(guardados);
  } catch {
    return [...users];
  }
}

export function registrarUsuario(nuevoUsuario) {
  try {
    const listaActual = obtenerUsuarios();

    const emailNormalizado = nuevoUsuario.email.trim().toLowerCase();
    const yaExiste = listaActual.some(
      (u) => u.email.trim().toLowerCase() === emailNormalizado
    );

    if (yaExiste) {
      return {
        exito: false,
        mensaje: "El correo electrónico ya se encuentra registrado.",
      };
    }

    const usuarioCreado = {
      id: Date.now(),
      ...nuevoUsuario,
      email: emailNormalizado,
      rol: (nuevoUsuario.rol || "cliente").toLowerCase(),
    };

    const nuevaLista = [...listaActual, usuarioCreado];
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(nuevaLista));

    return {
      exito: true,
      usuario: usuarioCreado,
    };
  } catch {
    return {
      exito: false,
      mensaje: "Ocurrió un error al guardar el usuario en el navegador.",
    };
  }
}

export function buscarUsuarioPorCredenciales(email, password) {
  const lista = obtenerUsuarios();
  const emailNormalizado = (email || "").trim().toLowerCase();

  return (
    lista.find(
      (u) =>
        u.email.trim().toLowerCase() === emailNormalizado &&
        u.contraseña === password
    ) || null
  );
}

export function actualizarPasswordLocal(email, nuevaPassword) {
  const lista = obtenerUsuarios();
  const emailNormalizado = (email || "").trim().toLowerCase();
  const existe = lista.some((u) => u.email.trim().toLowerCase() === emailNormalizado);

  if (!existe) {
    return {
      exito: false,
      mensaje: "No encontramos ninguna cuenta registrada con ese correo electrónico.",
    };
  }

  const actualizada = lista.map((u) =>
    u.email.trim().toLowerCase() === emailNormalizado
      ? { ...u, contraseña: nuevaPassword }
      : u
  );
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(actualizada));

  return {
    exito: true,
    mensaje: "Contraseña actualizada correctamente.",
  };
}
