'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, App, Button, Empty, Spin } from 'antd';

import { messagesApi } from '@/api/messages';
import type {
  MessageDraft, MessageResponse, MessageSessionResponse,
} from '@/types/message';
import MessageSessionList from './MessageSessionList';
import MessageThread from './MessageThread';
import styles from './css/MessageCenter.module.css';

interface Props {
  user: { id: string; nickname: string; avatar?: string };
}

interface SessionState {
  key: string;
  items: MessageSessionResponse[];
  nextCursor: string | null;
  hasMore: boolean;
  error?: string;
}

interface RecordState {
  key: string;
  items: MessageResponse[];
  nextCursor: string | null;
  hasMore: boolean;
  error?: string;
}

function uniqueSessions(items: MessageSessionResponse[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function mergeMessages(items: MessageResponse[]): MessageResponse[] {
  return [...new Map(items.map((item) => [item.id, item])).values()].sort((a, b) => {
    const difference = Date.parse(a.createdAt) - Date.parse(b.createdAt);
    if (difference) return difference;
    if (/^\d+$/.test(a.id) && /^\d+$/.test(b.id)) {
      return BigInt(a.id) < BigInt(b.id) ? -1 : BigInt(a.id) > BigInt(b.id) ? 1 : 0;
    }
    return a.id.localeCompare(b.id);
  });
}

// Demo IDs are not database user IDs. The override is for display only.
function resolveUserId(userId: string): string | null {
  if (/^[1-9]\d*$/.test(userId)) return userId;
  if (process.env.NODE_ENV === 'development') {
    const configured = process.env.NEXT_PUBLIC_DEV_USER_ID;
    if (configured && /^[1-9]\d*$/.test(configured)) return configured;
  }
  return null;
}

export default function MessageCenter(props: Props) {
  // Reset all message state when the signed-in frontend user changes.
  return <MessageCenterContent key={props.user.id} {...props} />;
}

function MessageCenterContent({ user }: Props) {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const rentalId = searchParams.get('rentalId');
  const requestedSessionId = searchParams.get('sessionId');
  const routeKey = JSON.stringify([rentalId, requestedSessionId]);
  const currentUserId = resolveUserId(user.id);
  const aliveRef = useRef(false);
  const activeIdRef = useRef<string | null>(null);
  const sendPendingRef = useRef(false);
  const moreSessionsRef = useRef(false);
  const olderMessagesRef = useRef(false);

  const [refresh, setRefresh] = useState(0);
  const [messageRefresh, setMessageRefresh] = useState(0);
  const [opening, setOpening] = useState<{ key: string; id?: string; error?: string }>({ key: '' });
  const [selection, setSelection] = useState<{ key: string; id: string | null } | null>(null);
  const [sessions, setSessions] = useState<SessionState>({ key: '', items: [], nextCursor: null, hasMore: false });
  const [records, setRecords] = useState<RecordState>({ key: '', items: [], nextCursor: null, hasMore: false });
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  const openingRequired = Boolean(rentalId && !requestedSessionId);
  const openingPending = openingRequired && opening.key !== JSON.stringify([routeKey, refresh]);
  const openingError = openingRequired && !openingPending ? opening.error : undefined;
  const targetId = requestedSessionId || (openingRequired && !openingPending ? opening.id : null) || null;
  const listKey = JSON.stringify([user.id, refresh, targetId]);
  const listReady = sessions.key === listKey;
  const sessionItems = listReady ? sessions.items : [];
  const selectedId = selection?.key === routeKey
    ? selection.id
    : targetId || sessionItems[0]?.id || null;
  const selectedSession = sessionItems.find((item) => item.id === selectedId);
  const recordsKey = JSON.stringify([selectedSession?.id, messageRefresh]);
  const recordsReady = records.key === recordsKey;

  useEffect(() => { activeIdRef.current = selectedId; }, [selectedId]);

  useEffect(() => {
    if (!rentalId || requestedSessionId) return;
    const controller = new AbortController();
    const key = JSON.stringify([routeKey, refresh]);
    void messagesApi.openSession({ rentalId }, controller.signal).then((created) => {
      if (!controller.signal.aborted) setOpening({ key, id: created.id });
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error('Failed to open message session:', error);
      setOpening({ key, error: '相談を開始できませんでした。もう一度お試しください。' });
    });
    return () => controller.abort();
  }, [rentalId, requestedSessionId, routeKey, refresh]);

  useEffect(() => {
    if (openingPending || openingError) return;
    const controller = new AbortController();
    async function load() {
      try {
        let page = await messagesApi.getSessions({}, controller.signal);
        let items = page.items;
        const visited = new Set<string>();
        // Locate a requested existing session even when it is on a later page.
        while (targetId && !items.some((item) => item.id === targetId) && page.hasMore) {
          if (!page.nextCursor || visited.has(page.nextCursor)) {
            throw new Error('Invalid session pagination cursor');
          }
          visited.add(page.nextCursor);
          page = await messagesApi.getSessions({ cursor: page.nextCursor }, controller.signal);
          items = uniqueSessions([...items, ...page.items]);
        }
        if (!controller.signal.aborted) setSessions({
          key: listKey, items, nextCursor: page.nextCursor, hasMore: page.hasMore,
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;
        console.error('Failed to load message sessions:', error);
        setSessions({ key: listKey, items: [], nextCursor: null, hasMore: false,
          error: '会話一覧を読み込めませんでした。' });
      }
    }
    void load();
    return () => controller.abort();
  }, [listKey, targetId, openingPending, openingError]);

  const markRead = useCallback(async (sessionId: string, messageId?: string) => {
    if (!messageId) return;
    try {
      await messagesApi.markAsRead(sessionId, { lastReadMessageId: messageId });
      if (aliveRef.current) setSessions((state) => ({ ...state,
        items: state.items.map((item) => item.id === sessionId ? { ...item, unreadCount: 0 } : item),
      }));
    } catch (error: unknown) {
      console.warn('Failed to update the read position:', error);
    }
  }, []);

  const selectedSessionId = selectedSession?.id;
  useEffect(() => {
    if (!selectedSessionId) return;
    const controller = new AbortController();
    void messagesApi.getMessages(selectedSessionId, {}, controller.signal).then((page) => {
      if (controller.signal.aborted) return;
      const items = mergeMessages(page.items);
      setRecords({ key: recordsKey, items, nextCursor: page.nextCursor, hasMore: page.hasMore });
      void markRead(selectedSessionId, items.at(-1)?.id);
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error('Failed to load messages:', error);
      setRecords({ key: recordsKey, items: [], nextCursor: null, hasMore: false,
        error: 'メッセージを読み込めませんでした。' });
    });
    return () => controller.abort();
  }, [selectedSessionId, recordsKey, markRead]);

  async function loadMoreSessions() {
    if (!listReady || !sessions.hasMore || !sessions.nextCursor || moreSessionsRef.current) return;
    moreSessionsRef.current = true;
    setLoadingMore(true);
    const cursor = sessions.nextCursor;
    try {
      const page = await messagesApi.getSessions({ cursor });
      if (!aliveRef.current) return;
      setSessions((state) => state.key !== listKey ? state : ({
        ...state, items: uniqueSessions([...state.items, ...page.items]),
        nextCursor: page.nextCursor, hasMore: page.hasMore && page.nextCursor !== cursor,
      }));
    } catch (error: unknown) {
      console.error('Failed to load more message sessions:', error);
      if (aliveRef.current) message.error('会話を読み込めませんでした');
    } finally {
      moreSessionsRef.current = false;
      if (aliveRef.current) setLoadingMore(false);
    }
  }

  async function loadOlderMessages() {
    if (!selectedSessionId || !recordsReady || !records.hasMore || !records.nextCursor || olderMessagesRef.current) return;
    olderMessagesRef.current = true;
    setLoadingOlder(true);
    const cursor = records.nextCursor;
    try {
      const page = await messagesApi.getMessages(selectedSessionId, { beforeId: cursor });
      if (!aliveRef.current) return;
      setRecords((state) => state.key !== recordsKey ? state : ({
        ...state, items: mergeMessages([...page.items, ...state.items]),
        nextCursor: page.nextCursor, hasMore: page.hasMore && page.nextCursor !== cursor,
      }));
    } catch (error: unknown) {
      console.error('Failed to load older messages:', error);
      if (aliveRef.current) message.error('以前のメッセージを読み込めませんでした');
    } finally {
      olderMessagesRef.current = false;
      if (aliveRef.current) setLoadingOlder(false);
    }
  }

  async function handleSend(draft: MessageDraft): Promise<void> {
    if (!selectedSessionId || !currentUserId || sendPendingRef.current) {
      throw new Error('The message session is not ready');
    }
    sendPendingRef.current = true;
    const sessionId = selectedSessionId;
    try {
      const saved = await messagesApi.sendMessage(sessionId, {
        clientMessageId: draft.clientMessageId,
        text: draft.text,
        attachmentIds: draft.images.map((image) => image.id),
      });
      if (!aliveRef.current) return;
      setRecords((state) => state.key !== recordsKey ? state : ({
        ...state, items: mergeMessages([...state.items, saved]),
      }));
      setSessions((state) => {
        const updated = state.items.find((item) => item.id === sessionId);
        if (!updated) return state;
        return { ...state, items: [{ ...updated, lastMessage: {
          id: saved.id, senderId: saved.senderId, text: saved.text,
          imageCount: saved.images.length, createdAt: saved.createdAt,
        } }, ...state.items.filter((item) => item.id !== sessionId)] };
      });
      if (activeIdRef.current === sessionId) void markRead(sessionId, saved.id);
    } finally {
      sendPendingRef.current = false;
    }
  }

  if (openingPending || (!listReady && !openingError)) {
    return <div className={styles.emptyThread}><Spin /></div>;
  }

  const pageError = openingError || (listReady ? sessions.error : undefined);
  if (pageError) {
    return <Alert type="error" showIcon title={pageError}
      action={<Button size="small" onClick={() => setRefresh((value) => value + 1)}>再試行</Button>} />;
  }

  return (
    <>
      {!currentUserId && <Alert type="info" showIcon title="ログイン情報を確認できません。ログインし直してください。" />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button size="small" onClick={() => {
          setRefresh((value) => value + 1);
          setMessageRefresh((value) => value + 1);
        }}>更新</Button>
      </div>
      <div className={`${styles.center} ${selectedSession ? styles.hasSelection : ''}`}>
        <MessageSessionList sessions={sessionItems} selectedId={selectedId}
          onSelect={(id) => setSelection({ key: routeKey, id })}
          hasMore={sessions.hasMore} loadingMore={loadingMore}
          onLoadMore={() => { void loadMoreSessions(); }} />
        <section className={styles.threadPanel} aria-label="メッセージ">
          {selectedSession ? (
            <MessageThread key={selectedSession.id} session={selectedSession}
              messages={recordsReady ? records.items : []} user={user}
              currentUserId={currentUserId} loading={!recordsReady}
              error={recordsReady ? records.error : undefined}
              hasMore={recordsReady && records.hasMore} loadingOlder={loadingOlder}
              onLoadOlder={() => { void loadOlderMessages(); }}
              onRetry={() => setMessageRefresh((value) => value + 1)}
              onSend={handleSend}
              onBack={() => setSelection({ key: routeKey, id: null })} />
          ) : (
            <div className={styles.emptyThread}>
              <Empty description={targetId && !sessionItems.some((item) => item.id === targetId)
                ? '対象の会話が見つかりませんでした' : '担当者を選択してメッセージを表示'} />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
