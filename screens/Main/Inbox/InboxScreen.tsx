import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import theme from "../../../config/theme";
import AppHeader from "../../../components/ui/AppHeader";
import IconButton from "../../../components/ui/IconButton";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingOverlay from "../../Loading/LoadingOverlay";
import { InboxItemSkeletonList } from "../../../components/skeleton/MainTabSkeletons";
import { useAuth } from "../../../context/AuthContext";
import { ChatService } from "../../../services/ChatService";
import { NotificationService } from "../../../services/NotificationService";
import { ChatConversationSummary } from "../../../services/dataAdapters";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import { shouldTriggerOverlayRefresh } from "../../../utils/pullToRefresh";
import { getPullRefreshDisplayState } from "../../../utils/loadingState";
import {
  InboxNotificationItem,
  mapNotificationToInboxItem,
  normalizeNotificationList,
} from "../../../utils/inboxNotifications";

type TabKey = "messages" | "notifications";

type ConversationFilters = {
  conversationCode: string;
  customerId: string;
};

type NotificationItem = InboxNotificationItem;

const EMPTY_FILTERS: ConversationFilters = {
  conversationCode: "",
  customerId: "",
};

const PULL_REFRESH_THRESHOLD = 72;

const formatInboxTime = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const sameYear = date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    ...(sameYear ? {} : { year: "2-digit" }),
  });
};

export default function InboxScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const hasLoadedMessagesRef = useRef(false);
  const hasLoadedNotificationsRef = useRef(false);
  const pullOffsetRef = useRef(0);

  const [activeTab, setActiveTab] = useState<TabKey>("messages");
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const [refreshingNotifications, setRefreshingNotifications] = useState(false);
  const [appliedFilters] = useState<ConversationFilters>(EMPTY_FILTERS);

  const unreadCount = useMemo(
    () => conversations.reduce((sum, item) => sum + item.unreadCount, 0),
    [conversations]
  );
  const unreadNotificationCount = useMemo(
    () => notifications.reduce((sum, item) => sum + (item.isUnread ? 1 : 0), 0),
    [notifications]
  );

  const {
    showInitialSkeleton: showInitialMessagesSkeleton,
    showRefreshSkeleton: showRefreshingMessagesSkeleton,
  } = getPullRefreshDisplayState({
    isLoading: loadingMessages,
    isRefreshing: refreshingMessages,
    data: conversations,
  });
  const {
    showInitialSkeleton: showInitialNotificationsSkeleton,
    showRefreshSkeleton: showRefreshingNotificationsSkeleton,
  } = getPullRefreshDisplayState({
    isLoading: loadingNotifications,
    isRefreshing: refreshingNotifications,
    data: notifications,
  });
  const showMessagesSkeleton =
    activeTab === "messages" &&
    (showInitialMessagesSkeleton || showRefreshingMessagesSkeleton);
  const showNotificationsSkeleton =
    activeTab === "notifications" &&
    (showInitialNotificationsSkeleton || showRefreshingNotificationsSkeleton);
  const isCurrentTabBusy =
    activeTab === "messages"
      ? loadingMessages || refreshingMessages
      : loadingNotifications || refreshingNotifications;

  const loadConversations = useCallback(
    async ({
      showSkeleton = true,
      showError = true,
      filters = appliedFilters,
    }: {
      showSkeleton?: boolean;
      showError?: boolean;
      filters?: ConversationFilters;
    } = {}) => {
      if (!token) {
        setConversations([]);
        setLoadingMessages(false);
        return;
      }

      try {
        if (showSkeleton) setLoadingMessages(true);
        const data = await ChatService.getConversations(token, filters);
        setConversations(data);
      } catch (error: any) {
        setConversations([]);
        if (showError) {
          MessageBoxService.error(
            "Lỗi",
            error?.message || "Không thể tải danh sách trò chuyện",
            "OK"
          );
        }
      } finally {
        if (showSkeleton) setLoadingMessages(false);
      }
    },
    [appliedFilters, token]
  );

  const loadNotifications = useCallback(
    async ({
      showSkeleton = true,
      showError = true,
    }: {
      showSkeleton?: boolean;
      showError?: boolean;
    } = {}) => {
      if (!token) {
        setNotifications([]);
        setLoadingNotifications(false);
        return;
      }

      try {
        if (showSkeleton) setLoadingNotifications(true);
        const response = await NotificationService.getNotifications(token);
        const items = normalizeNotificationList(response).map(mapNotificationToInboxItem);
        setNotifications(items);
      } catch (error: any) {
        setNotifications([]);
        if (showError) {
          MessageBoxService.error(
            "Lỗi",
            error?.message || "Không thể tải thông báo",
            "OK"
          );
        }
      } finally {
        if (showSkeleton) setLoadingNotifications(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (activeTab !== "messages" || hasLoadedMessagesRef.current) return;
    hasLoadedMessagesRef.current = true;
    loadConversations({ showSkeleton: true, showError: false });
  }, [activeTab, loadConversations]);

  useEffect(() => {
    if (activeTab !== "notifications" || hasLoadedNotificationsRef.current) return;
    hasLoadedNotificationsRef.current = true;
    loadNotifications({ showSkeleton: true, showError: false });
  }, [activeTab, loadNotifications]);

  const onRefreshMessages = useCallback(async () => {
    if (refreshingMessages || loadingMessages) return;
    setRefreshingMessages(true);
    try {
      await loadConversations({ showSkeleton: false, showError: true });
    } finally {
      setRefreshingMessages(false);
    }
  }, [loadConversations, loadingMessages, refreshingMessages]);

  const onRefreshNotifications = useCallback(async () => {
    if (refreshingNotifications || loadingNotifications) return;
    setRefreshingNotifications(true);
    try {
      await loadNotifications({ showSkeleton: false, showError: true });
    } finally {
      setRefreshingNotifications(false);
    }
  }, [loadNotifications, loadingNotifications, refreshingNotifications]);

  const onRefresh = useCallback(async () => {
    if (activeTab === "messages") {
      await onRefreshMessages();
      return;
    }

    await onRefreshNotifications();
  }, [activeTab, onRefreshMessages, onRefreshNotifications]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY < pullOffsetRef.current) {
      pullOffsetRef.current = offsetY;
    }
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    pullOffsetRef.current = 0;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (
      shouldTriggerOverlayRefresh({
        minOffsetY: pullOffsetRef.current,
        threshold: PULL_REFRESH_THRESHOLD,
        isBusy: isCurrentTabBusy,
      })
    ) {
      onRefresh();
    }
    pullOffsetRef.current = 0;
  }, [isCurrentTabBusy, onRefresh]);

  const handlePressConversation = useCallback(
    async (item: ChatConversationSummary) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === item.id
            ? { ...conversation, unreadCount: 0 }
            : conversation
        )
      );

      if (token && item.unreadCount > 0) {
        try {
          await ChatService.markConversationRead(token, item.id);
        } catch {
          // ChatScreen will sync the server state again.
        }
      }

      navigation.navigate("ChatScreen", {
        conversationId: item.id,
        title: item.title,
        status: item.status,
        unreadCount: item.unreadCount,
      });
    },
    [navigation, token]
  );

  const handlePressNotification = useCallback(
    async (item: NotificationItem) => {
      if (!token || !item.isUnread) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === item.id
            ? { ...notification, isUnread: false }
            : notification
        )
      );

      try {
        await NotificationService.markAsRead(token, item.id);
      } catch {
        // Keep UI responsive; the next refresh will resync if needed.
      }
    },
    [token]
  );

  const renderConversation = ({ item }: { item: ChatConversationSummary }) => (
    <Pressable
      style={[styles.messageRow, item.unreadCount > 0 && styles.messageRowUnread]}
      onPress={() => handlePressConversation(item)}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.systemAvatar}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
        </View>
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text
            style={[styles.messageName, item.unreadCount > 0 && styles.messageNameUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View style={styles.messageHeaderMeta}>
            <Text
              style={[styles.messageTime, item.unreadCount > 0 && styles.messageTimeUnread]}
              numberOfLines={1}
            >
              {formatInboxTime(item.lastMessageAt)}
            </Text>
            {item.unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unreadCount}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.messageStatus} numberOfLines={1}>
          {item.subtitle}
        </Text>

        <Text style={styles.messageMeta} numberOfLines={1}>
          {item.code ? `Mã: ${item.code}` : "Không có mã"}
          {item.customerId ? ` • Customer: ${item.customerId}` : ""}
        </Text>

        <Text
          style={[styles.messagePreview, item.unreadCount > 0 && styles.messagePreviewUnread]}
          numberOfLines={2}
        >
          {item.preview || "Chưa có nội dung hiển thị."}
        </Text>
      </View>
    </Pressable>
  );

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <Pressable
      style={[styles.messageRow, item.isUnread && styles.messageRowUnread]}
      onPress={() => handlePressNotification(item)}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.systemAvatar}>
          <Ionicons
            name={item.systemIcon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={theme.colors.primary}
          />
        </View>
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text
            style={[styles.messageName, item.isUnread && styles.messageNameUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View style={styles.messageHeaderMeta}>
            <Text style={[styles.messageTime, item.isUnread && styles.messageTimeUnread]}>
              {item.time}
            </Text>
            {item.isUnread ? <View style={styles.notificationDot} /> : null}
          </View>
        </View>

        <Text style={styles.notificationLabel}>Cập nhật hệ thống</Text>
        <Text
          style={[styles.messagePreview, item.isUnread && styles.messagePreviewUnread]}
          numberOfLines={2}
        >
          {item.preview}
        </Text>
      </View>
    </Pressable>
  );

  const renderMessagesEmptyState = () => {
    if (!token) {
      return (
        <EmptyState
          icon="lock-closed-outline"
          title="Bạn chưa đăng nhập"
          description="Đăng nhập để xem lịch sử trò chuyện với tư vấn viên."
        />
      );
    }

    return (
      <EmptyState
        icon="chatbubbles-outline"
        title="Chưa có tin nhắn"
        description="Tin nhắn từ đội ngũ hỗ trợ sẽ hiển thị tại đây khi bạn bắt đầu trò chuyện."
      />
    );
  };

  const renderNotificationsEmptyState = () => {
    if (!token) {
      return (
        <EmptyState
          icon="lock-closed-outline"
          title="Bạn chưa đăng nhập"
          description="Đăng nhập để xem thông báo mới nhất từ hệ thống."
        />
      );
    }

    return (
      <EmptyState
        icon="notifications-outline"
        title="Chưa có thông báo"
        description="Thông báo về khuyến mãi, đặt vé và nhắc nhở sẽ hiển thị tại đây."
      />
    );
  };

  const renderListSkeleton = () => (
    <View style={styles.listSkeletonWrap}>
      <InboxItemSkeletonList />
    </View>
  );

  const renderMessagesContent = () => {
    if (showMessagesSkeleton) {
      return renderListSkeleton();
    }

    return (
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderMessagesEmptyState}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.listContentEmpty,
        ]}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderNotificationsContent = () => {
    if (showNotificationsSkeleton) {
      return renderListSkeleton();
    }

    return (
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderNotificationsEmptyState}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listContentEmpty,
        ]}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppHeader
          variant="hero"
          title="Tin nhắn"
          subtitle=""
          right={<IconButton icon="options-outline" />}
        />

        <View style={styles.tabRow}>
          <Pressable
            style={[styles.tab, activeTab === "messages" && styles.tabActive]}
            onPress={() => setActiveTab("messages")}
          >
            <Text style={[styles.tabText, activeTab === "messages" && styles.tabTextActive]}>
              Tin nhắn
            </Text>
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === "notifications" && styles.tabActive]}
            onPress={() => setActiveTab("notifications")}
          >
            <Text
              style={[styles.tabText, activeTab === "notifications" && styles.tabTextActive]}
            >
              Thông báo
            </Text>
            {unreadNotificationCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotificationCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      {activeTab === "messages" ? renderMessagesContent() : renderNotificationsContent()}

      <LoadingOverlay
        visible={activeTab === "messages" ? refreshingMessages : refreshingNotifications}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
  },
  tabRow: {
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: theme.layout.topLevelPadding,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: theme.colors.text,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.gray,
  },
  tabTextActive: {
    fontWeight: "700",
    color: theme.colors.text,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  listContent: {
    paddingHorizontal: theme.layout.topLevelPadding,
    paddingTop: 4,
    paddingBottom: 24,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: "center",
  },
  listSkeletonWrap: {
    flex: 1,
    paddingHorizontal: theme.layout.topLevelPadding,
    paddingTop: 20,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 16,
  },
  messageRowUnread: {
    backgroundColor: "rgba(18, 181, 164, 0.03)",
  },
  avatarWrap: {
    paddingTop: 2,
  },
  systemAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 4,
  },
  messageHeaderMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  messageName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  messageNameUnread: {
    fontWeight: "800",
  },
  messageTime: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: "500",
  },
  messageTimeUnread: {
    color: theme.colors.primary,
    fontWeight: "700",
  },
  messageStatus: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.primary,
    marginBottom: 4,
  },
  messageMeta: {
    fontSize: 12,
    color: theme.colors.gray,
    marginBottom: 4,
  },
  notificationLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.gray,
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: theme.colors.gray,
    lineHeight: 20,
  },
  messagePreviewUnread: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.surface,
  },
});
