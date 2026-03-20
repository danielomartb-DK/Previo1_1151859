// auth.js
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    const toggleToRegisterBtn = document.getElementById('toggle-to-register');
    const toggleToLoginBtn = document.getElementById('toggle-to-login');
    
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    const alertContainer = document.getElementById('auth-alert');

    // Función de ayuda para mostrar mensajes de error/éxito
    function showAlert(message, type = 'error') {
        alertContainer.textContent = message;
        alertContainer.className = `p-4 mb-4 text-sm rounded-lg ${type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'}`;
        alertContainer.classList.remove('hidden');
        
        setTimeout(() => {
            alertContainer.classList.add('hidden');
        }, 5000);
    }

    // Toggle forms
    if (toggleToRegisterBtn) {
        toggleToRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.classList.add('hidden');
            registerSection.classList.remove('hidden');
            alertContainer.classList.add('hidden');
        });
    }

    if (toggleToLoginBtn) {
        toggleToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
            alertContainer.classList.add('hidden');
        });
    }

    // Manejo del Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            if (!email || !password) {
                showAlert('Por favor, ingresa correo y contraseña.');
                return;
            }

            // Cambiar texto de botón para loading UI
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Iniciando...';
            btn.disabled = true;

            const res = await api.post('/auth/login', { email, password });

            btn.textContent = originalText;
            btn.disabled = false;

            if (res.success && res.data.token) {
                localStorage.setItem('token', res.data.token);
                // Extraer el workspace que el backend asigna por defecto al crear/dar login
                if(res.data.workspaces && res.data.workspaces.length > 0) {
                    localStorage.setItem('workspaceId', res.data.workspaces[0].id);
                }
                window.location.href = 'dashboard.html';
            } else {
                showAlert(res.error || 'Credenciales inválidas.');
            }
        });
    }

    // Manejo del Registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value.trim();
            const passwordConfirm = document.getElementById('register-password-confirm').value.trim();
            const nombre = document.getElementById('register-name').value.trim();

            // Validación de correo basica
            if (!email.includes('@')) {
                showAlert('Por favor ingresa un correo electrónico válido.');
                return;
            }

            if (!email || !password || !passwordConfirm || !nombre) {
                showAlert('Todos los campos son obligatorios.');
                return;
            }

            if (password !== passwordConfirm) {
                showAlert('Las contraseñas no coinciden.');
                return;
            }

            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Registrando...';
            btn.disabled = true;

            const res = await api.post('/auth/registro', { nombre, email, password });

            btn.textContent = originalText;
            btn.disabled = false;

            if (res.success) {
                showAlert('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
                registerSection.classList.add('hidden');
                loginSection.classList.remove('hidden');
                registerForm.reset();
            } else {
                showAlert(res.error || 'No se pudo crear la cuenta.');
            }
        });
    }
});
