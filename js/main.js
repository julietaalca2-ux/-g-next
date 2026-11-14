/* ========================================================================= */
/* ÖG MAIN - Punto de Entrada Principal, Inicialización y Control de Sesión  */
/* ========================================================================= */

import { db } from './services/supabase.js';
import { appState } from './core/state.js';
import { switchTab } from './core/router.js';
import { initSwipeGestures } from './navigation/gestures.js';
import { fetchUserProfile, fetchUserCounts } from './services/profileService.js';
import { fetchPostsPage, togglePostLike, registerPostView, createNewPost, fetchPostComments } from './services/postService.js';
import { fetchFollowingStories, fetchActiveStoriesForUser } from './services/storyService.js';
import { fetchUserConversations, fetchChatMessages, sendChatMessageRecord, markConversationAsReadRecord } from './services/chatService.js';
import { fetchUserActivityData, getLastSeenActivityTimestamp, setLastSeenActivityTimestamp } from './services/notificationService.js';
import { uploadMediaFile, compressImage } from './services/storageService.js';
import { renderStoriesContainer } from './components/storiesComponent.js';
import { createPostCardElement } from './components/feedComponent.js';
import { renderProfileHeaderMarkup } from './components/profileComponent.js';
import { renderConversationItem, renderChatBubbleElement } from './components/chatComponent.js';
import { renderActivityItemElement } from './components/activityComponent.js';
import { getOrCreateVisitorId } from './utils/images.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 ÖG v2.0 - Inicializando aplicación modular...');

  // 1. Inicializar gestos táctiles tipo Instagram
  initSwipeGestures();

  // 2. Comprobar sesión actual en Supabase
  const { data: { session } } = await db.auth.getSession();
  if (session?.user) {
    appState.currentUser = session.user;
    appState.myProfile = await fetchUserProfile(session.user.id);
  }

  // 3. Vincular navegación inferior (Bottom Navigation)
  document.querySelectorAll('.bottom-nav-item').forEach(nav => {
    nav.addEventListener('click', (e) => {
      const tab = nav.dataset.tab;
      if (tab) {
        switchTab(tab);
      }
    });
  });

  // 4. Cargar datos iniciales del feed y pestañas
  await initAppView();

  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('Error registrando Service Worker:', err);
    });
  }
});

async function initAppView() {
  // Cargar feed inicial si el usuario está autenticado o en modo invitado
  try {
    const posts = await fetchPostsPage(0);
    appState.cachedFeedPosts = posts;
    renderFeed(posts);
  } catch (e) {
    console.error('Error al cargar feed inicial:', e);
  }

  // Configurar eventos globales de botones y formularios
  setupGlobalEventListeners();
}

function renderFeed(posts) {
  const feedContainer = document.getElementById('feedContainer');
  if (!feedContainer) return;
  feedContainer.innerHTML = '';

  posts.forEach(post => {
    const card = createPostCardElement(post, appState.currentUser?.id, {
      onLike: async (postId, btnEl) => {
        if (!appState.currentUser) {
          alert('Debes iniciar sesión para dar Me Gusta.');
          return;
        }
        const res = await togglePostLike(postId, appState.currentUser.id);
        btnEl.classList.toggle('active', res.liked);
        const countSpan = btnEl.querySelector('.likes-count');
        if (countSpan) {
          const currentCount = parseInt(countSpan.textContent || '0', 10);
          countSpan.textContent = res.liked ? currentCount + 1 : Math.max(0, currentCount - 1);
        }
      },
      onCommentClick: (postObj) => {
        // Abrir modal de comentarios o desplegar sección
        console.log('Abrir comentarios para post:', postObj.id);
      },
      onProfileClick: (userId) => {
        loadUserProfileView(userId);
      }
    });
    feedContainer.append(card);
  });
}

async function loadUserProfileView(userId) {
  switchTab('profile');
  const profileContainer = document.getElementById('profilePageContainer');
  if (!profileContainer) return;

  const profile = await fetchUserProfile(userId);
  const counts = await fetchUserCounts(userId);
  const isMy = appState.currentUser?.id === userId;

  profileContainer.innerHTML = renderProfileHeaderMarkup(profile, counts, isMy, false);
}

function setupGlobalEventListeners() {
  // Manejadores adicionales de UI, modales y botones de acción rápida
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await db.auth.signOut();
      window.location.reload();
    });
  }
}

