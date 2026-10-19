import { useState } from 'react';
import { Avatar, Badge, Button, Input } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

import type { MessageSessionResponse } from '@/types/message';
import styles from './css/MessageCenter.module.css';

interface Props {
  sessions: MessageSessionResponse[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

function formatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo',
  });
}

export default function MessageSessionList({
  sessions, selectedId, onSelect, hasMore, loadingMore, onLoadMore,
}: Props) {
  const [keyword, setKeyword] = useState('');
  const normalized = keyword.normalize('NFKC').trim().toLowerCase();
  const filtered = sessions.filter((item) =>
    `${item.contact.name} ${item.contact.company}`
      .normalize('NFKC').toLowerCase().includes(normalized),
  );

  return (
    <aside className={styles.conversationPanel}>
      <div className={styles.listHeading}>
        <h3>相談中の担当者</h3>
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          prefix={<SearchOutlined />}
          placeholder="担当者を検索"
          aria-label="担当者を検索"
          allowClear
        />
      </div>
      <div className={styles.conversationList}>
        {filtered.map((session) => {
          const latest = session.lastMessage;
          const preview = latest?.text ||
            (latest?.imageCount ? '画像を送信しました' : 'メッセージなし');
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelect(session.id)}
              className={`${styles.conversationItem} ${selectedId === session.id ? styles.selected : ''}`}
              aria-pressed={selectedId === session.id}
            >
              <Avatar size={44} src={session.contact.avatar || undefined}
                icon={<UserOutlined />} className={styles.avatar} />
              <div className={styles.conversationInfo}>
                <strong>{session.contact.name}</strong>
                <span>{session.contact.company}</span>
                <p>{preview}</p>
              </div>
              <div className={styles.conversationMeta}>
                {latest && <time dateTime={latest.createdAt}>{formatTime(latest.createdAt)}</time>}
                <Badge count={session.unreadCount} color="#145447" overflowCount={99} />
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className={styles.listEmpty}>
            {normalized ? '担当者が見つかりませんでした' : '相談中の担当者はまだいません'}
          </p>
        )}
        {hasMore && (
          <Button block type="text" loading={loadingMore} onClick={onLoadMore}>
            さらに読み込む
          </Button>
        )}
      </div>
    </aside>
  );
}
