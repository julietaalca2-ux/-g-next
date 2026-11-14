
/* ========================================================================= */
/* ÖG ROUTER - Navegación principal y transiciones                           */
/* ========================================================================= */

const tabsOrder = ['home', 'explore', 'create', 'activity', 'profile'];

let routerInitialized = false;

export function switchTab(targetTabId, direction = 'auto') {
    if (!tabsOrder.includes(targetTabId)) return;

    const targetElement = document.getElementById(`${targetTabId}Page`);
    if (!targetElement) return;

    const currentActive = document.querySelector('main .page-view.active');

    const currentTabId = currentActive?.id?.replace('Page', '') || 'home';

    const currentIndex = tabsOrder.indexOf(currentTabId);
    const targetIndex = tabsOrder.indexOf(targetTabId);

    let animationClass = '';

    if (
        direction === 'right' ||
        (direction === 'auto' && targetIndex > currentIndex)
    ) {
        animationClass = 'swipe-enter-right';
    } else if (
        direction === 'left' ||
        (direction === 'auto' && targetIndex < currentIndex)
    ) {
        animationClass = 'swipe-enter-left';
    }

    // Ocultar todas las vistas principales
    tabsOrder.forEach(tab => {
        const page = document.getElementById(`${tab}Page`);

        if (page) {
            page.style.display = 'none';
            page.classList.remove(
                'active',
                'swipe-enter-right',
                'swipe-enter-left'
            );
        }
    });

    // Mostrar la vista seleccionada
    targetElement.style.display = 'block';
    targetElement.classList.add('active');

    // Aplicar transición
    if (animationClass) {
        targetElement.classList.add(animationClass);

        targetElement.addEventListener('animationend', () => {
            targetElement.classList.remove(animationClass);
        }, { once: true });

        // Respaldo por si el evento de animación no se dispara
        setTimeout(() => {
            targetElement.classList.remove(animationClass);
        }, 400);
    }

    // Actualizar navegación inferior
    document.querySelectorAll('.bottom-nav-item').forEach(button => {
        const isActive = button.dataset.tab === targetTabId;

        button.classList.toggle('active', isActive);
        button.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    window.scrollTo({
        top: 0,
        behavior: 'instant'
    });
}

/* Inicialización del router */
export function initRouter() {
    if (routerInitialized) return;

    routerInitialized = true;

    const navButtons = document.querySelectorAll('.bottom-nav-item');

    if (!navButtons.length) {
        console.warn('ÖG Router: no se encontró la navegación.');
        return;
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            if (targetTab) {
                switchTab(targetTab);
            }
        });
    });

    // Restaurar la vista inicial
    const initialPage =
        document.querySelector('main .page-view.active') ||
        document.getElementById('homePage');

    const initialTab = initialPage?.id?.replace('Page', '') || 'home';

    switchTab(initialTab, 'none');

    console.log('✅ ÖG Router iniciado.');
}
