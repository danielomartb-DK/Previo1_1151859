/**
 * NexusPay — Mobile Navigation
 * Se auto-inyecta en todas las páginas: crea el botón hamburguesa,
 * el overlay y maneja la apertura/cierre del sidebar.
 */
(function () {

    /* ── Estilos del menú móvil ───────────────────────────────── */
    const style = document.createElement('style');
    style.textContent = `
        /* En móvil, el aside empieza fuera de pantalla */
        @media (max-width: 767px) {
            aside {
                display: flex !important;
                transform: translateX(-100%);
                transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 9900 !important;
                box-shadow: 4px 0 30px rgba(0,0,0,0.6);
            }
            aside.mobile-open {
                transform: translateX(0);
            }
            main {
                margin-left: 0 !important;
            }
        }

        /* Overlay oscuro */
        #nx-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.65);
            z-index: 9800;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        #nx-overlay.visible {
            display: block;
            opacity: 1;
        }

        /* Botón hamburguesa */
        #nx-hamburger {
            display: none;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: #1E293B;
            border: 1px solid #334155;
            color: #94A3B8;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            flex-shrink: 0;
        }
        #nx-hamburger:hover { background: #263548; color: #F8FAFC; }

        @media (max-width: 767px) {
            #nx-hamburger { display: flex; }
        }
    `;
    document.head.appendChild(style);

    /* ── Crear overlay ────────────────────────────────────────── */
    const overlay = document.createElement('div');
    overlay.id = 'nx-overlay';
    document.body.appendChild(overlay);

    /* ── Crear botón hamburguesa e inyectarlo en el header ────── */
    const hamburger = document.createElement('button');
    hamburger.id = 'nx-hamburger';
    hamburger.setAttribute('aria-label', 'Abrir menú');
    hamburger.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px">menu</span>';
    hamburger.style.order = '-1'; // Va al inicio del header

    const header = document.querySelector('header');
    if (header) {
        header.style.display = 'flex';
        header.style.alignItems = 'center';
        header.style.gap = '12px';
        header.insertBefore(hamburger, header.firstChild);
    }

    /* ── Lógica de apertura/cierre ────────────────────────────── */
    const aside = document.querySelector('aside');

    function openMenu() {
        aside?.classList.add('mobile-open');
        overlay.style.display = 'block';
        // Forzar reflow para reanimar opacity
        overlay.getBoundingClientRect();
        overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        aside?.classList.remove('mobile-open');
        overlay.classList.remove('visible');
        document.body.style.overflow = '';
        setTimeout(() => { overlay.style.display = 'none'; }, 260);
    }

    hamburger.addEventListener('click', openMenu);
    overlay.addEventListener('click', closeMenu);

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });

    // Cerrar al hacer click en un link del sidebar (navegación)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('aside a');
        if (link) closeMenu();
    });

})();
