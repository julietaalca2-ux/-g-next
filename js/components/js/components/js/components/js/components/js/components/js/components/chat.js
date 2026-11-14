/* ========================================================================= */
/* ÖG CHAT COMPONENT - Renderizado de Conversaciones, Burbujas y Cabeceras    */
/* ========================================================================= */

import { sanitizeHtml } from '../utils/helpers.js';
import { formatDate } from '../utils/dates.js';

export function renderConversationItem(conversationId, otherUser, lastMessage, unread, onClick) {
  const item = document.createElement('div');
  item.className = 'dm-conv-item';

  const avatarWrap = document.createElement('div');
  avatarWrap.className = 'story-avatar-container dm-conv-avatar';
  const avatarInner = document.createElement('div');
  avatarInner.className = 'story-avatar-inner';

  if (otherUser?.avatar_url) {
    const img = document.createElement('img');
    img.src = otherUser.avatar_url;
    img.alt = otherUser.username;
    avatarInner.append(img);
  } else {
    avatarInner.textContent = '👤';
  }
  avatarWrap.append(avatarInner);

  const infoDiv = document.createElement('div');
  infoDiv.className = 'dm-conv-info';

  const nameRow = document.createElement('div');
  nameRow.className = 'dm-conv-name';
  nameRow.innerHTML = `
    <span>${sanitizeHtml(otherUser?.display_name || otherUser?.username || 'Usuario')}</span>
    <span class="dm-conv-time">${lastMessage ? formatDate(lastMessage.created_at) : ''}</span>
  `;

  const snippetRow = document.createElement('div');
  snippetRow.className = 'dm-conv-snippet';
  snippetRow.textContent = lastMessage ? lastMessage.content : 'Sin mensajes aún';

  infoDiv.append(nameRow, snippetRow);
  item.append(avatarWrap, infoDiv);

  if (unread) {
    const dot = document.createElement('span');
    dot.className = 'dm-unread-dot';
    item.append(dot);
  }

  item.addEventListener('click', () => onClick(conversationId, otherUser));
  return item;
}

export function renderChatBubbleElement(message, isMe, onReplyClick) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble ' + (isMe ? 'sent' : 'received');
  bubble.dataset.messageId = message.id;

  if (message.reply_to_snippet) {
    const replyPreview = document.createElement('div');
    replyPreview.className = 'chat-bubble-reply-preview';
    replyPreview.textContent = message.reply_to_snippet;
    bubble.append(replyPreview);
  }

  const contentSpan = document.createElement('div');
  contentSpan.textContent = message.content;
  bubble.append(contentSpan);

  const timeDiv = document.createElement('div');
  timeDiv.className = 'chat-bubble-time';
  timeDiv.textContent = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  bubble.append(timeDiv);

  if (onReplyClick) {
    bubble.addEventListener('dblclick', () => onReplyClick(message));
  }

  return bubble;
}

