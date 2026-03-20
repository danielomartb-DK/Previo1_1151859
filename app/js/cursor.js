/**
 * NexusPay — Custom Cursor
 * Fluido, discreto y profesional. Solo se activa en escritorio.
 */
(function () {
    // No inicializar en dispositivos táctiles
    if (window.matchMedia('(pointer: coarse)').matches) return;

    /* ── Crear elementos ─────────────────────────────────────── */
    const dot   = document.createElement('div');
    const ring  = document.createElement('div');
    dot.id  = 'nx-cursor-dot';
    ring.id = 'nx-cursor-ring';

    /* ── Estilos dinámicos ───────────────────────────────────── */
    const style = document.createElement('style');
    style.textContent = `
        *, *::before, *::after { cursor: none !important; }

        #nx-cursor-dot {
            position: fixed;
            width: 8px; height: 8px;
            border-radius: 50%;
            background: #3B82F6;
            pointer-events: none;
            z-index: 99999;
            transform: translate(-50%, -50%);
            transition: transform 0.1s ease, background 0.2s ease, width 0.2s ease, height 0.2s ease;
            will-change: transform;
        }

        #nx-cursor-ring {
            position: fixed;
            width: 32px; height: 32px;
            border-radius: 50%;
            border: 1.5px solid rgba(59, 130, 246, 0.55);
            pointer-events: none;
            z-index: 99998;
            transform: translate(-50%, -50%);
            transition: width 0.25s ease, height 0.25s ease, border-color 0.25s ease, opacity 0.25s ease;
            will-change: transform;
        }

        /* Hover state */
        #nx-cursor-dot.hover {
            width: 12px; height: 12px;
            background: #60A5FA;
            box-shadow: 0 0 12px rgba(96, 165, 250, 0.6);
        }
        #nx-cursor-ring.hover {
            width: 46px; height: 46px;
            border-color: rgba(96, 165, 250, 0.4);
            opacity: 0.8;
        }

        /* Click state */
        #nx-cursor-dot.clicking {
            transform: translate(-50%, -50%) scale(0.7);
        }
        #nx-cursor-ring.clicking {
            width: 26px; height: 26px;
            opacity: 0.5;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    /* ── Posición suavizada del ring con lerp ────────────────── */
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    const LERP = 0.12; // 0–1: más bajo = más retraso

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // El dot sigue inmediatamente
        dot.style.left  = mouseX + 'px';
        dot.style.top   = mouseY + 'px';
    });

    // El ring tiene suave seguimiento con requestAnimationFrame
    function animateRing() {
        ringX += (mouseX - ringX) * LERP;
        ringY += (mouseY - ringY) * LERP;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    /* ── Hover en elementos interactivos ─────────────────────── */
    const HOVER_SELECTORS = 'a, button, [role="button"], input, select, textarea, .transaction-card, label, [data-action]';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(HOVER_SELECTORS)) {
            dot.classList.add('hover');
            ring.classList.add('hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(HOVER_SELECTORS)) {
            dot.classList.remove('hover');
            ring.classList.remove('hover');
        }
    });

    /* ── Feedback de click ───────────────────────────────────── */
    document.addEventListener('mousedown', () => {
        dot.classList.add('clicking');
        ring.classList.add('clicking');
    });

    document.addEventListener('mouseup', () => {
        dot.classList.remove('clicking');
        ring.classList.remove('clicking');
    });

    /* ── Ocultar al salir de la ventana ─────────────────────── */
    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
    });
})();
