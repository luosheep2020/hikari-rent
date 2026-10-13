import { useState } from 'react';
import { Avatar, Badge, Input } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';

import type { Conversation } from '@/types/message';

import styles from './css/MessageCenter.module.css';

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

export default function ConversationList({
                                           conversations,
                                           selectedId,
                                           onSelect,
                                         }: Props) {
  const [keyword, setKeyword] = useState('');

  const normalizedKeyword = keyword
    .normalize('NFKC')
    .trim()
    .toLowerCase();

  const filteredConversations = conversations.filter(
    (item) =>
      `${item.agent.name} ${item.agent.company}`
        .normalize('NFKC')
        .toLowerCase()
        .includes(normalizedKeyword),
  );

  return (
    <aside className={styles.conversationPanel}>
      <div className={styles.listHeading}>
        <h3>相談中の担当者</h3>

        <Input
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
          }}
          prefix={<SearchOutlined />}
          placeholder="担当者を検索"
          aria-label="担当者を検索"
          allowClear
        />
      </div>

      <div className={styles.conversationList}>
        {filteredConversations.map((conversation) => {
          const latest = conversation.messages.at(-1);

          const preview =
            latest?.text ||
            (latest?.images.length
              ? '画像を送信しました'
              : 'メッセージなし');

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={`${styles.conversationItem} ${
                selectedId === conversation.id
                  ? styles.selected
                  : ''
              }`}
              aria-pressed={
                selectedId === conversation.id
              }
            >
              <Avatar
                size={44}
                src={conversation.agent.avatar}
                icon={<UserOutlined />}
                className={styles.avatar}
              />

              <div className={styles.conversationInfo}>
                <strong>
                  {conversation.agent.name}
                </strong>

                <span>
                  {conversation.agent.company}
                </span>

                <p>{preview}</p>
              </div>

              <div className={styles.conversationMeta}>
                {latest && (
                  <time dateTime={latest.createdAt}>
                    {formatTime(latest.createdAt)}
                  </time>
                )}

                <Badge
                  count={conversation.unread}
                  color="#145447"
                  overflowCount={99}
                />
              </div>
            </button>
          );
        })}

        {filteredConversations.length === 0 && (
          <p className={styles.listEmpty}>
            担当者が見つかりませんでした
          </p>
        )}
      </div>
    </aside>
  );
}
