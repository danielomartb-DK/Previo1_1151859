// workspace.js
import { api } from './api.js';

// Verificación inicial de sesión para páginas protegidas
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'index.html';
}

// Lógica de logout universal
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtns = document.querySelectorAll('[data-action="logout"]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    });
});

export async function ensureWorkspace() {
    // Tomamos el que extrajimos directo desde el login
    const workspaceId = localStorage.getItem('workspaceId');
    const overlay = document.getElementById('workspace-overlay');
    
    if (workspaceId) {
        if (overlay) overlay.classList.add('hidden');
        return workspaceId;
    }

    // Si llegamos aquí y no hay workspaceId en la bolsa, ha ocurrido
    // un error grave en sesión o desincronización de token.
    console.warn("No workspace found, forcing relogin.");
    localStorage.clear();
    window.location.href = 'index.html';
    return null;
}
