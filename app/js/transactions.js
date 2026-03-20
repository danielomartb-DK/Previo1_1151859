// transactions.js
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const workspaceId = localStorage.getItem('workspaceId');
    if (!workspaceId) {
        window.location.href = 'dashboard.html';
        return;
    }

    const tList = document.getElementById('transactions-list');
    const emptyState = document.getElementById('empty-state');
    const pageAlert = document.getElementById('page-alert');
    const modalAlert = document.getElementById('modal-alert');
    
    // Modal
    const modal = document.getElementById('transaction-modal');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const form = document.getElementById('transaction-form');
    
    // Filter Elements
    const filterCategorySelect = document.getElementById('filter-category');
    const filterDateInput = document.getElementById('filter-date');
    const btnFilter = document.getElementById('btn-filter');
    const btnClearFilter = document.getElementById('btn-clear-filter');

    // Inputs Modal
    const selCategory = document.getElementById('t-category');
    const selBeneficiary = document.getElementById('t-beneficiary');
    const inputAmount = document.getElementById('t-amount');
    const inputDate = document.getElementById('t-date');
    const inputDesc = document.getElementById('t-desc');
    const btnSubmit = document.getElementById('btn-submit');

    // Estado local
    let categoriesList = [];
    let beneficiariesList = [];
    let allTransactions = [];

    function showAlert(msg, isSuccess = true, target = pageAlert) {
        target.textContent = msg;
        target.className = `p-4 mb-4 text-sm rounded-lg ${isSuccess ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`;
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('hidden'), 5000);
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
        return d.toLocaleDateString();
    }

    function renderTransactionRow(t) {
        const cat = categoriesList.find(c => c.id == t.categoriaId);
        const ben = beneficiariesList.find(b => b.id == t.beneficiarioId);
        
        const catName = cat ? cat.nombre : 'Desconocida';
        const benName = ben ? ben.nombre : 'Generico';
        
        const type = cat && cat.tipo ? cat.tipo : t.tipo;
        const isIngreso = type === 'INGRESO';
        
        const typeEl = isIngreso 
            ? `<span class="flex items-center gap-2 text-secondary font-semibold text-xs py-1 px-3 bg-secondary-container/30 rounded-full w-fit"><span class="material-symbols-outlined text-sm">arrow_downward</span>Ingreso</span>`
            : `<span class="flex items-center gap-2 text-tertiary font-semibold text-xs py-1 px-3 bg-tertiary-container/10 rounded-full w-fit"><span class="material-symbols-outlined text-sm">arrow_upward</span>Gasto</span>`;
            
        const amountEl = isIngreso
            ? `<span class="text-base font-bold text-secondary font-headline">+$${Number(t.monto).toFixed(2)}</span>`
            : `<span class="text-base font-bold text-tertiary font-headline">-$${Number(t.monto).toFixed(2)}</span>`;

        return `
        <tr class="hover:bg-surface-container-low transition-colors group">
            <td class="px-6 py-5">${typeEl}</td>
            <td class="px-6 py-5">
                <p class="font-bold text-on-surface">${benName}</p>
                <p class="text-xs text-on-surface-variant line-clamp-1">${t.descripcion || ''}</p>
            </td>
            <td class="px-6 py-5"><span class="text-sm font-medium text-on-surface-variant">${catName}</span></td>
            <td class="px-6 py-5"><span class="text-sm text-on-surface-variant">${formatDate(t.fecha)}</span></td>
            <td class="px-6 py-5 text-right">${amountEl}</td>
        </tr>`;
    }

    function renderTable(transactions) {
        tList.innerHTML = '';
        if (transactions.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            tList.innerHTML = transactions.map(renderTransactionRow).join('');
        }
    }

    async function loadDependenciesAndData() {
        const [catRes, benRes, transRes] = await Promise.all([
            api.get('/categorias'),
            api.get('/beneficiarios'),
            api.get('/transactions')
        ]);

        if (catRes.success) categoriesList = catRes.data.filter(c => c.workspaceId == workspaceId);
        if (benRes.success) beneficiariesList = benRes.data.filter(b => b.workspaceId == workspaceId);
        if (transRes.success) allTransactions = transRes.data.filter(t => t.workspaceId == workspaceId);

        if (categoriesList.length === 0) {
            selCategory.innerHTML = '<option value="">No hay categorías</option>';
            filterCategorySelect.innerHTML = '<option value="">Sin Categorías</option>';
            btnSubmit.disabled = true;
        } else {
            btnSubmit.disabled = false;
            selCategory.innerHTML = '<option value="">Selecciona Categoría</option>' + 
                categoriesList.map(c => `<option value="${c.id}" data-type="${c.tipo}">${c.nombre} (${c.tipo})</option>`).join('');
                
            filterCategorySelect.innerHTML = '<option value="">Todas las Categorías</option>' + 
                categoriesList.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
        }

        if (beneficiariesList.length === 0) {
            selBeneficiary.innerHTML = '<option value="">Debes crear beneficiarios</option>';
            btnSubmit.disabled = true;
        } else {
            selBeneficiary.innerHTML = '<option value="">Selecciona Beneficiario</option>' + 
                beneficiariesList.map(b => `<option value="${b.id}">${b.nombre}</option>`).join('');
        }

        renderTable(allTransactions);
    }

    btnOpenModal.addEventListener('click', () => {
        if (categoriesList.length === 0 || beneficiariesList.length === 0) {
            showAlert('Requisito: necesitas tener definidos al menos 1 Categoría y 1 Beneficiario.', false);
            return;
        }
        modal.classList.remove('hidden');
        inputDate.valueAsDate = new Date(); // default hoy
    });

    btnCloseModal.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
        modalAlert.classList.add('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const monto = Number(inputAmount.value);
        const categoriaId = Number(selCategory.value);
        const beneficiarioId = Number(selBeneficiary.value);
        const fecha = inputDate.value;
        const descripcion = inputDesc.value.trim();

        if (monto <= 0 || !categoriaId || !beneficiarioId) {
            showAlert('Por favor llena todos los campos correctamente.', false, modalAlert);
            return;
        }

        const selectedOption = selCategory.options[selCategory.selectedIndex];
        const tipo = selectedOption.getAttribute('data-type'); 

        const originalText = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Trasnferiendo...';

        const payload = { monto, categoriaId, beneficiarioId, tipo, fecha, descripcion, workspaceId: Number(workspaceId) };
        const res = await api.post('/transactions', payload);

        btnSubmit.disabled = false;
        btnSubmit.textContent = originalText;

        if (res.success) {
            showAlert('Movimiento registrado.', true, pageAlert);
            modal.classList.add('hidden');
            form.reset();
            loadDependenciesAndData();
        } else {
            showAlert(res.error || 'Error al guardar.', false, modalAlert);
        }
    });

    btnFilter.addEventListener('click', () => {
        const catFilter = filterCategorySelect.value;
        const dateFilter = filterDateInput.value;
        
        const filtered = allTransactions.filter(t => {
            let matchesCat = true;
            let matchesDate = true;
            if (catFilter) matchesCat = t.categoriaId == catFilter;
            if (dateFilter) matchesDate = String(t.fecha).startsWith(dateFilter);
            return matchesCat && matchesDate;
        });

        renderTable(filtered);
    });

    btnClearFilter.addEventListener('click', () => {
        filterCategorySelect.value = '';
        filterDateInput.value = '';
        renderTable(allTransactions);
    });

    loadDependenciesAndData();
});
