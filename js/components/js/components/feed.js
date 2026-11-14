/* ========================================================================= */
/* ÖG FEED COMPONENT - Renderizado de Publicaciones, Acciones y Tarjetas     */
/* ========================================================================= */

import { sanitizeHtml } from '../utils/helpers.js';
import { formatDate } from '../utils/dates.js';

export function createPostCardElement(post, currentUserId, callbacks) {
  const { onLike, onCommentClick, onProfileClick, onShare } = callbacks || {};

  const card = document.createElement('article');
  card.className = 'post-card';
  card.dataset.postId = post.id;

  const profile = post.profiles || { username: 'usuario', avatar_url: null };

  // Cabecera del post
  const header = document.createElement('div');
  header.className = 'post-header';

  const userMeta = document.createElement('div');
  userMeta.className = 'post-user-meta';
  userMeta.style.cursor = 'pointer';

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'story-avatar-container';
  avatarDiv.style.width = '36px';
  avatarDiv.style.height = '36px';
  avatarDiv.style.minWidth = '36px';

  const avatarInner = document.createElement('div');
  avatarInner.className = 'story-avatar-inner';
  if (profile.avatar_url) {
    const img = document.createElement('img');
    img.src = profile.avatar_url;
    img.alt = profile.username;
    avatarInner.append(img);
  } else {
    avatarInner.textContent = '👤';
  }
  avatarDiv.append(avatarInner);

  const nameSpan = document.createElement('span');
  nameSpan.className = 'post-username';
  nameSpan.textContent = profile.username || 'usuario';

  userMeta.append(avatarDiv, nameSpan);
  if (onProfileClick) {
    userMeta.addEventListener('click', () => onProfileClick(post.user_id));
  }

  header.append(userMeta);
  card.append(header);

  // Imagen multimedia de la publicación (si existe)
  if (post.image_url) {
    const mediaContainer = document.createElement('div');
    mediaContainer.className = 'post-media-container';
    const mediaImg = document.createElement('img');
    mediaImg.src = post.image_url;
    mediaImg.alt = 'Publicación';
    mediaImg.loading = 'lazy';
    mediaContainer.append(mediaImg);
    card.append(mediaContainer);
  }

  // Barra de acciones (Me gusta, Comentar, Compartir)
  const actionsBar = document.createElement('div');
  actionsBar.className = 'post-actions-bar';

  const leftActions = document.createElement('div');
  leftActions.className = 'post-actions-left';

  // Botón Me Gusta
  const likeBtn = document.createElement('button');
  likeBtn.className = 'post-action-btn like-btn' + (post.isLikedByMe ? ' active' : '');
  likeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="${post.isLikedByMe ? 'currentColor' : 'none'}" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
    <span class="likes-count">${post.likes_count || 0}</span>
  `;
  if (onLike) {
    likeBtn.addEventListener('click', () => onLike(post.id, likeBtn));
  }

  // Botón Comentarios
  const commentBtn = document.createElement('button');
  commentBtn.className = 'post-action-btn';
  commentBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>${post.comments_count || 0}</span>
  `;
  if (onCommentClick) {
    commentBtn.addEventListener('click', () => onCommentClick(post));
  }

  leftActions.append(likeBtn, commentBtn);
  actionsBar.append(leftActions);
  card.append(actionsBar);

  // Contenido de texto y pie de publicación
  if (post.content) {
    const contentDiv = document.createElement('div');
    contentDiv.className = 'post-content';
    contentDiv.innerHTML = `<strong>${sanitizeHtml(profile.username)}</strong> ${sanitizeHtml(post.content)}`;
    card.append(contentDiv);
  }

  // Fecha y vistas
  const footerMeta = document.createElement('div');
  footerMeta.className = 'post-footer-meta';
  footerMeta.style.padding = '0 16px 12px 16px';
  footerMeta.style.fontSize = '11px';
  footerMeta.style.color = 'var(--og-text-muted, #71717a)';
  footerMeta.textContent = `${formatDate(post.created_at)} • ${post.views_count || 0} vistas`;
  card.append(footerMeta);

  return card;
}

