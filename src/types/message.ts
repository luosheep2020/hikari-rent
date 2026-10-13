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
