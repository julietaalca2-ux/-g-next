/* ========================================================================= */
/* ÖG NOTIFICATION SERVICE - Actividad, Alertas y Preferencias               */
/* ========================================================================= */

import { db } from './supabase.js';

export function getLastSeenActivityTimestamp(userId) {
  if (!userId) return 0;
  const val = localStorage.getItem('og_last_seen_activity_' + userId);
  return val ? Number(val) : 0;
}

export function setLastSeenActivityTimestamp(userId) {
  if (!userId) return;
  localStorage.setItem('og_last_seen_activity_' + userId, String(Date.now()));
}

export function isNotificationCategoryEnabled(userId, type) {
  try {
    const raw = localStorage.getItem('og_user_settings_' + (userId || 'guest'));
    if (!raw) return true;
    const prefs = JSON.parse(raw);
    if (type === 'like' || type === 'story_like') return prefs.notifLikes !== false;
    if (type === 'comment') return prefs.notifComments !== false;
    if (type === 'follow') return prefs.notifFollows !== false;
    if (type === 'dm') return prefs.notifDm !== false;
    return true;
  } catch (e) {
    return true;
  }
}

export async function fetchUserActivityData(currentUser, ownPostIds, ownStoryIds) {
  const [followsResult, likesResult, commentsResult, storyLikesResult] = await Promise.all([
    db.from('follows').select('follower_id, created_at').eq('following_id', currentUser.id).order('created_at', { ascending: false }).limit(30),
    ownPostIds.length ? db.from('likes').select('user_id, post_id, created_at').in('post_id', ownPostIds).order('created_at', { ascending: false }).limit(40) : Promise.resolve({ data: [] }),
    ownPostIds.length ? db.from('comments').select('id, user_id, post_id, content, created_at').in('post_id', ownPostIds).order('created_at', { ascending: false }).limit(40) : Promise.resolve({ data: [] }),
    ownStoryIds.length ? db.from('story_likes').select('id, user_id, visitor_id, story_id, created_at').in('story_id', ownStoryIds).order('created_at', { ascending: false }).limit(50) : Promise.resolve({ data: [] })
  ]);

  return {
    follows: followsResult.data || [],
    likes: likesResult.data || [],
    comments: commentsResult.data || [],
    storyLikes: storyLikesResult.data || []
  };
}
