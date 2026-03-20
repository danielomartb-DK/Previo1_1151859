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
    
    const modal = document.getElementById('transaction-modal');
    const btnOpenModal = document.getElementById('btn-open-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const form = document.getElementById('transaction-form');
    
    const filterCategorySelect = document.getElementById('filter-category');
    const filterDateInput = document.getElementById('filter-date');
    const btnFilter = document.getElementById('btn-filter');
    const btnClearFilter = document.getElementById('btn-clear-filter');

    const selCategory = document.getElementById('t-category');
    const selBeneficiary = document.getElementById('t-beneficiary');
    const inputAmount = document.getElementById('t-amount');
    const inputDate = document.getElementById('t-date');
    const inputDesc = document.getElementById('t-desc');
    const btnSubmit = document.getElementById('btn-submit');

    let categoriesList = [];
    let beneficiariesList = [];
    let allTransactions = [];
    let defaultTarjetaId = null;

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
            ? `<span class="flex items-center gap-1.5 text-emerald-400 font-medium text-xs"><span class="material-symbols-outlined text-[16px]">arrow_downward</span>Ingreso</span>`
            : `<span class="flex items-center gap-1.5 text-textmuted font-medium text-xs"><span class="material-symbols-outlined text-[16px]">arrow_upward</span>Gasto</span>`;
            
        const fmtMonto = Number(t.monto).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const amountEl = isIngreso
            ? `<span class="text-[15px] font-semibold text-emerald-400 tracking-tight tabular-nums">+$${fmtMonto}</span>`
            : `<span class="text-[15px] font-semibold text-white tracking-tight tabular-nums">-$${fmtMonto}</span>`;

        return `
        <tr class="hover:bg-elevated/40 transition-colors group">
            <td class="px-6 py-4">${typeEl}</td>
            <td class="px-6 py-4">
                <p class="font-semibold text-sm text-white">${benName}</p>
                <p class="text-xs text-textmuted line-clamp-1 mt-0.5">${t.descripcion || ''}</p>
            </td>
            <td class="px-6 py-4"><span class="text-xs font-medium text-textmuted bg-elevated/50 px-2.5 py-1 rounded-md border border-bordercolor">${catName}</span></td>
            <td class="px-6 py-4"><span class="text-xs text-textmuted">${formatDate(t.fecha)}</span></td>
            <td class="px-6 py-4 text-right">${amountEl}</td>
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
        const [catRes, benRes, transRes, tarRes] = await Promise.all([
            api.get('/categorias?workspaceId=' + workspaceId),
            api.get('/beneficiarios?workspaceId=' + workspaceId),
            api.get('/transactions?workspaceId=' + workspaceId),
            api.get('/credit-cards?workspaceId=' + workspaceId)
        ]);

        if (catRes.success) categoriesList = catRes.data;
        if (benRes.success) beneficiariesList = benRes.data;
        if (transRes.success) allTransactions = transRes.data;

        let tarjetasData = tarRes.success && Array.isArray(tarRes.data) ? tarRes.data : [];
        if (tarjetasData.length === 0) {
            const postTarjeta = await api.post('/credit-cards', {
                nombre: "Billetera Virtual Principal",
                bancoEmisor: "NexusBank",
                ultimosCuatro: "0000",
                limiteCredito: 999999999,
                colorHex: "#3B82F6",
                workspaceId: Number(workspaceId)
            });
            if (postTarjeta.success && postTarjeta.data) {
                defaultTarjetaId = postTarjeta.data.id;
            }
        } else {
            defaultTarjetaId = tarjetasData[0].id;
        }

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
        inputDate.valueAsDate = new Date(); 
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

        if (monto <= 0 || !categoriaId || !beneficiarioId || !defaultTarjetaId) {
            showAlert('Por favor llena todos los campos o espera a que se inicie tu billetera segura.', false, modalAlert);
            return;
        }

        const selectedOption = selCategory.options[selCategory.selectedIndex];
        const tipo = selectedOption.getAttribute('data-type'); 

        const originalText = btnSubmit.textContent;
        btnSubmit.disabled = true;
        btnSubmit.textContent = 'Transfiriendo...';

        const payload = { monto, categoriaId, beneficiarioId, tipo, fecha, descripcion, workspaceId: Number(workspaceId), tarjetaCreditoId: defaultTarjetaId, medioPago: 'TARJETA' };
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
