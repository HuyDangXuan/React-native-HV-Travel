// ============================================================
// Notification Model — Khớp với ASP.NET Backend entity "Notification"
// ============================================================

export type NotificationType = "Order" | "System" | "Promotion";

export interface Notification {
  id: string;
  recipientId?: string;       // ObjectId hoặc "ALL"
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt?: string;
}
