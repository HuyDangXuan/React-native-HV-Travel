import { Notification, NotificationType } from "../models/Notification";

export type InboxNotificationItem = {
  id: string;
  title: string;
  preview: string;
  time: string;
  isUnread: boolean;
  systemIcon: string;
};

const formatNotificationTime = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notificationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((today.getTime() - notificationDay.getTime()) / 86400000);

  if (dayDiff === 0) return "Hôm nay";
  if (dayDiff === 1) return "Hôm qua";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "2-digit" }),
  });
};

const getNotificationIcon = (type?: NotificationType) => {
  switch (type) {
    case "Promotion":
      return "pricetag-outline";
    case "Order":
      return "checkmark-circle-outline";
    case "System":
    default:
      return "notifications-outline";
  }
};

export const normalizeNotificationList = (payload: unknown): Notification[] => {
  if (Array.isArray(payload)) {
    return payload as Notification[];
  }

  if (payload && typeof payload === "object") {
    const wrapped = payload as {
      data?: unknown;
      notifications?: unknown;
      items?: unknown;
    };

    if (Array.isArray(wrapped.data)) {
      return wrapped.data as Notification[];
    }

    if (Array.isArray(wrapped.notifications)) {
      return wrapped.notifications as Notification[];
    }

    if (Array.isArray(wrapped.items)) {
      return wrapped.items as Notification[];
    }
  }

  return [];
};

export const mapNotificationToInboxItem = (
  notification: Notification
): InboxNotificationItem => ({
  id: notification.id,
  title: notification.title || "Thông báo",
  preview: notification.message || "Không có nội dung hiển thị.",
  time: formatNotificationTime(notification.createdAt),
  isUnread: !notification.isRead,
  systemIcon: getNotificationIcon(notification.type),
});
