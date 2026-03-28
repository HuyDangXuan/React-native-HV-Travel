"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapNotificationToInboxItem = exports.normalizeNotificationList = void 0;
const formatNotificationTime = (value) => {
    if (!value)
        return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const notificationDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayDiff = Math.round((today.getTime() - notificationDay.getTime()) / 86400000);
    if (dayDiff === 0)
        return "Hôm nay";
    if (dayDiff === 1)
        return "Hôm qua";
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        ...(date.getFullYear() === now.getFullYear() ? {} : { year: "2-digit" }),
    });
};
const getNotificationIcon = (type) => {
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
const normalizeNotificationList = (payload) => {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === "object") {
        const wrapped = payload;
        if (Array.isArray(wrapped.data)) {
            return wrapped.data;
        }
        if (Array.isArray(wrapped.notifications)) {
            return wrapped.notifications;
        }
        if (Array.isArray(wrapped.items)) {
            return wrapped.items;
        }
    }
    return [];
};
exports.normalizeNotificationList = normalizeNotificationList;
const mapNotificationToInboxItem = (notification) => ({
    id: notification.id,
    title: notification.title || "Thông báo",
    preview: notification.message || "Không có nội dung hiển thị.",
    time: formatNotificationTime(notification.createdAt),
    isUnread: !notification.isRead,
    systemIcon: getNotificationIcon(notification.type),
});
exports.mapNotificationToInboxItem = mapNotificationToInboxItem;
