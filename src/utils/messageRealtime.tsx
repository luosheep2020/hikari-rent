import type {
  MessageCursorPage,
  MessageResponse,
  MessageSessionResponse,
} from "@/types/message";

import type { MessageNotification } from "@/types/messageSocket";

export function messageSocketUrl(
  apiBase: string | undefined,
  origin: string,
  explicit?: string,
): string {
  if (!explicit && !apiBase) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing");
  }
  const url = explicit
    ? new URL(explicit, origin)
    : new URL("/ws/messages", apiBase);
  if (url.protocol === "http:") url.protocol = "ws:";
  if (url.protocol === "https:") url.protocol = "wss:";
  if (
    !["ws:", "wss:"].includes(url.protocol) ||
    url.search ||
    url.username ||
    url.password
  ) {
    throw new Error("Invalid WebSocket URL");
  }
  return url.toString();
}

export function parseMessageNotification(
  value: unknown,
): MessageNotification | null {
  if (
    !value ||
    typeof value !== "object" ||
    !("type" in value) ||
    value.type !== "message.changed" ||
    !("sessionId" in value) ||
    typeof value.sessionId !== "string" ||
    !/^[1-9]\d*$/.test(value.sessionId)
  )
    return null;
  return { type: "message.changed", sessionId: value.sessionId };
}

export function compareMessageIds(a: string, b: string): number {
  return a.length - b.length || a.localeCompare(b);
}

export function mergeMessages(
  ...groups: MessageResponse[][]
): MessageResponse[] {
  return [...new Map(groups.flat().map((row) => [row.id, row])).values()].sort(
    (a, b) => compareMessageIds(a.id, b.id),
  );
}

export function mergeSessions(
  ...groups: MessageSessionResponse[][]
): MessageSessionResponse[] {
  return [...new Map(groups.flat().map((row) => [row.id, row])).values()].sort(
    (a, b) => {
      const latest = (b.lastMessage?.createdAt ?? "").localeCompare(
        a.lastMessage?.createdAt ?? "",
      );
      if (latest) return latest;
      return compareMessageIds(
        b.lastMessage?.id ?? b.id,
        a.lastMessage?.id ?? a.id,
      );
    },
  );
}

// Recover all missed messages, including gaps larger than the latest page.
export async function collectMessageUpdates(
  fetchPage: (beforeId?: string) => Promise<MessageCursorPage<MessageResponse>>,
  latestKnownId?: string,
): Promise<MessageCursorPage<MessageResponse>> {
  let page = await fetchPage();
  let items = [...page.items];
  const visited = new Set<string>();
  let pages = 0;
  while (
    latestKnownId &&
    page.hasMore &&
    !page.items.some((row) => compareMessageIds(row.id, latestKnownId) <= 0)
    ) {
    if (!page.nextCursor || visited.has(page.nextCursor) || ++pages > 100) {
      throw new Error("メッセージの差分を取得できませんでした。");
    }
    visited.add(page.nextCursor);
    page = await fetchPage(page.nextCursor);
    items = [...items, ...page.items];
  }
  return { ...page, items: mergeMessages(items) };
}
