// api.js - Módulo central para peticiones HTTP
const API_BASE_URL = 'https://finanzas-api.ubunifusoft.digital/api';

// Función interna para obtener headers
function getHeaders(isJson = true) {
    const headers = new Headers();
    if (isJson) {
        headers.append('Content-Type', 'application/json');
    }
    
    // Obtener token del localStorage si existe
    const token = localStorage.getItem('token');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    
    return headers;
}

// Función principal de fetch
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        method: options.method || 'GET',
        headers: getHeaders(options.isJson !== false),
        ...options
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        
        let data;
        try {
            data = await response.json();
        } catch {
            data = { mensaje: 'Respuesta no válida del servidor.' };
        }

        if (!response.ok) {
            // Manejo de token inválido / no autorizado
            if (response.status === 401 || response.status === 403) {
                console.warn('Acceso no autorizado. Redirigiendo a login...');
                localStorage.removeItem('token');
                window.location.href = 'index.html';
                throw new Error('No autorizado');
            }
            throw new Error(data.mensaje || data.message || 'Error en la petición');
        }

        // Desempaquetar el objeto 'data' anidado si viene de Spring/Swagger
        const payload = data.data !== undefined ? data.data : data;
        return { success: true, data: payload, fullResponse: data };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body }),
    put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' })
};
