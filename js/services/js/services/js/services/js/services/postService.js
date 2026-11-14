/* ========================================================================= */
/* ÖG POST SERVICE - Publicaciones, Comentarios, Me gusta y Vistas           */
/* ========================================================================= */

import { db } from './supabase.js';
import { appState } from '../core/state.js';
import { FEED_PAGE_SIZE } from '../config/appConfig.js';

export async function fetchPostsPage(page = 0) {
  const from = page * FEED_PAGE_SIZE;
  const to = from + FEED_PAGE_SIZE - 1;

  const { data: posts, error } = await db.from('posts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return posts || [];
}

export async function fetchPostComments(postId) {
  const { data: comments, error } = await db.from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return comments || [];
}

export async function togglePostLike(postId, userId) {
  const { data, error } = await db.rpc('toggle_like', {
    p_post_id: postId,
    p_user_id: userId
  });

  if (error) {
    // Fallback manual si la función RPC no está disponible
    const { data: existing } = await db.from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await db.from('likes').delete().eq('post_id', postId).eq('user_id', userId);
      return { liked: false };
    } else {
      await db.from('likes').insert({ post_id: postId, user_id: userId });
      return { liked: true };
    }
  }
  return data;
}

export async function registerPostView(postId, visitorId) {
  const { data: newTotalViews, error } = await db.rpc('register_post_view', {
    p_post_id: postId,
    p_visitor_id: visitorId
  });
  if (error) return null;
  return newTotalViews;
}

export async function createNewPost(userId, content, imageUrl) {
  const insertPayload = {
    user_id: userId,
    content: content || '',
    image_url: imageUrl || null
  };
  const { data, error } = await db.from('posts').insert(insertPayload).select().single();
  if (error) throw error;
  return data;
}
