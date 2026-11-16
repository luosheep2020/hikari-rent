"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, App, Button, Empty, Spin, Tag } from "antd";
import { messagesApi } from "@/api/messages";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMessageRealtime } from "@/hooks/useMessageRealtime";
import {
  collectMessageUpdates,
  compareMessageIds,
  mergeMessages,
  mergeSessions,
} from "@/utils/messageRealtime";
import type {
  MessageDraft,
  MessageResponse,
  MessageSessionResponse,
} from "@/types/message";
import MessageSessionList from "./MessageSessionList";
import MessageThread from "./MessageThread";
import styles from "./css/MessageCenter.module.css";

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
interface ReadPosition {
  acknowledged?: string;
  target: string;
  pending: boolean;
}
const emptySessions = (): SessionState => ({
  key: "",
  items: [],
  nextCursor: null,
  hasMore: false,
});
const emptyRecords = (): RecordState => ({
  key: "",
  items: [],
  nextCursor: null,
  hasMore: false,
});

export default function MessageCenter(props: Props) {
  return <MessageCenterContent key={props.user.id} {...props} />;
}

function MessageCenterContent({ user }: Props) {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const rentalId = searchParams.get("rentalId");
  const requestedSessionId = searchParams.get("sessionId");
  const routeKey = JSON.stringify([rentalId, requestedSessionId]);
  const accessToken = useAuthStore((state) => state.accessToken);
  const authUserId = useAuthStore((state) => state.user?.id);
  const currentUserId =
    accessToken && authUserId === user.id && /^[1-9]\d*$/.test(user.id)
      ? user.id
      : null;
  const alive = useRef(false);
  const activeId = useRef<string | null>(null);
  const sendPending = useRef(false);
  const morePending = useRef(false);
  const olderPending = useRef(false);
  const backgroundRequests = useRef(new Set<AbortController>());
  const synchronizeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const readPositions = useRef(new Map<string, ReadPosition>());
  const sessionRef = useRef<SessionState>(emptySessions());
  const recordRef = useRef<RecordState>(emptyRecords());
  const [sessions, setSessions] = useState<SessionState>(emptySessions);
  const [records, setRecords] = useState<RecordState>(emptyRecords);
  const [revision, setRevision] = useState(0);
  const [openRetry, setOpenRetry] = useState(0);
  const [recordRetry, setRecordRetry] = useState(0);
  const [opening, setOpening] = useState<{
    key: string;
    id?: string;
    error?: string;
  }>({ key: "" });
  const [selection, setSelection] = useState<{
    key: string;
    id: string | null;
  } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const writeSessions = useCallback((next: SessionState) => {
    sessionRef.current = next;
    setSessions(next);
  }, []);
  const writeRecords = useCallback((next: RecordState) => {
    recordRef.current = next;
    setRecords(next);
  }, []);
  const synchronize = useCallback(() => {
    if (synchronizeTimer.current) return;
    synchronizeTimer.current = setTimeout(() => {
      synchronizeTimer.current = null;
      if (alive.current) setRevision((value) => value + 1);
    }, 100);
  }, []);
  const connection = useMessageRealtime(synchronize);

  useEffect(() => {
    alive.current = true;
    const controllers = backgroundRequests.current;
    return () => {
      alive.current = false;
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
      if (synchronizeTimer.current) clearTimeout(synchronizeTimer.current);
    };
  }, []);

  const openingRequired = Boolean(rentalId && !requestedSessionId);
  const openingKey = JSON.stringify([routeKey, openRetry]);
  const openingPending = openingRequired && opening.key !== openingKey;
  const openingError =
    openingRequired && !openingPending ? opening.error : undefined;
  const targetId =
    requestedSessionId ||
    (openingRequired && !openingPending ? opening.id : null) ||
    null;
  const listKey = routeKey;
  const listReady = sessions.key === listKey;
  const sessionItems = listReady ? sessions.items : [];
  const selectedId =
    selection?.key === routeKey
      ? selection.id
      : targetId || sessionItems[0]?.id || null;
  const selectedSession = sessionItems.find((item) => item.id === selectedId);
  const selectedSessionId = selectedSession?.id;
  const recordsReady = !!selectedSessionId && records.key === selectedSessionId;
  useEffect(() => {
    activeId.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (!currentUserId || !rentalId || requestedSessionId) return;
    const controller = new AbortController();
    void messagesApi
      .openSession({ rentalId }, controller.signal)
      .then((created) => {
        if (!controller.signal.aborted)
          setOpening({ key: openingKey, id: created.id });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setOpening({
            key: openingKey,
            error: "相談を開始できませんでした。",
          });
      });
    return () => controller.abort();
  }, [currentUserId, accessToken, rentalId, requestedSessionId, openingKey]);

  useEffect(() => {
    if (!currentUserId || openingPending || openingError) return;
    const controller = new AbortController();
    async function load() {
      try {
        let page = await messagesApi.getSessions({}, controller.signal);
        let items = page.items;
        const visited = new Set<string>();
        while (
          targetId &&
          !items.some((item) => item.id === targetId) &&
          page.hasMore
          ) {
          if (
            !page.nextCursor ||
            visited.has(page.nextCursor) ||
            visited.size >= 100
          )
            throw new Error("Invalid session pagination cursor");
          visited.add(page.nextCursor);
          page = await messagesApi.getSessions(
            { cursor: page.nextCursor },
            controller.signal,
          );
          items = mergeSessions(items, page.items);
        }
        if (controller.signal.aborted) return;
        const previous = sessionRef.current;
        writeSessions({
          key: listKey,
          items: mergeSessions(
            previous.key === listKey ? previous.items : [],
            items,
          ),
          nextCursor: page.nextCursor,
          hasMore: page.hasMore,
        });
      } catch {
        if (controller.signal.aborted) return;
        const previous = sessionRef.current;
        writeSessions({
          ...(previous.key === listKey ? previous : emptySessions()),
          key: listKey,
          error: "会話一覧を読み込めませんでした。",
        });
      }
    }
    void load();
    return () => controller.abort();
  }, [
    currentUserId,
    accessToken,
    listKey,
    targetId,
    openingPending,
    openingError,
    revision,
    writeSessions,
  ]);

  useEffect(() => {
    if (!selectedSessionId || !currentUserId) return;
    const controller = new AbortController();
    const previous = recordRef.current;
    const latest =
      previous.key === selectedSessionId
        ? previous.items.at(-1)?.id
        : undefined;
    void collectMessageUpdates(
      (beforeId) =>
        messagesApi.getMessages(
          selectedSessionId,
          { beforeId },
          controller.signal,
        ),
      latest,
    )
      .then((page) => {
        if (controller.signal.aborted) return;
        const current = recordRef.current;
        const same = current.key === selectedSessionId;
        writeRecords({
          key: selectedSessionId,
          items: mergeMessages(same ? current.items : [], page.items),
          nextCursor: latest && same ? current.nextCursor : page.nextCursor,
          hasMore: latest && same ? current.hasMore : page.hasMore,
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        const current = recordRef.current;
        writeRecords({
          ...(current.key === selectedSessionId ? current : emptyRecords()),
          key: selectedSessionId,
          error: "メッセージを読み込めませんでした。",
        });
      });
    return () => controller.abort();
  }, [
    selectedSessionId,
    currentUserId,
    accessToken,
    revision,
    recordRetry,
    writeRecords,
  ]);

  const markVisibleRead = useCallback(
    (sessionId: string, messageId: string) => {
      if (!/^[1-9]\d*$/.test(messageId) || activeId.current !== sessionId)
        return;
      let position = readPositions.current.get(sessionId);
      if (!position) {
        position = { target: messageId, pending: false };
        readPositions.current.set(sessionId, position);
      }
      if (compareMessageIds(position.target, messageId) < 0)
        position.target = messageId;
      if (
        position.pending ||
        (position.acknowledged &&
          compareMessageIds(position.acknowledged, position.target) >= 0)
      )
        return;
      position.pending = true;
      const pending = position;
      const token = useAuthStore.getState().accessToken;
      void (async () => {
        try {
          while (
            alive.current &&
            activeId.current === sessionId &&
            document.visibilityState === "visible" &&
            document.hasFocus() &&
            useAuthStore.getState().accessToken === token
            ) {
            const target = pending.target;
            if (
              pending.acknowledged &&
              compareMessageIds(pending.acknowledged, target) >= 0
            )
              break;
            await messagesApi.markAsRead(sessionId, {
              lastReadMessageId: target,
            });
            pending.acknowledged = target;
            if (!alive.current || useAuthStore.getState().accessToken !== token)
              return;
            const state = sessionRef.current;
            // Do not clear a badge for messages that arrived after this acknowledgement.
            writeSessions({
              ...state,
              items: state.items.map((item) =>
                item.id === sessionId &&
                (!item.lastMessage ||
                  compareMessageIds(item.lastMessage.id, target) <= 0)
                  ? { ...item, unreadCount: 0 }
                  : item,
              ),
            });
          }
        } catch {
          // A new visible message or focus event retries a failed acknowledgement.
        } finally {
          pending.pending = false;
        }
      })();
    },
    [writeSessions],
  );

  async function loadMoreSessions() {
    const state = sessionRef.current;
    if (
      !listReady ||
      !state.hasMore ||
      !state.nextCursor ||
      morePending.current
    )
      return;
    morePending.current = true;
    setLoadingMore(true);
    const cursor = state.nextCursor;
    const controller = new AbortController();
    backgroundRequests.current.add(controller);
    try {
      const page = await messagesApi.getSessions({ cursor }, controller.signal);
      if (
        !alive.current ||
        controller.signal.aborted ||
        sessionRef.current.key !== listKey
      )
        return;
      const current = sessionRef.current;
      writeSessions({
        ...current,
        items: mergeSessions(page.items, current.items),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore && page.nextCursor !== cursor,
      });
    } catch {
      if (alive.current && !controller.signal.aborted)
        message.error("会話を読み込めませんでした");
    } finally {
      backgroundRequests.current.delete(controller);
      morePending.current = false;
      if (alive.current) setLoadingMore(false);
    }
  }

  async function loadOlderMessages() {
    const state = recordRef.current;
    if (
      !selectedSessionId ||
      !recordsReady ||
      !state.hasMore ||
      !state.nextCursor ||
      olderPending.current
    )
      return;
    olderPending.current = true;
    setLoadingOlder(true);
    const cursor = state.nextCursor;
    const controller = new AbortController();
    backgroundRequests.current.add(controller);
    try {
      const page = await messagesApi.getMessages(
        selectedSessionId,
        { beforeId: cursor },
        controller.signal,
      );
      if (
        !alive.current ||
        controller.signal.aborted ||
        recordRef.current.key !== selectedSessionId
      )
        return;
      const current = recordRef.current;
      writeRecords({
        ...current,
        items: mergeMessages(page.items, current.items),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore && page.nextCursor !== cursor,
      });
    } catch {
      if (alive.current && !controller.signal.aborted)
        message.error("以前のメッセージを読み込めませんでした");
    } finally {
      backgroundRequests.current.delete(controller);
      olderPending.current = false;
      if (alive.current) setLoadingOlder(false);
    }
  }

  async function handleSend(draft: MessageDraft): Promise<void> {
    if (!selectedSessionId || !currentUserId || sendPending.current)
      throw new Error("The message session is not ready");
    sendPending.current = true;
    const sessionId = selectedSessionId;
    const token = useAuthStore.getState().accessToken;
    try {
      const saved = await messagesApi.sendMessage(sessionId, {
        clientMessageId: draft.clientMessageId,
        text: draft.text,
        attachmentIds: draft.images.map((image) => image.id),
      });
      if (!alive.current || useAuthStore.getState().accessToken !== token)
        return;
      const state = recordRef.current;
      if (state.key === sessionId)
        writeRecords({
          ...state,
          items: mergeMessages(state.items, [saved]),
          error: undefined,
        });
      const list = sessionRef.current;
      const updated = list.items.find((item) => item.id === sessionId);
      if (updated)
        writeSessions({
          ...list,
          items: mergeSessions(list.items, [
            {
              ...updated,
              lastMessage: {
                id: saved.id,
                senderId: saved.senderId,
                text: saved.text,
                imageCount: saved.images.length,
                createdAt: saved.createdAt,
              },
            },
          ]),
        });
      synchronize();
    } finally {
      sendPending.current = false;
    }
  }

  if (!currentUserId)
    return (
      <Alert
        type="info"
        showIcon
        title="ログイン情報を確認できません。ログインし直してください。"
      />
    );
  if (openingPending || (!listReady && !openingError))
    return (
      <div className={styles.emptyThread}>
        <Spin />
      </div>
    );
  if (openingError)
    return (
      <Alert
        type="error"
        showIcon
        title={openingError}
        action={
          <Button
            size="small"
            onClick={() => setOpenRetry((value) => value + 1)}
          >
            再試行
          </Button>
        }
      />
    );

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 12,
        }}
      >
        <Tag
          color={
            connection === "connected"
              ? "green"
              : connection === "auth-error" ||
              connection === "configuration-error"
                ? "red"
                : "gold"
          }
        >
          {connection === "connected"
            ? "接続中"
            : connection === "connecting"
              ? "接続しています"
              : connection === "reconnecting"
                ? "再接続しています"
                : connection === "auth-error"
                  ? "ログインを確認してください"
                  : "接続設定を確認してください"}
        </Tag>
      </div>
      {sessions.error && (
        <Alert
          type="error"
          showIcon
          title={sessions.error}
          action={
            <Button size="small" onClick={synchronize}>
              再試行
            </Button>
          }
        />
      )}
      <div
        className={`${styles.center} ${selectedSession ? styles.hasSelection : ""}`}
      >
        <MessageSessionList
          sessions={sessionItems}
          selectedId={selectedId}
          onSelect={(id) => setSelection({ key: routeKey, id })}
          hasMore={sessions.hasMore}
          loadingMore={loadingMore}
          onLoadMore={() => {
            void loadMoreSessions();
          }}
        />
        <section className={styles.threadPanel} aria-label="メッセージ">
          {selectedSession ? (
            <MessageThread
              key={selectedSession.id}
              session={selectedSession}
              messages={recordsReady ? records.items : []}
              user={user}
              currentUserId={currentUserId}
              loading={!recordsReady}
              error={recordsReady ? records.error : undefined}
              hasMore={recordsReady && records.hasMore}
              loadingOlder={loadingOlder}
              onLoadOlder={() => {
                void loadOlderMessages();
              }}
              onRetry={() => setRecordRetry((value) => value + 1)}
              onSend={handleSend}
              onVisibleRead={markVisibleRead}
              onBack={() => setSelection({ key: routeKey, id: null })}
            />
          ) : (
            <div className={styles.emptyThread}>
              <Empty
                description={
                  targetId && !sessionItems.some((item) => item.id === targetId)
                    ? "対象の会話が見つかりませんでした"
                    : "担当者を選択してメッセージを表示"
                }
              />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
