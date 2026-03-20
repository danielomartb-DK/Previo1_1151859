// dashboard.js
import { api } from './api.js';
import { ensureWorkspace } from './workspace.js';

/* ── Paleta de colores para el donut ─────────────────────────── */
const PALETTE = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

document.addEventListener('DOMContentLoaded', async () => {
    const workspaceId = await ensureWorkspace();
    if (!workspaceId) return;

    // Logout
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    });

    // Cargar transacciones Y categorías en paralelo
    const [transRes, catRes] = await Promise.all([
        api.get('/transactions?workspaceId=' + workspaceId),
        api.get('/categorias?workspaceId=' + workspaceId)
    ]);

    const transactions = (transRes.success && Array.isArray(transRes.data)) ? transRes.data : [];
    const categories   = (catRes.success  && Array.isArray(catRes.data))   ? catRes.data  : [];

    calcularResumen(transactions);
    renderDonutChart(transactions, categories);
    renderBarChart(transactions);
});

/* ── Animador de número con separadores de miles ─────────────── */
function animateValue(elementId, endValue, duration, prefix = '+') {
    const obj = document.getElementById(elementId);
    if (!obj) return;
    const formatter = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        obj.innerHTML = `${prefix}$${formatter.format(eased * endValue)}`;
        obj.classList.add('tabular-nums');
        if (progress < 1) requestAnimationFrame(step);
        else obj.innerHTML = `${prefix}$${formatter.format(endValue)}`;
    };
    requestAnimationFrame(step);
}

function calcularResumen(transactions) {
    let totalIngresos = 0, totalGastos = 0;
    transactions.forEach(t => {
        if (t.tipo === 'INGRESO') totalIngresos += Number(t.monto);
        else if (t.tipo === 'GASTO') totalGastos += Number(t.monto);
    });
    animateValue('stat-income',  totalIngresos, 1200, '+');
    animateValue('stat-expense', totalGastos,   1200, '-');
    animateValue('stat-balance', totalIngresos - totalGastos, 1500, '');
}

/* ── Donut: distribución de montos por categoría ─────────────── */
function renderDonutChart(transactions, categories) {
    const canvas = document.getElementById('chart-donut');
    const emptyEl = document.getElementById('donut-empty');
    const legendEl = document.getElementById('donut-legend');
    if (!canvas) return;

    if (transactions.length === 0) {
        canvas.style.display = 'none';
        emptyEl?.classList.remove('hidden');
        return;
    }

    // Agrupar por categoría
    const map = {};
    transactions.forEach(t => {
        const cat = categories.find(c => c.id == t.categoriaId);
        const label = cat ? cat.nombre : 'Sin categoría';
        map[label] = (map[label] || 0) + Number(t.monto);
    });

    const labels  = Object.keys(map);
    const values  = Object.values(map);
    const colors  = labels.map((_, i) => PALETTE[i % PALETTE.length]);

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#0B1120',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '68%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1E293B',
                    titleColor: '#F8FAFC',
                    bodyColor: '#94A3B8',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct   = ((ctx.raw / total) * 100).toFixed(1);
                            const fmt   = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 });
                            return ` $${fmt.format(ctx.raw)}  (${pct}%)`;
                        }
                    }
                }
            }
        }
    });

    // Leyenda manual
    if (legendEl) {
        legendEl.innerHTML = labels.map((l, i) => `
            <span class="flex items-center gap-1.5 text-[11px] text-textmuted">
                <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[i]}"></span>
                ${l}
            </span>
        `).join('');
    }
}

/* ── Bar chart: ingresos vs gastos por mes ───────────────────── */
function renderBarChart(transactions) {
    const canvas  = document.getElementById('chart-bar');
    const emptyEl = document.getElementById('bar-empty');
    if (!canvas) return;

    if (transactions.length === 0) {
        canvas.style.display = 'none';
        emptyEl?.classList.remove('hidden');
        emptyEl?.classList.add('flex');
        return;
    }

    // Agrupar por mes (ej. "Mar 2026")
    const meses = {};
    transactions.forEach(t => {
        const d = new Date(t.fecha + 'T00:00:00');
        const key = d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
        if (!meses[key]) meses[key] = { ing: 0, gas: 0 };
        if (t.tipo === 'INGRESO') meses[key].ing += Number(t.monto);
        else if (t.tipo === 'GASTO') meses[key].gas += Number(t.monto);
    });

    // Últimos 6 meses con datos
    const keys  = Object.keys(meses).slice(-6);
    const ing   = keys.map(k => meses[k].ing);
    const gas   = keys.map(k => meses[k].gas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: keys,
            datasets: [
                {
                    label: 'Ingresos',
                    data: ing,
                    backgroundColor: 'rgba(16, 185, 129, 0.75)',
                    borderColor:     'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                },
                {
                    label: 'Gastos',
                    data: gas,
                    backgroundColor: 'rgba(239, 68, 68, 0.65)',
                    borderColor:     'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#94A3B8',
                        font: { family: 'Inter', size: 11 },
                        boxWidth: 10,
                        boxHeight: 10
                    }
                },
                tooltip: {
                    backgroundColor: '#1E293B',
                    titleColor: '#F8FAFC',
                    bodyColor: '#94A3B8',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => {
                            const fmt = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 });
                            return ` ${ctx.dataset.label}: $${fmt.format(ctx.raw)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#64748B', font: { family: 'Inter', size: 11 } },
                    grid:  { color: 'rgba(30, 41, 59, 0.8)' }
                },
                y: {
                    ticks: {
                        color: '#64748B',
                        font: { family: 'Inter', size: 11 },
                        callback: (v) => '$' + new Intl.NumberFormat('es-CO', { notation: 'compact' }).format(v)
                    },
                    grid: { color: 'rgba(30, 41, 59, 0.8)' }
                }
            }
        }
    });
}
