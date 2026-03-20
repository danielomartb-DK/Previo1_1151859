// dashboard.js
import { api } from './api.js';
import { ensureWorkspace } from './workspace.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar Workspace
    const workspaceId = await ensureWorkspace();
    if (!workspaceId) return; // Se pausará aquí si el overlay está mostrándose o redirige

    // Logout
    const logoutBtns = document.querySelectorAll('[data-action="logout"]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    });

    // 2. Traer transacciones ya filtradas por el backend
    const res = await api.get('/transactions?workspaceId=' + workspaceId);
    
    if (res.success && Array.isArray(res.data)) {
        calcularResumen(res.data);
    } else {
        console.warn('No se pudieron obtener transacciones o está vacío.');
        calcularResumen([]);
    }
});

function animateValue(elementId, endValue, duration, prefix = "$") {
    const obj = document.getElementById(elementId);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        // Easing function outExpo
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const currentVal = easeOutProgress * endValue;
        
        // Tabular nums para que no salte locamente al animarse
        obj.innerHTML = `${prefix}${Number(currentVal).toFixed(2)}`;
        obj.classList.add('tabular-nums'); // Inyectar clase dinámicamente
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = `${prefix}${Number(endValue).toFixed(2)}`;
        }
    };
    window.requestAnimationFrame(step);
}

function calcularResumen(transacciones) {
    let totalIngresos = 0;
    let totalGastos = 0;

    transacciones.forEach(t => {
        // En la base de datos es 'tipo' y 'monto'
        if (t.tipo === 'INGRESO') {
            totalIngresos += Number(t.monto);
        } else if (t.tipo === 'GASTO') {
            totalGastos += Number(t.monto);
        }
    });

    const balance = totalIngresos - totalGastos;

    // Actualizar DOM
    // Si queremos un formato bonito de moneda con comas:
    const formatter = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    });

    animateValue('stat-income', totalIngresos, 1200, "+$");
    animateValue('stat-expense', totalGastos, 1200, "-$");
    animateValue('stat-balance', balance, 1500, "$");
}
