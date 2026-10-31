export const users = [
    {
        id: 1,
        nombres: "admin",
        apellidos: "sistema",
        email: "admin@el-volcan.com",
        contraseña: "admin123",
        rol: "admin",
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
    },
];

const CLAVE_USUARIOS = "usuarios_registrados";

/**
 * Obtiene la lista completa de usuarios (iniciales + registrados en localStorage).
 */
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

/**
 * Registra un nuevo usuario en localStorage si el correo no está ocupado.
 */
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
                mensaje: "El correo electrónico ya se encuentra registrado."
            };
        }

        const usuarioCreado = {
            id: Date.now(),
            ...nuevoUsuario,
            email: emailNormalizado,
            rol: nuevoUsuario.rol || "cliente"
        };

        const nuevaLista = [...listaActual, usuarioCreado];
        localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(nuevaLista));

        return {
            exito: true,
            usuario: usuarioCreado
        };
    } catch {
        return {
            exito: false,
            mensaje: "Ocurrió un error al guardar el usuario en el navegador."
        };
    }
}

/**
 * Busca un usuario por correo y contraseña en la lista persistida de localStorage.
 */
export function buscarUsuarioPorCredenciales(email, password) {
    const lista = obtenerUsuarios();
    const emailNormalizado = (email || "").trim().toLowerCase();

    return lista.find(
        (u) => u.email.trim().toLowerCase() === emailNormalizado && u.contraseña === password
    ) || null;
}
