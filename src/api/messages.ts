import { request } from "./client";

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
} from "@/types/message";

function encodeId(id: string): string {
  return encodeURIComponent(id);
}

const MESSAGES_PATH = "/api/messages";
const SESSIONS_PATH = `${MESSAGES_PATH}/sessions`;

export const messagesApi = {
  /** List message sessions in descending order of recent activity. */
  getSessions(
    params: MessageSessionQuery = {},
    signal?: AbortSignal,
  ): Promise<MessageCursorPage<MessageSessionResponse>> {
    return request<MessageCursorPage<MessageSessionResponse>>(SESSIONS_PATH, {
      query: {
        cursor: params.cursor,
        limit: params.limit ?? 20,
      },
      signal,
      auth: "required",
    });
  },

  /** Create or reuse a message session with the property agent. */
  openSession(
    values: OpenMessageSessionRequest,
    signal?: AbortSignal,
  ): Promise<MessageSessionCreated> {
    return request<MessageSessionCreated>(SESSIONS_PATH, {
      method: "POST",
      body: values,
      signal,
      auth: "required",
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
        auth: "required",
      },
    );
  },

  /** Send text and emoji using the existing idempotency UUID. */
  sendMessage(
    sessionId: string,
    values: SendMessageRequest,
    signal?: AbortSignal,
  ): Promise<MessageResponse> {
    const text = values.text.trim();

    if (!text && values.attachmentIds.length === 0) {
      return Promise.reject(
        new Error("メッセージを入力するか、画像を選択してください"),
      );
    }

    if (text.length > 500) {
      return Promise.reject(new Error("メッセージは500文字以内にしてください"));
    }

    if (values.attachmentIds.length > 0) {
      return Promise.reject(
        new Error("画像送信は準備中です。テキスト・絵文字をご利用ください。"),
      );
    }

    return request<MessageResponse>(
      `${MESSAGES_PATH}/send/${encodeId(sessionId)}`,
      {
        method: "POST",
        body: {
          clientMessageId: values.clientMessageId,
          text,
          attachmentIds: values.attachmentIds,
        },
        signal,
        auth: "required",
      },
    );
  },

  /** Advance the read position without moving it backward. */
  markAsRead(
    sessionId: string,
    values: MarkAsReadRequest,
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>(`${SESSIONS_PATH}/${encodeId(sessionId)}/read`, {
      method: "PUT",
      body: values,
      signal,
      auth: "required",
    });
  },

  /** Keep this method explicit until private chat attachments are implemented. */
  uploadImage(_file: File, _signal?: AbortSignal): Promise<MessageImage> {
    void _file;
    void _signal;
    return Promise.reject(
      new Error("画像送信は準備中です。テキスト・絵文字をご利用ください。"),
    );
  },
};
