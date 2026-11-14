/* ========================================================================= */
/* ÖG STORY SERVICE - Historias, 24h Expiración, Reacciones y Multimedia     */
/* ========================================================================= */

import { db } from './supabase.js';
import { STORY_TTL_MS } from '../config/appConfig.js';

export function getStoryExpirationISO() {
  return new Date(Date.now() - STORY_TTL_MS).toISOString();
}

export async function fetchActiveStoriesForUser(userId) {
  const cutoff = getStoryExpirationISO();
  const { data, error } = await db.from('stories')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function fetchFollowingStories(followingIds) {
  if (!followingIds || !followingIds.length) return [];
  const cutoff = getStoryExpirationISO();
  const { data, error } = await db.from('stories')
    .select('*')
    .in('user_id', followingIds)
    .gte('created_at', cutoff)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

export async function fetchStoryLikes(storyId) {
  const { data, error } = await db.from('story_likes')
    .select('id, story_id, user_id, visitor_id, created_at')
    .eq('story_id', storyId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function insertStoryLike(storyId, userId) {
  const { error } = await db.from('story_likes').insert({
    story_id: storyId,
    user_id: userId,
    visitor_id: userId
  });
  return !error;
}

export async function deleteStoryLike(storyId, userId) {
  const { error } = await db.from('story_likes')
    .delete()
    .eq('story_id', storyId)
    .or(`user_id.eq.${userId},visitor_id.eq.${userId}`);
  return !error;
}
