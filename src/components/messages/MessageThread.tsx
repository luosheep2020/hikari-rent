import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Avatar, Button, Image } from 'antd';
import {
  ArrowLeftOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';

import type {
  Conversation,
  MessageDraft,
} from '@/types/message';

import MessageComposer from './MessageComposer';
import styles from './css/MessageCenter.module.css';

type Props = {
  conversation: Conversation;
  user: {
    nickname: string;
    avatar?: string;
  };
  onSend: (draft: MessageDraft) => void;
  onBack: () => void;
};

function getDateKey(value: string): string {
  return new Date(value).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  });
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
}

export default function MessageThread({
                                        conversation,
                                        user,
                                        onSend,
                                        onBack,
                                      }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  const latestId = conversation.messages.at(-1)?.id;

  const scrollToBottom = () => {
    const element = scrollRef.current;

    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  };

  useEffect(() => {
    nearBottomRef.current = true;
    scrollToBottom();
  }, [conversation.id, latestId]);

  return (
    <div className={styles.thread}>
      <header className={styles.threadHeader}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          aria-label="会話一覧に戻る"
          className={styles.backButton}
        />

        <Avatar
          size={42}
          src={conversation.agent.avatar}
          icon={<UserOutlined />}
          className={styles.avatar}
        />

        <div className={styles.agentInfo}>
          <strong>{conversation.agent.name}</strong>
          <span>{conversation.agent.company}</span>
        </div>

        <Link
          href={`/rentals/${conversation.rental.id}`}
          className={styles.propertyLink}
        >
          物件を見る
          <RightOutlined />
        </Link>
      </header>

      <Link
        href={`/rentals/${conversation.rental.id}`}
        className={styles.propertyCard}
      >
        <Image
          src={conversation.rental.image}
          alt=""
          width={96}
          height={62}
          preview={false}
          className={styles.propertyImage}
        />

        <div className={styles.propertyInfo}>
          <strong>{conversation.rental.name}</strong>
          <span>{conversation.rental.summary}</span>
        </div>

        <RightOutlined />
      </Link>

      <div
        ref={scrollRef}
        className={styles.messageList}
        onScroll={() => {
          const element = scrollRef.current;

          if (element) {
            nearBottomRef.current =
              element.scrollHeight -
              element.scrollTop -
              element.clientHeight <
              80;
          }
        }}
      >
        <p className={styles.demoNotice}>
          デモ会話です。送信内容は担当者へ届きません。
        </p>

        {conversation.messages.map((item, index) => {
          const own = item.sender === 'user';
          const previous =
            conversation.messages[index - 1];

          const showDate =
            !previous ||
            getDateKey(previous.createdAt) !==
            getDateKey(item.createdAt);

          const senderName = own
            ? user.nickname
            : conversation.agent.name;

          return (
            <div key={item.id}>
              {showDate && (
                <div className={styles.dateDivider}>
                  {formatDate(item.createdAt)}
                </div>
              )}

              <div
                className={`${styles.messageRow} ${
                  own ? styles.ownMessage : ''
                }`}
                aria-label={`${senderName}のメッセージ`}
              >
                <Avatar
                  size={32}
                  src={
                    own
                      ? user.avatar
                      : conversation.agent.avatar
                  }
                  icon={<UserOutlined />}
                  className={styles.avatar}
                />

                <div className={styles.messageBody}>
                  <div className={styles.bubble}>
                    {item.images.length > 0 && (
                      <Image.PreviewGroup>
                        <div
                          className={styles.messageImages}
                        >
                          {item.images.map((image) => (
                            <Image
                              key={image.id}
                              src={image.url}
                              alt={image.name}
                              width="100%"
                              className={styles.messageImage}
                              onLoad={() => {
                                if (nearBottomRef.current) {
                                  scrollToBottom();
                                }
                              }}
                            />
                          ))}
                        </div>
                      </Image.PreviewGroup>
                    )}

                    {item.text && <p>{item.text}</p>}
                  </div>

                  <time
                    dateTime={item.createdAt}
                    className={styles.messageTime}
                  >
                    {formatTime(item.createdAt)}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <MessageComposer onSend={onSend} />
    </div>
  );
}
