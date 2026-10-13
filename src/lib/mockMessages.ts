import type { Conversation } from '@/types/message';

export function createMockConversations(): Conversation[] {
  return [
    {
      id: 'conversation-001',
      agent: {
        name: '田中',
        company: 'Hikari 不動産',
      },
      rental: {
        id: '10001',
        name: 'グリーンレジデンス新宿',
        image: '/images/home/hero.png',
        summary: '1LDK · 34.2㎡ · 12.5万円',
      },
      unread: 1,
      messages: [
        {
          id: 'message-001',
          sender: 'agent',
          text: 'お問い合わせありがとうございます。お部屋について気になることがあれば、お気軽にご相談ください。',
          images: [],
          createdAt: '2026-10-13T14:20:00+09:00',
        },
        {
          id: 'message-002',
          sender: 'user',
          text: 'ありがとうございます。内見の日程について相談したいです。',
          images: [],
          createdAt: '2026-10-13T14:22:00+09:00',
        },
        {
          id: 'message-003',
          sender: 'agent',
          text: 'ご希望の日時を教えていただけますか？',
          images: [],
          createdAt: '2026-10-13T14:25:00+09:00',
        },
      ],
    },
    {
      id: 'conversation-002',
      agent: {
        name: '佐藤',
        company: 'みどり不動産',
      },
      rental: {
        id: '10002',
        name: 'ルミエール渋谷',
        image: '/images/home/hero.png',
        summary: '1K · 27.1㎡ · 10.8万円',
      },
      unread: 1,
      messages: [
        {
          id: 'message-004',
          sender: 'agent',
          text: '設備や初期費用について、ご質問があればお知らせください。',
          images: [],
          createdAt: '2026-10-13T10:16:00+09:00',
        },
      ],
    },
  ];
}
