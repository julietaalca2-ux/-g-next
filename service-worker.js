/* ========================================================================= */
/* ÖG SERVICE WORKER - Caché Estático para PWA (v3)                          */
/* ========================================================================= */

const CACHE_NAME = 'og-cache-v3';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './js/main.js',
  './js/core/state.js',
  './js/core/router.js',
  './js/navigation/gestures.js',
  './js/services/supabase.js',
  './js/services/authService.js',
  './js/services/profileService.js',
  './js/services/postService.js',
  './js/services/storyService.js',
  './js/services/chatService.js',
  './js/services/notificationService.js',
  './js/services/storageService.js',
  './js/utils/dom.js',
  './js/utils/dates.js',
  './js/utils/images.js',
  './js/utils/validation.js',
  './js/utils/helpers.js',
  './js/components/storiesComponent.js',
  './js/components/feedComponent.js',
  './js/components/profileComponent.js',
  './js/components/exploreComponent.js',
  './js/components/chatComponent.js',
  './js/components/activityComponent.js',
  './css/variables.css',
  './css/reset.css',
  './css/global.css',
  './css/layout.css',
  './css/header.css',
  './css/navigation.css',
  './css/feed.css',
  './css/stories.css',
  './css/profile.css',
  './css/explore.css',
  './css/chat.css',
  './css/activity.css',
  './css/modals.css',
  './css/animations.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
