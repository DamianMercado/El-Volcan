document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    const alertBox = document.getElementById('alert-box');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    const usuariosPermitidos = [
        {
            email: 'admin@gmail.cl',
            password: 'admin123',
            nombre: 'Admin',
            rol: 'admin',
            redireccion: 'dashboard.html'
        },
        {
            email: 'cliente@gmail.cl',
            password: 'cliente123',
            nombre: 'cliente',
            rol: 'cliente',
            redireccion: 'index.html'
        }
    ];

    const emailGuardado = localStorage.getItem('recordar_email');
    if (emailGuardado) {
        emailInput.value = emailGuardado;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    function mostrarAlerta(mensaje, tipo = 'error') {
        alertBox.innerHTML = `
            <div class="alert alert-${tipo}">
                <p>${mensaje}</p>
            </div>
        `;
    }

    function limpiarAlerta() {
        alertBox.innerHTML = '';
    }

    function esCorreoValido(correo) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        limpiarAlerta();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        // Validaciones en cliente
        if (!email || !password) {
            mostrarAlerta('Por favor, completa todos los campos.');
            return;
        }
        if (!esCorreoValido(email)) {
            mostrarAlerta('El formato del correo electrónico no es válido.');
            return;
        }
        if (password.length < 6) {
            mostrarAlerta('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        const textoOriginalBoton = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verificando credenciales...';

        setTimeout(() => {
            const usuarioEncontrado = usuariosPermitidos.find(
                user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
            );

            if (usuarioEncontrado) {
                sessionStorage.setItem('usuario_activo', JSON.stringify({
                    nombre: usuarioEncontrado.nombre,
                    email: usuarioEncontrado.email,
                    rol: usuarioEncontrado.rol
                }));

                if (rememberCheckbox && rememberCheckbox.checked) {
                    localStorage.setItem('recordar_email', email);
                } else {
                    localStorage.removeItem('recordar_email');
                }
                mostrarAlerta(`¡Bienvenido, ${usuarioEncontrado.nombre}! Redirigiendo...`, 'success');

                setTimeout(() => {
                    window.location.href = usuarioEncontrado.redireccion;
                }, 1000);
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = textoOriginalBoton;
                mostrarAlerta('Correo o contraseña incorrectos. Intenta nuevamente.');
            }
        }, 1000);
    });
});