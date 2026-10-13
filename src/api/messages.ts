import { request } from './client';

/** 会话中的联系人 */
export interface ConversationContact {
  id: string;
  name: string;
  company: string;
  avatar: string | null;
}

/** 会话关联的房源 */
export interface ConversationRental {
  id: string;
  name: string;
  image: string;
  floorPlan: string;
  area: number;
  monthlyRent: number;
}

/** 已上传的图片附件 */
export interface ChatImage {
  id: string;
  url: string;
  name: string;
}

/** 后端返回的消息 */
export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;

  /** 客户端生成，后端原样返回，用于去重和匹配 */
  clientMessageId: string;

  text: string;
  images: ChatImage[];
  createdAt: string;
}

/** 会话列表中的最近消息 */
export interface LastMessage {
  id: string;
  senderId: string;
  text: string;
  imageCount: number;
  createdAt: string;
}

/** 会话信息 */
export interface ConversationResponse {
  id: string;
  contact: ConversationContact;
  rental: ConversationRental;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

/** 通用游标分页结果 */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** 会话列表参数 */
export interface ConversationQuery {
  cursor?: string;
  limit?: number;
}

/** 聊天记录参数 */
export interface MessageQuery {
  /** 获取此消息之前的记录，首次加载不传 */
  beforeId?: string;
  limit?: number;
}

/** 发起咨询 */
export interface OpenConversationRequest {
  rentalId: string;
}

/** 发送消息 */
export interface SendMessageRequest {
  clientMessageId: string;
  text: string;
  attachmentIds: string[];
}

/** 更新已读位置 */
export interface MarkAsReadRequest {
  lastReadMessageId: string;
}

function encodeId(id: string): string {
  return encodeURIComponent(id);
}

export const messagesApi = {
  /**
   * 获取会话列表。
   * 后端按最近消息时间倒序返回。
   */
  getConversations(
    params: ConversationQuery = {},
    signal?: AbortSignal,
  ): Promise<CursorPage<ConversationResponse>> {
    return request<CursorPage<ConversationResponse>>(
      '/api/conversations',
      {
        query: {
          cursor: params.cursor,
          limit: params.limit ?? 20,
        },
        signal,
      },
    );
  },

  /**
   * 根据房源发起咨询。
   * 后端寻找担当者，并创建或复用已有会话。
   */
  openConversation(
    values: OpenConversationRequest,
    signal?: AbortSignal,
  ): Promise<ConversationResponse> {
    return request<ConversationResponse>(
      '/api/conversations',
      {
        method: 'POST',
        body: values,
        signal,
      },
    );
  },

  /**
   * 获取聊天记录。
   * 约定每批 items 按时间从早到晚排列。
   * nextCursor 用作下一次请求的 beforeId。
   */
  getMessages(
    conversationId: string,
    params: MessageQuery = {},
    signal?: AbortSignal,
  ): Promise<CursorPage<MessageResponse>> {
    return request<CursorPage<MessageResponse>>(
      `/api/conversations/${encodeId(conversationId)}/messages`,
      {
        query: {
          beforeId: params.beforeId,
          limit: params.limit ?? 30,
        },
        signal,
      },
    );
  },

  /**
   * 发送文字、Emoji 或图片。
   * 图片需要先上传，传入附件 ID。
   */
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
      `/api/conversations/${encodeId(conversationId)}/messages`,
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

  /**
   * 标记已读到指定消息。
   * 后端应保证已读位置只前进，不倒退。
   */
  markAsRead(
    conversationId: string,
    values: MarkAsReadRequest,
    signal?: AbortSignal,
  ): Promise<void> {
    return request<void>(
      `/api/conversations/${encodeId(conversationId)}/read`,
      {
        method: 'PUT',
        body: values,
        signal,
      },
    );
  },

  /**
   * 上传聊天图片。
   * 前端校验用于交互提示，后端也必须验证文件。
   */
  uploadImage(
    file: File,
    signal?: AbortSignal,
  ): Promise<ChatImage> {
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

    return request<ChatImage>('/api/chat/images', {
      method: 'POST',
      body: formData,
      signal,
    });
  },
};
