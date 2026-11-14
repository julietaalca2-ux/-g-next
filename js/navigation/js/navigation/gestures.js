/* ========================================================================= */
/* ÖG GESTURES - Navegación Gestual y Deslizamiento Táctil Estilo Instagram  */
/* ========================================================================= */

import { switchTab } from '../core/router.js';

export function initSwipeGestures() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const mainContainer = document.querySelector('main');
  if (!mainContainer) return;

  mainContainer.addEventListener('touchstart', e => {
    // Si estamos scrolleando horizontalmente en algún contenedor interno, ignorar
    if (e.target.closest('.stories-container, .explore-grid')) return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  mainContainer.addEventListener('touchend', e => {
    if (e.target.closest('.stories-container, .explore-grid')) return;
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
  }, { passive: true });

  function handleSwipeGesture() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Verificar que el movimiento sea principalmente horizontal y supere el umbral
    if (Math.abs(diffX) > 80 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      const activePage = document.querySelector('main > div.active');
      if (!activePage) return;
      const activeId = activePage.id.replace('Page', '');

      const tabsOrder = ['home', 'explore', 'create', 'activity', 'profile'];
      const currentIndex = tabsOrder.indexOf(activeId);

      if (currentIndex === -1) return;

      if (diffX < 0 && currentIndex < tabsOrder.length - 1) {
        // Deslizar a la izquierda -> Siguiente pestaña
        switchTab(tabsOrder[currentIndex + 1], 'right');
      } else if (diffX > 0 && currentIndex > 0) {
        // Deslizar a la derecha -> Pestaña anterior (Ej: de perfil a inicio)
        switchTab(tabsOrder[currentIndex - 1], 'left');
      }
    }
  }
}

