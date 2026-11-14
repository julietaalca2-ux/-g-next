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
import { renderExploreContainer } from './components/exploreComponent.js';
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
        handleTabNavigationLoad(tab);
      }
    });
  });

  // 4. Cargar datos iniciales del feed
  await initAppView();

  // Registrar Service Worker para PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(err => {
      console.warn('Error registrando Service Worker:', err);
    });
  }
});

async function initAppView() {
  try {
    const posts = await fetchPostsPage(0);
    appState.cachedFeedPosts = posts;
    renderFeed(posts);
  } catch (e) {
    console.error('Error al cargar feed inicial:', e);
  }

  setupGlobalEventListeners();
}

function handleTabNavigationLoad(tabId) {
  if (tabId === 'explore') {
    loadExploreView();
  } else if (tabId === 'create') {
    if (!appState.currentUser) {
      alert('Debes iniciar sesión para crear una publicación.');
      switchTab('home');
      return;
    }
    loadCreatePostView();
  } else if (tabId === 'activity') {
    if (!appState.currentUser) {
      alert('Debes iniciar sesión para ver tu actividad.');
      switchTab('home');
      return;
    }
    loadActivityView();
  } else if (tabId === 'profile') {
    if (appState.currentUser) {
      loadUserProfileView(appState.currentUser.id);
    } else {
      alert('Debes iniciar sesión para ver tu perfil.');
      switchTab('home');
    }
  }
}

async function loadExploreView() {
  const exploreContainer = document.getElementById('exploreContainer');
  if (!exploreContainer) return;

  try {
    const posts = appState.cachedFeedPosts || await fetchPostsPage(0);
    renderExploreContainer(exploreContainer, posts, (post) => {
      console.log('Post seleccionado en explorar:', post.id);
    });
  } catch (err) {
    console.error('Error al cargar la vista de explorar:', err);
  }
}

function loadCreatePostView() {
  const createContainer = document.getElementById('createContainer');
  if (!createContainer) return;

  createContainer.innerHTML = `
    <div style="padding: 20px; max-width: 500px; margin: 0 auto;">
      <h2 style="margin-bottom: 20px; font-size: 18px; font-weight: 600;">Nueva publicación</h2>
      <div id="createFormError" style="color: red; font-size: 13px; margin-bottom: 10px; display: none;"></div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Seleccionar imagen</label>
        <input type="file" id="postImageInput" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid var(--og-border, #dbdbdb); border-radius: 8px;">
      </div>

      <div id="imagePreviewContainer" style="margin-bottom: 16px; display: none; text-align: center;">
        <img id="postImagePreview" src="" alt="Vista previa" style="max-height: 250px; border-radius: 8px; object-fit: cover;">
      </div>

      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Descripción</label>
        <textarea id="postContentInput" placeholder="Escribe algo sobre tu publicación..." style="width: 100%; height: 100px; padding: 12px; border: 1px solid var(--og-border, #dbdbdb); border-radius: 8px; font-size: 14px; outline: none; resize: none;"></textarea>
      </div>

      <button id="submitPostBtn" style="width: 100%; padding: 12px; background: var(--og-primary, #0095f6); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Compartir publicación</button>
    </div>
  `;

  let selectedFile = null;
  const imageInput = document.getElementById('postImageInput');
  const previewContainer = document.getElementById('imagePreviewContainer');
  const previewImg = document.getElementById('postImagePreview');
  const submitBtn = document.getElementById('submitPostBtn');
  const errorDiv = document.getElementById('createFormError');

  imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      errorDiv.style.display = 'none';
      const compressedBlob = await compressImage(file, 1200, 0.8);
      selectedFile = compressedBlob;

      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
        previewContainer.style.display = 'block';
      };
      reader.readAsDataURL(compressedBlob);
    } catch (err) {
      console.error('Error al comprimir imagen:', err);
      errorDiv.textContent = 'No se pudo procesar la imagen seleccionada.';
      errorDiv.style.display = 'block';
    }
  });

  submitBtn.addEventListener('click', async () => {
    if (!selectedFile) {
      errorDiv.textContent = 'Por favor, selecciona una imagen.';
      errorDiv.style.display = 'block';
      return;
    }

    const content = document.getElementById('postContentInput').value.trim();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publicando...';

    try {
      const fileName = `post_${Date.now()}.jpg`;
      const imageUrl = await uploadMediaFile(selectedFile, fileName, 'posts');
      await createNewPost(appState.currentUser.id, imageUrl, content);

      alert('¡Publicación creada con éxito!');
      switchTab('home');
      window.location.reload();
    } catch (err) {
      console.error('Error al crear publicación:', err);
      errorDiv.textContent = 'Error al publicar. Inténtalo de nuevo.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Compartir publicación';
    }
  });
}

async function loadActivityView() {
  const activityContainer = document.getElementById('activityContainer');
  if (!activityContainer) return;
  activityContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--og-text-muted);">Cargando actividad...</div>';

  try {
    const activities = await fetchUserActivityData(appState.currentUser.id);
    activityContainer.innerHTML = '';

    if (!activities || activities.length === 0) {
      activityContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--og-text-muted);">No tienes actividad reciente.</div>';
      return;
    }

    activities.forEach(item => {
      const profile = item.profiles || { username: 'usuario', avatar_url: null };
      const el = renderActivityItemElement(item, profile, item.type || 'like', (act, type) => {
        console.log('Actividad seleccionada:', act);
      });
      activityContainer.append(el);
    });

    setLastSeenActivityTimestamp(appState.currentUser.id, new Date().toISOString());
  } catch (err) {
    console.error('Error al cargar la actividad:', err);
    activityContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: red;">Error al cargar la actividad.</div>';
  }
}

async function loadUserProfileView(userId) {
  switchTab('profile');
  const profileContainer = document.getElementById('profilePageContainer');
  if (!profileContainer) return;

  try {
    const profile = await fetchUserProfile(userId);
    const counts = await fetchUserCounts(userId);
    const isMy = appState.currentUser?.id === userId;

    profileContainer.innerHTML = renderProfileHeaderMarkup(profile, counts, isMy, false);
  } catch (err) {
    console.error('Error al cargar perfil:', err);
    profileContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: red;">Error al cargar el perfil.</div>';
  }
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
        console.log('Abrir comentarios para post:', postObj.id);
      },
      onProfileClick: (userId) => {
        loadUserProfileView(userId);
      }
    });
    feedContainer.append(card);
  });
}

function setupGlobalEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await db.auth.signOut();
      window.location.reload();
    });
  }
}
