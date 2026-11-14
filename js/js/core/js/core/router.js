/* ========================================================================= */
/* ÖG ROUTER - Navegación entre Pestañas, Transiciones y Historial Móvil    */
/* ========================================================================= */

const tabsOrder = ['home', 'explore', 'create', 'activity', 'profile'];

export function switchTab(targetTabId, direction = 'auto') {
  const currentActive = document.querySelector('main > div.active, main > div:not([style*="display: none"])');
  const targetElement = document.getElementById(targetTabId + 'Page');

  if (!targetElement) return;

  const currentIndex = tabsOrder.indexOf(currentActive?.id ? currentActive.id.replace('Page', '') : 'home');
  const targetIndex = tabsOrder.indexOf(targetTabId);

  let animClass = '';
  if (direction === 'right' || (direction === 'auto' && targetIndex > currentIndex)) {
    animClass = 'swipe-enter-right';
  } else if (direction === 'left' || (direction === 'auto' && targetIndex < currentIndex)) {
    animClass = 'swipe-enter-left';
  }

  // Ocultar todas las pestañas principales
  tabsOrder.forEach(t => {
    const el = document.getElementById(t + 'Page');
    if (el) {
      el.style.display = 'none';
      el.classList.remove('active', 'swipe-enter-right', 'swipe-enter-left');
    }
  });

  // Mostrar la pestaña seleccionada
  targetElement.style.display = 'flex';
  targetElement.classList.add('active');

  if (animClass) {
    targetElement.classList.add(animClass);
    setTimeout(() => {
      targetElement.classList.remove(animClass);
    }, 280);
  }

  // Actualizar barra de navegación inferior
  document.querySelectorAll('.bottom-nav-item').forEach(nav => {
    nav.classList.remove('active');
    if (nav.dataset.tab === targetTabId) {
      nav.classList.add('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'instant' });
}

