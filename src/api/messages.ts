import { request } from './client';

import type {
  MarkAsReadRequest,
  MessageCursorPage,
  MessageImage,
  MessageQuery,
  MessageResponse,
  MessageSessionCreated,
  MessageSessionQuery,
  MessageSessionResponse,
  OpenMessageSessionRequest,
  SendMessageRequest,
} from '@/types/message';

function encodeId(id: string): string {
  return encodeURIComponent(id);
}

const MESSAGES_PATH = '/api/messages';
const SESSIONS_PATH = `${MESSAGES_PATH}/sessions`;
const IMAGES_PATH = `${MESSAGES_PATH}/images`;

export const messagesApi = {
  /** List message sessions in descending order of recent activity. */
  getSessions(
    params: MessageSessionQuery = {},
    signal?: AbortSignal,
  ): Promise<MessageCursorPage<MessageSessionResponse>> {
    return request<MessageCursorPage<MessageSessionResponse>>(
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

  /** Create or reuse a message session with the property agent. */
  openSession(
    values: OpenMessageSessionRequest,
    signal?: AbortSignal,
  ): Promise<MessageSessionCreated> {
    return request<MessageSessionCreated>(SESSIONS_PATH, {
      method: 'POST',
      body: values,
      signal,
    });
  },

  /** Load messages in chronological order; use nextCursor as beforeId. */
  getMessages(
    sessionId: string,
    params: MessageQuery = {},
    signal?: AbortSignal,
  ): Promise<MessageCursorPage<MessageResponse>> {
    return request<MessageCursorPage<MessageResponse>>(
      `${SESSIONS_PATH}/${encodeId(sessionId)}/records`,
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
    sessionId: string,
    values: SendMessageRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const text = values.text.trim();

    if (!text && values.attachmentIds.length === 0) {
      return Promise.reject(
        new Error('メッセージを入力するか、画像を選択してください'),
      );
    }

    if (text.length > 500) {
      return Promise.reject(
        new Error('メッセージは500文字以内にしてください'),
      );
    }

    if (values.attachmentIds.length > 4) {
      return Promise.reject(
        new Error('画像は4枚まで送信できます'),
      );
    }

    return request<MessageResponse>(
      `${SESSIONS_PATH}/${encodeId(sessionId)}/records`,
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
    sessionId: string,
    values: MarkAsReadRequest,
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>(
      `${SESSIONS_PATH}/${encodeId(sessionId)}/read`,
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
        new Error('JPEG・PNG・WebPの画像を選択してください'),
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return Promise.reject(
        new Error('画像は5MB以下にしてください'),
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
