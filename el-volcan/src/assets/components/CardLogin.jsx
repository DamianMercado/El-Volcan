export const CardLogin = () =>{
    return (
        <div class="login-card">
            <div class="login-card-header">
                <h1>Iniciar Sesión</h1>
                <p>Accede a tu cuenta de El Volcán</p>
            </div>
            <form action="/login" method="POST" class="login-form" id="login-form">
                <div id="alert-box"></div>
                <div class="form-group">
                    <label for="email">Correo Electrónico</label>
                    <input type="email" id="email" name="email" placeholder="tu@correo.com" required/>
                </div>

                <div class="form-group">
                    <label for="password">Contraseña</label>
                    <input type="password" id="password" name="password" placeholder="Contraseña" required/>
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" name="recordar"/> Recordarme
                    </label>
                    <a href="recuperar-contraseña.html" class="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" class="btn-primary">Iniciar Sesión</button>
            </form>
        </div>
    )
}