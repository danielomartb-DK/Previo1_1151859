// beneficiaries.js
import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    const workspaceId = localStorage.getItem('workspaceId');
    if (!workspaceId) {
        window.location.href = 'dashboard.html'; 
        return;
    }

    const beneficiariesList = document.getElementById('beneficiaries-list');
    const emptyState = document.getElementById('empty-state');
    const pageAlert = document.getElementById('page-alert');
    const form = document.getElementById('beneficiary-form');

    function showAlert(msg, isSuccess = true) {
        pageAlert.textContent = msg;
        pageAlert.className = `p-4 mb-4 text-sm rounded-lg ${isSuccess ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'}`;
        pageAlert.classList.remove('hidden');
        setTimeout(() => pageAlert.classList.add('hidden'), 3500);
    }

    async function loadBeneficiaries() {
        const res = await api.get('/beneficiarios?workspaceId=' + workspaceId);
        beneficiariesList.innerHTML = '';
        
        if (res.success && Array.isArray(res.data)) {
            const list = res.data.filter(b => b.workspaceId == workspaceId);
            if (list.length === 0) {
                emptyState.classList.remove('hidden');
            } else {
                emptyState.classList.add('hidden');
                list.forEach(ben => {
                    const div = document.createElement('div');
                    div.className = "p-5 border border-bordercolor/50 rounded-xl hover:border-primary/50 transition-colors flex items-center justify-between";
                    div.innerHTML = `
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-textmuted">
                                <span class="material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <h4 class="font-poppins font-bold text-white text-sm">${ben.nombre}</h4>
                            </div>
                        </div>
                    `;
                    beneficiariesList.appendChild(div);
                });
            }
        } else {
            console.error('Error cargando beneficiarios', res);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('ben-name');
        // El input desc existe en UI pero el DB no lo requiere, lo ignoraremos para salvar a la DB
        const name = nameInput.value.trim();

        if (!name) {
            showAlert('El nombre es obligatorio', false);
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const prevText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const payload = { nombre: name, workspaceId: parseInt(workspaceId) };
        const res = await api.post('/beneficiarios', payload);

        btn.disabled = false;
        btn.textContent = prevText;

        if (res.success) {
            showAlert('Beneficiario agregado exitosamente.');
            form.reset();
            loadBeneficiaries();
        } else {
            showAlert(res.error || 'Ocurrió un error', false);
        }
    });

    loadBeneficiaries();
});
