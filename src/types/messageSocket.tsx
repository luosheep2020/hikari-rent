export type MessageConnectionStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "auth-error"
  | "configuration-error";

export interface MessageNotification {
  type: "message.changed";
  sessionId: string;
}
