"use client";

import { useEffect, useRef, useState } from "react";
import type {
  MessageConnectionStatus,
  MessageNotification,
} from "@/types/messageSocket";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  messageSocketUrl,
  parseMessageNotification,
} from "@/utils/messageRealtime";

export function useMessageRealtime(
  onChanged: (event?: MessageNotification) => void,
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const userId = useAuthStore((state) => state.user?.id);
  const [status, setStatus] = useState<MessageConnectionStatus>("connecting");
  const callback = useRef(onChanged);
  useEffect(() => {
    callback.current = onChanged;
  }, [onChanged]);

  useEffect(() => {
    if (!accessToken || !userId) {
      setStatus("auth-error");
      return;
    }
    const expiration = expiresAt ? Date.parse(expiresAt) : Number.NaN;
    const invalidate = () => {
      if (useAuthStore.getState().accessToken === accessToken) {
        useAuthStore.getState().clearSession();
      }
    };
    if (!Number.isFinite(expiration) || expiration <= Date.now()) {
      setStatus("auth-error");
      invalidate();
      return;
    }

    let stopped = false;
    let socket: WebSocket | null = null;
    let attempt = 0;
    let receivedAt = Date.now();
    let retry: ReturnType<typeof setTimeout> | undefined;
    let authTimeout: ReturnType<typeof setTimeout> | undefined;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    const expirationTimer = setTimeout(
      invalidate,
      Math.min(expiration - Date.now(), 2147483647),
    );

    function connect() {
      if (stopped) return;
      setStatus(attempt ? "reconnecting" : "connecting");
      let current: WebSocket;
      try {
        current = new WebSocket(
          messageSocketUrl(
            process.env.NEXT_PUBLIC_API_BASE_URL,
            window.location.origin,
            process.env.NEXT_PUBLIC_WEBSOCKET_URL,
          ),
        );
      } catch {
        setStatus("configuration-error");
        return;
      }
      socket = current;
      authTimeout = setTimeout(() => current.close(), 10000);
      current.onopen = () => {
        if (stopped) return;
        // Credentials are sent in the first frame, not in a URL.
        current.send(JSON.stringify({ type: "auth", token: accessToken }));
      };
      current.onmessage = (event) => {
        if (stopped || current !== socket) return;
        receivedAt = Date.now();
        let frame: unknown;
        try {
          frame = JSON.parse(String(event.data));
        } catch {
          return;
        }
        if (
          frame &&
          typeof frame === "object" &&
          "type" in frame &&
          frame.type === "ready"
        ) {
          clearTimeout(authTimeout);
          clearInterval(heartbeat);
          attempt = 0;
          setStatus("connected");
          callback.current();
          heartbeat = setInterval(() => {
            if (Date.now() - receivedAt > 60000) {
              current.close();
              return;
            }
            if (current.readyState === WebSocket.OPEN)
              current.send(JSON.stringify({ type: "ping" }));
          }, 25000);
          return;
        }
        const notification = parseMessageNotification(frame);
        if (notification) callback.current(notification);
      };
      current.onclose = (event) => {
        clearTimeout(authTimeout);
        clearInterval(heartbeat);
        if (stopped || current !== socket) return;
        if (event.code === 4401) {
          setStatus("auth-error");
          invalidate();
          return;
        }
        setStatus("reconnecting");
        retry = setTimeout(
          connect,
          Math.min(30000, 1000 * 2 ** Math.min(attempt++, 5)) +
          Math.random() * 300,
        );
      };
      current.onerror = () => current.close();
    }
    function onVisible() {
      if (
        document.visibilityState === "visible" &&
        socket?.readyState === WebSocket.OPEN
      ) {
        callback.current();
      }
    }
    document.addEventListener("visibilitychange", onVisible);
    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      clearTimeout(authTimeout);
      clearTimeout(expirationTimer);
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisible);
      socket?.close();
    };
  }, [accessToken, expiresAt, userId]);

  return status;
}
