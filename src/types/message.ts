export interface MessageImage {
  id: string;
  url: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  images: MessageImage[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  agent: {
    id?: string;
    name: string;
    company: string;
    avatar?: string;
  };
  rental: {
    id: string;
    name: string;
    image: string;
    summary: string;
  };
  unread: number;
  messages: ChatMessage[];
}

export interface MessageDraft {
  text: string;
  images: MessageImage[];
}

/** Conversation contact. */
export interface ConversationContact {
  id: string;
  name: string;
  company: string;
  avatar: string | null;
}

/** Property associated with a conversation. */
export interface ConversationRental {
  id: string;
  name: string;
  image: string;
  floorPlan: string;
  area: number;
  monthlyRent: number;
}

/** Message returned by the backend. */
export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;

  /** Client-generated ID echoed by the backend for deduplication. */
  clientMessageId: string;

  text: string;
  images: MessageImage[];
  createdAt: string;
}

/** Most recent message in a conversation. */
export interface LastMessage {
  id: string;
  senderId: string;
  text: string;
  imageCount: number;
  createdAt: string;
}

/** Conversation details. */
export interface ConversationResponse {
  id: string;
  contact: ConversationContact;
  rental: ConversationRental;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

/** Cursor-based page. */
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Conversation query parameters. */
export interface ConversationQuery {
  cursor?: string;
  limit?: number;
}

/** Message query parameters. */
export interface MessageQuery {
  /** Load messages before this ID; omit it for the first page. */
  beforeId?: string;
  limit?: number;
}

/** Open a property conversation. */
export interface OpenConversationRequest {
  rentalId: string;
}

/** Send a message. */
export interface SendMessageRequest {
  clientMessageId: string;
  text: string;
  attachmentIds: string[];
}

/** Update the read position. */
export interface MarkAsReadRequest {
  lastReadMessageId: string;
}

// Preserve the previous image type export.
export type ChatImage = MessageImage;
