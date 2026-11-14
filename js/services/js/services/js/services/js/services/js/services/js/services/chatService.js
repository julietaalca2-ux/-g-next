/* ========================================================================= */
/* ÖG CHAT SERVICE - Mensajería Directa, Conversaciones y Participantes      */
/* ========================================================================= */

import { db } from './supabase.js';

export async function fetchUserConversations(userId) {
  const { data: myParts, error: partErr } = await db.from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (partErr || !myParts || !myParts.length) return [];

  const convIds = myParts.map(p => p.conversation_id);
  const { data: allParts } = await db.from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', convIds);

  const convMap = {};
  convIds.forEach(id => {
    convMap[id] = {
      otherUserId: null,
      last_read_at: myParts.find(p => p.conversation_id === id)?.last_read_at
    };
  });

  (allParts || []).forEach(p => {
    if (p.user_id !== userId && convMap[p.conversation_id]) {
      convMap[p.conversation_id].otherUserId = p.user_id;
    }
  });

  return { convIds, convMap };
}

export async function fetchChatMessages(conversationId) {
  const { data: messages, error } = await db.from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return messages || [];
}

export async function getOrCreatePrivateConversation(recipientId) {
  const { data: convId, error } = await db.rpc('get_or_create_private_conversation', {
    recipient_id: recipientId
  });
  if (error) throw error;
  return convId;
}

export async function sendChatMessageRecord(conversationId, senderId, content, replyToId = null, replyToSnippet = null) {
  const payload = {
    conversation_id: conversationId,
    sender_id: senderId,
    content: content
  };
  if (replyToId) payload.reply_to_id = replyToId;
  if (replyToSnippet) payload.reply_to_snippet = replyToSnippet;

  const { data, error } = await db.from('messages').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function markConversationAsReadRecord(conversationId, userId) {
  await db.from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
}
