// categories.js
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Necesitamos que el Workspace ya exista en LocalStorage para operar categorías
    const workspaceId = localStorage.getItem('workspaceId');
    if (!workspaceId) {
        window.location.href = 'dashboard.html'; 
        return;
    }

    const categoriesList = document.getElementById('categories-list');
    const emptyState = document.getElementById('empty-state');
    const pageAlert = document.getElementById('page-alert');

    // Elementos del Modal
    const modal = document.getElementById('category-modal');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const form = document.getElementById('category-form');

    function showAlert(msg, isSuccess = true) {
        pageAlert.textContent = msg;
        pageAlert.className = `p-4 mb-4 text-sm rounded-lg ${isSuccess ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`;
        pageAlert.classList.remove('hidden');
        setTimeout(() => pageAlert.classList.add('hidden'), 3500);
    }

    function renderCategoryRow(cat) {
        const isIngreso = cat.tipo === 'INGRESO';
        const colorCls = isIngreso ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-textmuted bg-elevated/50 border-bordercolor';
        
        return `
        <tr class="hover:bg-elevated/40 transition-colors group">
            <td class="px-6 py-4">
                <div class="font-medium text-white text-sm">${cat.nombre}</div>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-semibold tracking-widest uppercase border ${colorCls}">
                    ${cat.tipo}
                </span>
            </td>
        </tr>
        `;
    }

    async function loadCategories() {
        const res = await api.get('/categorias?workspaceId=' + workspaceId);
        categoriesList.innerHTML = '';
        
        if (res.success && Array.isArray(res.data)) {
            const workspaceCats = res.data; // Ya viene filtrado por la API
            
            if (workspaceCats.length === 0) {
                emptyState.classList.remove('hidden');
                emptyState.style.display = 'flex';
            } else {
                emptyState.classList.add('hidden');
                emptyState.style.display = '';
                
                categoriesList.innerHTML = workspaceCats.map(renderCategoryRow).join('');
            }
        } else {
            console.error('No se pudieron cargar categorías:', res);
        }
    }

    // Handlers Modal
    btnOpenModal.addEventListener('click', () => modal.classList.remove('hidden'));
    btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('cat-name');
        const typeInput = document.querySelector('input[name="type"]:checked');

        const name = nameInput.value.trim();
        const type = typeInput ? typeInput.value.toUpperCase() : null;

        if (!name || (type !== 'INGRESO' && type !== 'GASTO')) {
            alert('Nombre vacío o tipo incorrecto.');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const payload = { nombre: name, tipo: type, workspaceId: parseInt(workspaceId) };
        const res = await api.post('/categorias', payload);

        btn.textContent = originalText;
        btn.disabled = false;

        if (res.success) {
            showAlert('Categoría creada exitosamente.');
            modal.classList.add('hidden');
            form.reset();
            loadCategories(); // Refrescar lista
        } else {
            showAlert('Error al crear categoría: ' + res.error, false);
        }
    });

    // Inicializar
    loadCategories();
});
