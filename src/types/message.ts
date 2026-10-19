export interface MessageImage {
  id: string;
  url: string;
  name: string;
}

// Retained local UI models for any remaining demo consumers.
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  images: MessageImage[];
  createdAt: string;
}

export interface MessageSession {
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
  clientMessageId: string;
  text: string;
  images: MessageImage[];
}

export interface MessageContact {
  id: string;
  name: string;
  company: string;
  avatar: string | null;
}

export interface MessageRental {
  id: string;
  name: string;
  image: string | null;
  floorPlan: string;
  area: number;
  monthlyRent: number;
}

export interface MessageResponse {
  id: string;
  sessionId: string;
  senderId: string;
  clientMessageId: string;
  text: string;
  images: MessageImage[];
  createdAt: string;
}

export interface MessagePreview {
  id: string;
  senderId: string;
  text: string;
  imageCount: number;
  createdAt: string;
}

export interface MessageSessionResponse {
  id: string;
  contact: MessageContact;
  rental: MessageRental | null;
  lastMessage: MessagePreview | null;
  unreadCount: number;
}

export interface MessageCursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface MessageSessionQuery {
  cursor?: string;
  limit?: number;
}

export interface MessageQuery {
  beforeId?: string;
  limit?: number;
}

export interface OpenMessageSessionRequest {
  rentalId: string;
}

export interface MessageSessionCreated {
  id: string;
}

export interface SendMessageRequest {
  clientMessageId: string;
  text: string;
  attachmentIds: string[];
}

export interface MarkAsReadRequest {
  lastReadMessageId: string;
}
