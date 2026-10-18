import { request } from './client';

import type {
  MessageImage,
  ConversationResponse,
  ConversationQuery,
  CursorPage,
  MessageQuery,
  MessageResponse,
  OpenConversationRequest,
  SendMessageRequest,
  MarkAsReadRequest,
} from '@/types/message';

// Preserve existing type imports while callers migrate to the types module.
export type {
  ConversationContact,
  ConversationRental,
  MessageResponse,
  LastMessage,
  ConversationResponse,
  CursorPage,
  ConversationQuery,
  MessageQuery,
  OpenConversationRequest,
  SendMessageRequest,
  MarkAsReadRequest,
  ChatImage,
} from '@/types/message';

function encodeId(id: string): string {
  return encodeURIComponent(id);
}

const MESSAGES_PATH = '/api/messages';
const SESSIONS_PATH = `${MESSAGES_PATH}/sessions`;
const IMAGES_PATH = `${MESSAGES_PATH}/images`;

export const messagesApi = {
  /** List conversations in descending order of recent activity. */
  getConversations(
    params: ConversationQuery = {},
    signal?: AbortSignal,
  ): Promise<CursorPage<ConversationResponse>> {
    return request<CursorPage<ConversationResponse>>(
      SESSIONS_PATH,
      {
        query: {
          cursor: params.cursor,
          limit: params.limit ?? 20,
        },
        signal,
      },
    );
  },

  /** Create or reuse a conversation with the property agent. */
  openConversation(
    values: OpenConversationRequest,
    signal?: AbortSignal,
  ): Promise<ConversationResponse> {
    return request<ConversationResponse>(
      SESSIONS_PATH,
      {
        method: 'POST',
        body: values,
        signal,
      },
    );
  },

  /** Load messages in chronological order; use nextCursor as beforeId. */
  getMessages(
    conversationId: string,
    params: MessageQuery = {},
    signal?: AbortSignal,
  ): Promise<CursorPage<MessageResponse>> {
    return request<CursorPage<MessageResponse>>(
      `${SESSIONS_PATH}/${encodeId(conversationId)}/records`,
      {
        query: {
          beforeId: params.beforeId,
          limit: params.limit ?? 30,
        },
        signal,
      },
    );
  },

  /** Send text, emoji, or previously uploaded image attachments. */
  sendMessage(
    conversationId: string,
    values: SendMessageRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const text = values.text.trim();

    if (!text && values.attachmentIds.length === 0) {
      return Promise.reject(
        new Error('请输入文字或选择图片'),
      );
    }

    if (text.length > 500) {
      return Promise.reject(
        new Error('消息不能超过500个字符'),
      );
    }

    if (values.attachmentIds.length > 4) {
      return Promise.reject(
        new Error('每条消息最多发送4张图片'),
      );
    }

    return request<MessageResponse>(
      `${SESSIONS_PATH}/${encodeId(conversationId)}/records`,
      {
        method: 'POST',
        body: {
          clientMessageId: values.clientMessageId,
          text,
          attachmentIds: values.attachmentIds,
        },
        signal,
      },
    );
  },

  /** Advance the read position without moving it backward. */
  markAsRead(
    conversationId: string,
    values: MarkAsReadRequest,
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>(
      `${SESSIONS_PATH}/${encodeId(conversationId)}/read`,
      {
        method: 'PUT',
        body: values,
        signal,
      },
    );
  },

  /** Upload a chat image; the backend must also validate the file. */
  uploadImage(
    file: File,
    signal?: AbortSignal,
  ): Promise<MessageImage> {
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(
        file.type,
      )
    ) {
      return Promise.reject(
        new Error('请选择 JPEG、PNG 或 WebP 图片'),
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return Promise.reject(
        new Error('图片不能超过5MB'),
      );
    }

    const formData = new FormData();
    formData.append('file', file);

    return request<MessageImage>(IMAGES_PATH, {
      method: 'POST',
      body: formData,
      signal,
    });
  },
};
