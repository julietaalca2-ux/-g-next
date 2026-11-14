/* ========================================================================= */
/* ÖG MAIN ENTRY POINT - ES MODULES (BLINDADO CONTRA PANTALLAS NEGRAS)       */
/* ========================================================================= */

import { AppState } from './core/state.js';
import { initRouter } from './core/router.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Iniciando ÖG...');

        // 1. Inicializar la navegación inferior (cambio de pestañas)
        initNavigationTabs();

        // 2. Intentar inicializar el enrutador si existe
        if (typeof initRouter === 'function') {
            initRouter();
        }

        console.log('✅ ÖG inicializado correctamente.');
    } catch (error) {
        console.error('❌ Error crítico al iniciar ÖG:', error);
        showErrorBanner(error.message);
    }
});

/**
 * Controla el cambio de pestañas de la barra inferior estilo Instagram
 */
function initNavigationTabs() {
    const navButtons = document.querySelectorAll('.bottom-nav-item');
    const views = document.querySelectorAll('.page-view');

    if (!navButtons.length || !views.length) {
        console.warn('⚠️ No se encontraron elementos de navegación o vistas en el DOM.');
        return;
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            if (!targetTab) return;

            // Actualizar botón activo en la barra inferior
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Mostrar la vista correspondiente y ocultar las demás
            views.forEach(view => {
                // Compara con el ID de la vista (ej: homePage, explorePage, etc.)
                if (view.id.toLowerCase().includes(targetTab.toLowerCase())) {
                    view.style.display = 'block';
                    view.classList.add('active');
                } else {
                    view.style.display = 'none';
                    view.classList.remove('active');
                }
            });
        });
    });
}

/**
 * Muestra un aviso visual en pantalla si ocurre un error grave de ejecución
 */
function showErrorBanner(message) {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = `
            <div style="padding: 30px; color: #ff4d4d; text-align: center; font-family: -apple-system, sans-serif;">
                <h3 style="margin-bottom: 10px;">⚠️ Error al iniciar la app</h3>
                <p style="font-size: 14px; color: #aaa; margin-bottom: 20px;">${message}</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background: #fff; color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }
}
