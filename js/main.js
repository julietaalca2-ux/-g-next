
/* ========================================================================= */
/* ÖG MAIN ENTRY POINT - ES MODULES                                         */
/* ========================================================================= */

import { initRouter } from './core/router.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Iniciando ÖG...');

        // Inicializar navegación principal
        initRouter();

        console.log('✅ ÖG inicializado correctamente.');

    } catch (error) {
        console.error('❌ Error crítico al iniciar ÖG:', error);
        showErrorBanner(error.message);
    }
});

/* Aviso de errores críticos */
function showErrorBanner(message) {
    const mainContent = document.getElementById('mainContent');

    if (!mainContent) return;

    const container = document.createElement('div');
    container.style.cssText =
        'padding:30px;text-align:center;color:#262626;font-family:-apple-system,sans-serif;';

    const title = document.createElement('h3');
    title.textContent = '⚠️ Error al iniciar ÖG';

    const description = document.createElement('p');
    description.textContent = message;
    description.style.fontSize = '14px';

    const retryButton = document.createElement('button');
    retryButton.textContent = 'Reintentar';
    retryButton.style.cssText =
        'padding:10px 20px;background:#0095f6;color:white;border:0;border-radius:8px;font-weight:bold;';

    retryButton.addEventListener('click', () => {
        window.location.reload();
    });

    container.append(title, description, retryButton);

    mainContent.replaceChildren(container);
}
