'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Empty } from 'antd';

import { createMockConversations } from '@/lib/mockMessages';
import { mockRentals } from '@/lib/mockRentals';

import type {
  Conversation,
  MessageDraft,
} from '@/types/message';

import ConversationList from './ConversationList';
import MessageThread from './MessageThread';

import styles from './css/MessageCenter.module.css';

type Props = {
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
};

function isSameAgent(
  conversation: Conversation,
  agent: {
    id: string;
    name: string;
    company: string;
  },
): boolean {
  if (conversation.agent.id) {
    return conversation.agent.id === agent.id;
  }

  // 兼容还没添加担当者 ID 的旧模拟会话。
  return (
    conversation.agent.name === agent.name &&
    conversation.agent.company === agent.company
  );
}

export default function MessageCenter({ user }: Props) {
  const searchParams = useSearchParams();

  const rentalId = searchParams.get('rentalId');

  const requestedRental = mockRentals.find(
    (rental) => rental.id === rentalId,
  );

  const [conversations, setConversations] = useState(
    createMockConversations,
  );

  // 记录用户手动选择，以及选择时的房源参数。
  // URL 换成另一套房源后，优先打开新房源的担当者。
  const [selection, setSelection] = useState<{
    rentalId: string | null;
    conversationId: string | null;
  }>({
    rentalId: null,
    conversationId: null,
  });

  const existingConversation = requestedRental
    ? conversations.find((item) =>
      isSameAgent(item, requestedRental.agent),
    )
    : undefined;

  const requestedConversation: Conversation | undefined =
    requestedRental
      ? {
        id:
          existingConversation?.id ??
          `agent:${requestedRental.agent.id}`,

        agent: {
          id: requestedRental.agent.id,
          name: requestedRental.agent.name,
          company: requestedRental.agent.company,
          avatar: requestedRental.agent.avatar,
        },

        rental: {
          id: requestedRental.id,
          name: requestedRental.name,
          image: requestedRental.image,
          summary:
            `${requestedRental.floorPlan} · ` +
            `${requestedRental.area}㎡ · ` +
            `${requestedRental.monthlyRent / 10000}万円`,
        },

        unread: existingConversation?.unread ?? 0,
        messages: existingConversation?.messages ?? [],
      }
      : undefined;

  // 将 URL 指定的会话合并到列表。
  // 不在渲染过程中调用 setState。
  const availableConversations = requestedConversation
    ? existingConversation
      ? conversations.map((item) =>
        item.id === requestedConversation.id
          ? requestedConversation
          : item,
      )
      : [requestedConversation, ...conversations]
    : conversations;

  const selectedId =
    selection.rentalId === rentalId
      ? selection.conversationId ??
      requestedConversation?.id ??
      null
      : requestedConversation?.id ?? null;

  const selectedConversation =
    availableConversations.find(
      (item) => item.id === selectedId,
    );

  // 正在打开的会话不显示未读标记。
  const displayedConversations =
    availableConversations.map((item) =>
      item.id === selectedId
        ? { ...item, unread: 0 }
        : item,
    );

  const sortedConversations = [
    ...displayedConversations,
  ].sort((a, b) => {
    const aTime = a.messages.at(-1)?.createdAt;
    const bTime = b.messages.at(-1)?.createdAt;

    return (
      (bTime ? Date.parse(bTime) : 0) -
      (aTime ? Date.parse(aTime) : 0)
    );
  });

  const handleSelect = (id: string) => {
    setSelection({
      rentalId,
      conversationId: id,
    });

    // 保存新会话及其关联房源，并清除未读。
    setConversations(
      availableConversations.map((item) =>
        item.id === id || item.id === selectedId
          ? { ...item, unread: 0 }
          : item,
      ),
    );
  };

  const handleSend = (draft: MessageDraft) => {
    if (!selectedConversation) return;

    const text = draft.text.trim();

    if (!text && draft.images.length === 0) return;

    const newMessage = {
      id: crypto.randomUUID(),
      sender: 'user' as const,
      text,
      images: [...draft.images],
      createdAt: new Date().toISOString(),
    };

    setConversations(
      availableConversations.map((item) =>
        item.id === selectedConversation.id
          ? {
            ...item,
            unread: 0,
            messages: [
              ...item.messages,
              newMessage,
            ],
          }
          : item,
      ),
    );
  };

  const handleBack = () => {
    setConversations(
      availableConversations.map((item) =>
        item.id === selectedId
          ? { ...item, unread: 0 }
          : item,
      ),
    );

    // 空字符串表示用户主动返回列表，
    // 与尚未选择的 null 区分。
    setSelection({
      rentalId,
      conversationId: '',
    });
  };

  return (
    <div
      className={`${styles.center} ${
        selectedConversation
          ? styles.hasSelection
          : ''
      }`}
    >
      <ConversationList
        conversations={sortedConversations}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      <section
        className={styles.threadPanel}
        aria-label="会話"
      >
        {selectedConversation ? (
          <MessageThread
            key={selectedConversation.id}
            conversation={selectedConversation}
            user={user}
            onSend={handleSend}
            onBack={handleBack}
          />
        ) : (
          <div className={styles.emptyThread}>
            <Empty
              description={
                rentalId && !requestedRental
                  ? '対象の物件が見つかりませんでした'
                  : '担当者を選択して会話を表示'
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
