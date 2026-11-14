/* ========================================================================= */
/* ÖG ACTIVITY COMPONENT - Renderizado de Notificaciones y Eventos           */
/* ========================================================================= */

import { sanitizeHtml } from '../utils/helpers.js';
import { formatDate } from '../utils/dates.js';

export function renderActivityItemElement(item, profile, type, onClick) {
  const el = document.createElement('div');
  el.className = 'activity-item';

  const avatarContainer = document.createElement('div');
  avatarContainer.className = 'story-avatar-container';
  avatarContainer.style.width = '42px';
  avatarContainer.style.height = '42px';
  avatarContainer.style.minWidth = '42px';

  const avatarInner = document.createElement('div');
  avatarInner.className = 'story-avatar-inner';
  if (profile?.avatar_url) {
    const img = document.createElement('img');
    img.src = profile.avatar_url;
    img.alt = profile.username;
    avatarInner.append(img);
  } else {
    avatarInner.textContent = '👤';
  }
  avatarContainer.append(avatarInner);

  const infoDiv = document.createElement('div');
  infoDiv.className = 'activity-info';

  const username = sanitizeHtml(profile?.username || 'Alguien');
  let text = '';

  if (type === 'follow') {
    text = `<strong>@${username}</strong> comenzó a seguirte.`;
  } else if (type === 'like' || type === 'story_like') {
    text = `<strong>@${username}</strong> le dio me gusta a tu ${type === 'story_like' ? 'historia' : 'publicación'}.`;
  } else if (type === 'comment') {
    text = `<strong>@${username}</strong> comentó: "${sanitizeHtml(item.content || '')}"`;
  }

  infoDiv.innerHTML = `
    <div>${text}</div>
    <div class="activity-date">${formatDate(item.created_at)}</div>
  `;

  el.append(avatarContainer, infoDiv);

  if (onClick) {
    el.addEventListener('click', () => onClick(item, type));
  }

  return el;
}

