/* ========================================================================= */
/* ÖG DOM UTILS - Manipulación y Creación de Elementos y Avatares            */
/* ========================================================================= */

export function status(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

export function createAvatarNode(profile, isStoryActive = false, onlineUsersMap = {}) {
  const container = document.createElement('div');
  container.className = 'story-avatar-container' + (isStoryActive ? ' has-active-story' : '');

  const inner = document.createElement('div');
  inner.className = 'story-avatar-inner';

  if (profile?.avatar_url) {
    const img = document.createElement('img');
    img.src = profile.avatar_url;
    img.alt = 'Avatar';
    img.loading = 'lazy';
    inner.append(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.style.fontSize = '20px';
    placeholder.textContent = '👤';
    inner.append(placeholder);
  }
  container.append(inner);

  const dot = document.createElement('span');
  dot.className = 'online-dot';
  if (profile?.id && onlineUsersMap[profile.id]) {
    dot.classList.add('active');
  }
  dot.id = `online-dot-${profile?.id}`;
  container.append(dot);

  return container;
}

