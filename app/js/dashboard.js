// dashboard.js
import { api } from './api.js';
import { ensureWorkspace } from './workspace.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar o Crear Workspace
    const workspaceId = await ensureWorkspace();
    if (!workspaceId) return; // Se pausará aquí si el overlay está mostrándose

    // 2. Traer transacciones
    const res = await api.get('/transactions');
    if (res.success && Array.isArray(res.data)) {
        calcularResumen(res.data, workspaceId);
    } else {
        console.warn('No se pudieron obtener transacciones o está vacío.');
        calcularResumen([], workspaceId);
    }
});

function calcularResumen(transacciones, workspaceId) {
    // Filtrar por si la API no filtra por workspaceId automáticamente
    const tWorkspace = transacciones.filter(t => t.workspaceId === workspaceId);

    let totalIngresos = 0;
    let totalGastos = 0;

    tWorkspace.forEach(t => {
        // En base a los requerimientos: INGRESO o GASTO (MAYÚSCULA)
        if (t.type === 'INGRESO') {
            totalIngresos += Number(t.amount);
        } else if (t.type === 'GASTO') {
            totalGastos += Number(t.amount);
        }
    });

    const balance = totalIngresos - totalGastos;

    // Actualizar DOM
    document.getElementById('stat-income').textContent = `$${totalIngresos.toFixed(2)}`;
    document.getElementById('stat-expense').textContent = `$${totalGastos.toFixed(2)}`;
    document.getElementById('stat-balance').textContent = `$${balance.toFixed(2)}`;

    // Si tuviéramos una librería como Chart.js, aquí dibujaríamos las gráficas
    // Dado que el requerimiento es "JavaScript puro", simularemos la agrupación por consola:
    agruparPorCategoria(tWorkspace);
}

function agruparPorCategoria(transacciones) {
    const agrupado = transacciones.reduce((acc, obj) => {
        const key = obj.categoryId || 'Sin Categoría';
        if (!acc[key]) {
            acc[key] = 0;
        }
        acc[key] += Number(obj.amount);
        return acc;
    }, {});
    console.log('[DASHBOARD] Agrupación por categorías:', agrupado);
}
