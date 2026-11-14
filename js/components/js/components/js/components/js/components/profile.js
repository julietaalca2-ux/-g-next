/* ========================================================================= */
/* ÖG PROFILE COMPONENT - Renderizado de Cabecera, Biografía y Cuadrícula    */
/* ========================================================================= */

import { sanitizeHtml } from '../utils/helpers.js';

export function renderProfileHeaderMarkup(profile, counts, isMyProfile, isFollowing) {
  if (!profile) return '';

  const avatarUrl = profile.avatar_url || '';
  const coverUrl = profile.cover_url || '';
  const displayName = sanitizeHtml(profile.display_name || profile.username || 'Usuario');
  const username = sanitizeHtml(profile.username || '');
  const bio = sanitizeHtml(profile.bio || '');

  return `
    <div class="profile-cover" style="${coverUrl ? `background-image: url('${coverUrl}')` : ''}"></div>
    <div class="profile-info-container">
      <div class="profile-avatar-row">
        <div class="profile-avatar-large">
          ${avatarUrl ? `<img src="${avatarUrl}" alt="Avatar">` : '<div style="font-size:32px">👤</div>'}
        </div>
        <div class="profile-stats-row">
          <div class="profile-stat-item">
            <span class="stat-num" id="profilePostsCount">${counts.postsCount}</span>
            <span class="stat-label">publicaciones</span>
          </div>
          <div class="profile-stat-item" id="openFollowersListBtn" style="cursor:pointer">
            <span class="stat-num" id="profileFollowersCount">${counts.followersCount}</span>
            <span class="stat-label">seguidores</span>
          </div>
          <div class="profile-stat-item" id="openFollowingListBtn" style="cursor:pointer">
            <span class="stat-num" id="profileFollowingCount">${counts.followingCount}</span>
            <span class="stat-label">seguidos</span>
          </div>
        </div>
      </div>

      <div class="profile-names">
        <h2 class="profile-display-name">${displayName}</h2>
        <span class="profile-username">@${username}</span>
      </div>

      ${bio ? `<p class="profile-bio">${bio}</p>` : ''}

      <div class="profile-actions-row">
        ${isMyProfile ? `
          <button class="profile-action-btn primary" id="editProfileBtn">Editar perfil</button>
        ` : `
          <button class="profile-action-btn ${isFollowing ? '' : 'primary'}" id="followUserBtn">
            ${isFollowing ? 'Siguiendo' : 'Seguir'}
          </button>
          <button class="profile-action-btn" id="messageUserBtn">Mensaje</button>
        `}
      </div>
    </div>
  `;
}

