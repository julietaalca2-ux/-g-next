/* ========================================================================= */
/* ÖG PROFILE SERVICE - Gestión de Perfiles, Portadas, Avatares y Estadísticas */
/* ========================================================================= */

import { db } from './supabase.js';
import { appState } from '../core/state.js';

export async function fetchUserProfile(userId) {
  if (appState.profilesCache[userId]) {
    return appState.profilesCache[userId];
  }
  const { data, error } = await db.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (!error && data) {
    appState.profilesCache[userId] = data;
    return data;
  }
  return null;
}

export async function fetchUserCounts(userId) {
  try {
    const [followers, following, posts] = await Promise.all([
      db.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
      db.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
      db.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    ]);
    return {
      followersCount: followers.count || 0,
      followingCount: following.count || 0,
      postsCount: posts.count || 0
    };
  } catch (e) {
    return { followersCount: 0, followingCount: 0, postsCount: 0 };
  }
}

export async function checkIsFollowing(followerId, followingId) {
  if (!followerId || !followingId) return false;
  const { data } = await db.from('follows')
    .select('*')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  return !!data;
}

export async function toggleFollowUser(followerId, followingId, currentIsFollowing) {
  if (!followerId || !followingId) return false;
  if (currentIsFollowing) {
    await db.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
    return false;
  } else {
    await db.from('follows').insert({ follower_id: followerId, following_id: followingId });
    return true;
  }
}

export async function updateProfileData(userId, updateFields) {
  const { data, error } = await db.from('profiles')
    .update(updateFields)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  appState.myProfile = data;
  appState.profilesCache[userId] = data;
  return data;
}
