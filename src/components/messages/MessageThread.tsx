import { useLayoutEffect, useRef } from 'react';
import Link from 'next/link';
import { Alert, Avatar, Button, Empty, Image, Spin } from 'antd';
import { ArrowLeftOutlined, RightOutlined, UserOutlined } from '@ant-design/icons';

import type { MessageDraft, MessageResponse, MessageSessionResponse } from '@/types/message';
import MessageComposer from './MessageComposer';
import styles from './css/MessageCenter.module.css';

interface Props {
  session: MessageSessionResponse;
  messages: MessageResponse[];
  user: { nickname: string; avatar?: string };
  currentUserId: string | null;
  loading: boolean;
  error?: string;
  hasMore: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
  onRetry: () => void;
  onSend: (draft: MessageDraft) => Promise<void>;
  onBack: () => void;
}

function getDateKey(value: string): string {
  return new Date(value).toLocaleDateString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Tokyo',
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ja-JP', {
    month: 'long', day: 'numeric', timeZone: 'Asia/Tokyo',
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('ja-JP', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo',
  });
}

export default function MessageThread({
  session, messages, user, currentUserId, loading, error, hasMore,
  loadingOlder, onLoadOlder, onRetry, onSend, onBack,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const layoutRef = useRef<{
    sessionId: string; firstId?: string; lastId?: string; height: number; top: number;
  } | null>(null);

  const firstId = messages[0]?.id;
  const last = messages.at(-1);

  function scrollToBottom() {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const previous = layoutRef.current;
    if (!previous || previous.sessionId !== session.id || !previous.lastId) {
      scrollToBottom();
    } else if (previous.firstId !== firstId && previous.lastId === last?.id) {
      element.scrollTop = element.scrollHeight - previous.height + previous.top;
    } else if (previous.lastId !== last?.id && (
      nearBottomRef.current || (currentUserId !== null && last?.senderId === currentUserId)
    )) {
      scrollToBottom();
    }
    layoutRef.current = {
      sessionId: session.id, firstId, lastId: last?.id,
      height: element.scrollHeight, top: element.scrollTop,
    };
  }, [session.id, firstId, last?.id, last?.senderId, currentUserId, loading]);

  const rental = session.rental;

  return (
    <div className={styles.thread}>
      <header className={styles.threadHeader}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack}
          aria-label="会話一覧に戻る" className={styles.backButton} />
        <Avatar size={42} src={session.contact.avatar || undefined}
          icon={<UserOutlined />} className={styles.avatar} />
        <div className={styles.agentInfo}>
          <strong>{session.contact.name}</strong>
          <span>{session.contact.company}</span>
        </div>
        {rental && (
          <Link href={`/rentals/${rental.id}`} className={styles.propertyLink}>
            物件を見る<RightOutlined />
          </Link>
        )}
      </header>
      {rental && (
        <Link href={`/rentals/${rental.id}`} className={styles.propertyCard}>
          <Image src={rental.image || '/images/rentals/placeholder.svg'} alt=""
            width={96} height={62} preview={false} className={styles.propertyImage} />
          <div className={styles.propertyInfo}>
            <strong>{rental.name}</strong>
            <span>{rental.floorPlan} · {rental.area}㎡ · {rental.monthlyRent / 10000}万円</span>
          </div>
          <RightOutlined />
        </Link>
      )}
      <div ref={scrollRef} className={styles.messageList} onScroll={() => {
        const element = scrollRef.current;
        if (!element) return;
        nearBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
        if (layoutRef.current) {
          layoutRef.current.top = element.scrollTop;
          layoutRef.current.height = element.scrollHeight;
        }
      }}>
        {loading ? <Spin /> : error ? (
          <Alert type="error" title={error} showIcon
            action={<Button size="small" onClick={onRetry}>再試行</Button>} />
        ) : (
          <>
            {hasMore && <Button block type="text" loading={loadingOlder} onClick={onLoadOlder}>以前のメッセージを読み込む</Button>}
            {messages.length === 0 && <Empty description="メッセージを送って相談を始めましょう" />}
            {messages.map((item, index) => {
              const own = currentUserId !== null && item.senderId === currentUserId;
              const previous = messages[index - 1];
              const showDate = !previous || getDateKey(previous.createdAt) !== getDateKey(item.createdAt);
              return (
                <div key={item.id}>
                  {showDate && <div className={styles.dateDivider}>{formatDate(item.createdAt)}</div>}
                  <div className={`${styles.messageRow} ${own ? styles.ownMessage : ''}`}
                    aria-label={`${own ? user.nickname : session.contact.name}のメッセージ`}>
                    <Avatar size={32} src={own ? user.avatar : session.contact.avatar || undefined}
                      icon={<UserOutlined />} className={styles.avatar} />
                    <div className={styles.messageBody}>
                      <div className={styles.bubble}>
                        {item.images.length > 0 && (
                          <Image.PreviewGroup>
                            <div className={styles.messageImages}>
                              {item.images.map((image) => (
                                <Image key={image.id} src={image.url} alt={image.name} width="100%"
                                  className={styles.messageImage} onLoad={() => {
                                    if (nearBottomRef.current) scrollToBottom();
                                  }} />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                        )}
                        {item.text && <p>{item.text}</p>}
                      </div>
                      <time dateTime={item.createdAt} className={styles.messageTime}>{formatTime(item.createdAt)}</time>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      <MessageComposer onSend={onSend} disabled={loading || Boolean(error) || !currentUserId} />
    </div>
  );
}
