
const REDIRECT_URL = 'index.html';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;


const form = document.getElementById('register-form');
const alertBox = document.getElementById('alert-box');
const submitBtn = form.querySelector('.btn-primary');


const nombreInput = document.getElementById('nombre');
const apellidoInput = document.getElementById('apellido');
const emailInput = document.getElementById('email');
const telefonoInput = document.getElementById('telefono');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');


function showAlert(message, type = 'error') {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearAlert() {
    alertBox.className = '';
    alertBox.textContent = '';
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert();

    const nombre = nombreInput.value.trim();
    const apellido = apellidoInput.value.trim();
    const email = emailInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validar campos vacíos
    if (!nombre || !apellido || !email || !telefono || !password || !confirmPassword) {
        showAlert('Por favor, completa todos los campos.');
        return;
    }

    // Validar formato de correo
    if (!EMAIL_REGEX.test(email)) {
        showAlert('Por favor, ingresa un correo electrónico válido.');
        emailInput.focus();
        return;
    }

    // Validar longitud de la contraseña
    if (password.length < MIN_PASSWORD_LENGTH) {
        showAlert(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
        passwordInput.focus();
        return;
    }

    // Validar que coincidan las contraseñas
    if (password !== confirmPassword) {
        showAlert('Las contraseñas no coinciden.');
        confirmPasswordInput.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando credenciales...';

    // Simular registro exitoso y redirección
    setTimeout(() => {
        showAlert('¡Cuenta creada con éxito! Redirigiendo...', 'success');
        form.reset();

        setTimeout(() => {
            window.location.href = REDIRECT_URL;
        }, 1200);

    }, 1000);
});