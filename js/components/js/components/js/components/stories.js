/* ========================================================================= */
/* ÖG STORIES COMPONENT - Renderizado de Carrusel de Historias y Estados     */
/* ========================================================================= */

import { createAvatarNode } from '../utils/dom.js';

export function renderStoriesContainer(containerEl, activeStoriesMap, storyUserOrder, currentUserId, onStoryClick) {
  if (!containerEl) return;
  containerEl.innerHTML = '';

  // Burbuja de Mi Historia / Crear Historia
  const myWrap = document.createElement('div');
  myWrap.className = 'story-item';
  myWrap.style.cursor = 'pointer';

  const myAvatar = createAvatarNode({ id: currentUserId, avatar_url: null }, false, {});
  myAvatar.classList.add('my-story-ring');
  
  const label = document.createElement('span');
  label.className = 'story-username';
  label.textContent = 'Tu historia';

  myWrap.append(myAvatar, label);
  myWrap.addEventListener('click', () => onStoryClick('mine'));
  containerEl.append(myWrap);

  // Renderizar historias de usuarios seguidos
  storyUserOrder.forEach(userId => {
    const userStories = activeStoriesMap[userId];
    if (!userStories || !userStories.length) return;

    const firstStory = userStories[0];
    const profile = firstStory.profiles || { username: 'usuario', avatar_url: null };

    const item = document.createElement('div');
    item.className = 'story-item';
    item.style.cursor = 'pointer';

    const avatarNode = createAvatarNode(profile, true, {});
    const nameSpan = document.createElement('span');
    nameSpan.className = 'story-username';
    nameSpan.textContent = profile.username || 'usuario';

    item.append(avatarNode, nameSpan);
    item.addEventListener('click', () => onStoryClick(userId));
    containerEl.append(item);
  });
}

