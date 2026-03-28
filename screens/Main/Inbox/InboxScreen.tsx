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

import AppHeader from "../../../components/ui/AppHeader";
import IconButton from "../../../components/ui/IconButton";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingOverlay from "../../Loading/LoadingOverlay";
import { InboxItemSkeletonList } from "../../../components/skeleton/MainTabSkeletons";
import { useAuth } from "../../../context/AuthContext";
import { useI18n } from "../../../context/I18nContext";
import { useAppTheme } from "../../../context/ThemeModeContext";
import { ChatService } from "../../../services/ChatService";
import { ChatConversationSummary } from "../../../services/dataAdapters";
import { MessageBoxService } from "../../MessageBox/MessageBoxService";
import { shouldTriggerOverlayRefresh } from "../../../utils/pullToRefresh";
import { getPullRefreshDisplayState } from "../../../utils/loadingState";

type ConversationFilters = {
  conversationCode: string;
  customerId: string;
};

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
  const { t } = useI18n();
  const theme = useAppTheme();
  const hasLoadedMessagesRef = useRef(false);
  const pullOffsetRef = useRef(0);

  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const [appliedFilters] = useState<ConversationFilters>(EMPTY_FILTERS);

  const unreadCount = useMemo(
    () => conversations.reduce((sum, item) => sum + item.unreadCount, 0),
    [conversations]
  );

  const {
    showInitialSkeleton: showInitialMessagesSkeleton,
    showRefreshSkeleton: showRefreshingMessagesSkeleton,
  } = getPullRefreshDisplayState({
    isLoading: loadingMessages,
    isRefreshing: refreshingMessages,
    data: conversations,
  });
  const showMessagesSkeleton = showInitialMessagesSkeleton || showRefreshingMessagesSkeleton;
  const isCurrentTabBusy = loadingMessages || refreshingMessages;

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
            t("common.close"),
            error?.message || t("inbox.emptyMessagesDescription"),
            t("common.ok")
          );
        }
      } finally {
        if (showSkeleton) setLoadingMessages(false);
      }
    },
    [appliedFilters, t, token]
  );

  useEffect(() => {
    if (hasLoadedMessagesRef.current) return;
    hasLoadedMessagesRef.current = true;
    loadConversations({ showSkeleton: true, showError: false });
  }, [loadConversations]);

  const onRefreshMessages = useCallback(async () => {
    if (refreshingMessages || loadingMessages) return;
    setRefreshingMessages(true);
    try {
      await loadConversations({ showSkeleton: false, showError: true });
    } finally {
      setRefreshingMessages(false);
    }
  }, [loadConversations, loadingMessages, refreshingMessages]);

  const onRefresh = useCallback(async () => {
    await onRefreshMessages();
  }, [onRefreshMessages]);

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
          conversation.id === item.id ? { ...conversation, unreadCount: 0 } : conversation
        )
      );

      if (token && item.unreadCount > 0) {
        try {
          await ChatService.markConversationRead(token, item.id);
        } catch {
          // Ignore optimistic update sync errors.
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

  const renderConversation = ({ item }: { item: ChatConversationSummary }) => (
    <Pressable
      style={[
        styles.messageRow,
        item.unreadCount > 0 && {
          backgroundColor:
            theme.name === "dark" ? "rgba(34, 211, 238, 0.08)" : "rgba(18, 181, 164, 0.03)",
        },
      ]}
      onPress={() => handlePressConversation(item)}
    >
      <View style={styles.avatarWrap}>
        <View style={[styles.systemAvatar, { backgroundColor: theme.colors.primaryLight }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
        </View>
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text
            style={[
              styles.messageName,
              { color: theme.semantic.textPrimary },
              item.unreadCount > 0 && styles.messageNameUnread,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View style={styles.messageHeaderMeta}>
            <Text
              style={[
                styles.messageTime,
                { color: theme.semantic.textSecondary },
                item.unreadCount > 0 && { color: theme.colors.primary, fontWeight: "700" },
              ]}
              numberOfLines={1}
            >
              {formatInboxTime(item.lastMessageAt)}
            </Text>
            {item.unreadCount > 0 ? (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.badgeText, { color: theme.colors.white }]}>
                  {item.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={[styles.messageStatus, { color: theme.colors.primary }]} numberOfLines={1}>
          {item.subtitle}
        </Text>

        <Text style={[styles.messageMeta, { color: theme.semantic.textSecondary }]} numberOfLines={1}>
          {item.code ? `Code: ${item.code}` : t("inbox.noCode")}
          {item.customerId ? ` • ${t("inbox.customerLabel")}: ${item.customerId}` : ""}
        </Text>

        <Text
          style={[
            styles.messagePreview,
            { color: theme.semantic.textSecondary },
            item.unreadCount > 0 && styles.messagePreviewUnread,
          ]}
          numberOfLines={2}
        >
          {item.preview || t("inbox.noPreview")}
        </Text>
      </View>
    </Pressable>
  );

  const renderMessagesEmptyState = () => {
    if (!token) {
      return (
        <EmptyState
          icon="lock-closed-outline"
          title={t("inbox.guestTitle")}
          description={t("inbox.guestMessagesDescription")}
        />
      );
    }

    return (
      <EmptyState
        icon="chatbubbles-outline"
        title={t("inbox.emptyMessagesTitle")}
        description={t("inbox.emptyMessagesDescription")}
      />
    );
  };

  const renderListSkeleton = () => (
    <View style={[styles.listSkeletonWrap, { paddingHorizontal: theme.layout.topLevelPadding }]}>
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
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.semantic.divider }]} />}
        ListEmptyComponent={renderMessagesEmptyState}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: theme.layout.topLevelPadding },
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}>
      <View style={[styles.header, { backgroundColor: theme.semantic.screenBackground }]}>
        <AppHeader
          variant="hero"
          title={t("inbox.title")}
          subtitle=""
          right={
            <IconButton
              icon="notifications-outline"
              badgeText={0}
              onPress={() => navigation.navigate("NotificationScreen")}
            />
          }
        />
      </View>

      {renderMessagesContent()}

      <LoadingOverlay visible={refreshingMessages} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {},
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: "center",
  },
  listSkeletonWrap: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    gap: 14,
    paddingVertical: 16,
    borderRadius: 18,
    paddingHorizontal: 8,
  },
  avatarWrap: {
    paddingTop: 2,
  },
  systemAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
  },
  messageNameUnread: {
    fontWeight: "800",
  },
  messageTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  messageStatus: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  messageMeta: {
    fontSize: 12,
    marginBottom: 6,
  },
  messagePreview: {
    fontSize: 13,
    lineHeight: 20,
  },
  messagePreviewUnread: {
    fontWeight: "600",
  },
  separator: {
    height: 1,
  },
});
