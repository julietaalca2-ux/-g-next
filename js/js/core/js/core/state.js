/* ========================================================================= */
/* ÖG STATE - Estado Global Centralizado de la Aplicación                     */
/* ========================================================================= */

export const appState = {
  currentUser: null,
  myProfile: null,
  viewedProfile: null,
  profilesCache: {},
  myActiveStories: [],
  storiesByUserMap: {},
  storyUserOrder: [],
  cachedConversationsList: null,
  cachedActivityEvents: null,
  cachedFeedPosts: null,
  loadedPostIds: new Set(),
  seenNotificationKeys: new Set(),
  currentChatUserId: null,
  currentChatConversationId: null,
  activeRealtimeChannels: []
};

