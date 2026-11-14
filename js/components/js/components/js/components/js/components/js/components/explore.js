/* ========================================================================= */
/* ÖG EXPLORE COMPONENT - Cuadrícula de Exploración y Búsqueda               */
/* ========================================================================= */

import { sanitizeHtml } from '../utils/helpers.js';

export function renderExploreContainer(containerEl, posts, onPostClick) {
  if (!containerEl) return;
  containerEl.innerHTML = '';

  const searchBar = document.createElement('div');
  searchBar.className = 'explore-search-bar';
  searchBar.style.padding = '12px 16px';
  searchBar.innerHTML = `
    <input type="text" id="exploreSearchInput" placeholder="Buscar publicaciones..." class="explore-input" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid var(--og-border, #dbdbdb); background: var(--og-bg-secondary, #fafafa); font-size: 14px; outline: none;">
  `;
  containerEl.append(searchBar);

  const grid = document.createElement('div');
  grid.className = 'explore-grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  grid.style.gap = '2px';

  if (!posts || posts.length === 0) {
    const empty = document.createElement('div');
    empty.style.gridColumn = 'span 3';
    empty.style.padding = '40px';
    empty.style.textAlign = 'center';
    empty.style.color = 'var(--og-text-muted, #71717a)';
    empty.textContent = 'No hay publicaciones para mostrar en Explorar.';
    grid.append(empty);
  } else {
    posts.forEach(post => {
      if (!post.image_url) return;
      const item = document.createElement('div');
      item.className = 'explore-grid-item';
      item.style.position = 'relative';
      item.style.width = '100%';
      item.style.paddingBottom = '100%'; // Relación de aspecto 1:1 estilo Instagram
      item.style.backgroundImage = `url('${post.image_url}')`;
      item.style.backgroundSize = 'cover';
      item.style.backgroundPosition = 'center';
      item.style.cursor = 'pointer';

      item.addEventListener('click', () => {
        if (onPostClick) onPostClick(post);
      });
      grid.append(item);
    });
  }

  containerEl.append(grid);
}

