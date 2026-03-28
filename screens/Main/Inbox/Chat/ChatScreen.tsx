import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import theme from "../../../../config/theme";
import AppHeader from "../../../../components/ui/AppHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import SectionCard from "../../../../components/ui/SectionCard";
import { ChatTimelineSkeletonList } from "../../../../components/skeleton/MainTabSkeletons";
import LoadingOverlay from "../../../Loading/LoadingOverlay";
import { useAuth } from "../../../../context/AuthContext";
import { ChatService } from "../../../../services/ChatService";
import {
  ChatMessageItem,
  getChatConversationSubtitle,
} from "../../../../services/dataAdapters";
import { MessageBoxService } from "../../../MessageBox/MessageBoxService";
import { shouldTriggerOverlayRefresh } from "../../../../utils/pullToRefresh";

type ChatRouteParams = {
  conversationId?: string;
  title?: string;
  status?: string;
  unreadCount?: number;
};

type ChatTimelineItem =
  | { id: string; type: "date"; label: string }
  | { id: string; type: "message"; message: ChatMessageItem };

const PULL_REFRESH_THRESHOLD = 72;

const formatMessageTime = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateLabel = (value?: string) => {
  if (!value) return "Không rõ ngày";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ ngày";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((today.getTime() - messageDay.getTime()) / 86400000);

  if (dayDiff === 0) return "Hôm nay";
  if (dayDiff === 1) return "Hôm qua";

  return date.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const buildTimeline = (messages: ChatMessageItem[]): ChatTimelineItem[] => {
  const items: ChatTimelineItem[] = [];
  let currentDayKey = "";

  messages.forEach((message, index) => {
    const date = new Date(message.sentAt ?? "");
    const dayKey = Number.isNaN(date.getTime())
      ? `unknown-${index}`
      : `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (dayKey !== currentDayKey) {
      currentDayKey = dayKey;
      items.push({
        id: `date-${dayKey}`,
        type: "date",
        label: formatDateLabel(message.sentAt),
      });
    }

    items.push({
      id: `message-${message.id}`,
      type: "message",
      message,
    });
  });

  return items;
};

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params ?? {}) as ChatRouteParams;
  const { token } = useAuth();

  const conversationId = params.conversationId ?? "";
  const title = params.title ?? "HV Travel Support";
  const status = params.status ?? "waitingStaff";

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pullOffsetRef = useRef(0);

  const timeline = useMemo(() => buildTimeline(messages), [messages]);
  const showInitialSkeleton = loading && messages.length === 0;

  const loadMessages = useCallback(
    async (showLoader = true, showError = true) => {
      if (!token || !conversationId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        if (showLoader) setLoading(true);
        const data = await ChatService.getMessages(token, conversationId);
        setMessages(data);
        await ChatService.markConversationRead(token, conversationId).catch(() => undefined);
      } catch (error: any) {
        setMessages([]);
        if (showError) {
          MessageBoxService.error(
            "Lỗi",
            error?.message || "Không thể tải nội dung trò chuyện",
            "OK"
          );
        }
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [conversationId, token]
  );

  useFocusEffect(
    useCallback(() => {
      loadMessages(true, false);
    }, [loadMessages])
  );

  const onRefresh = useCallback(async () => {
    if (loading || refreshing) return;
    setRefreshing(true);
    try {
      await loadMessages(false, true);
    } finally {
      setRefreshing(false);
    }
  }, [loadMessages, loading, refreshing]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    pullOffsetRef.current = Math.min(
      pullOffsetRef.current,
      event.nativeEvent.contentOffset.y
    );
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    pullOffsetRef.current = 0;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (
      shouldTriggerOverlayRefresh({
        minOffsetY: pullOffsetRef.current,
        threshold: PULL_REFRESH_THRESHOLD,
        isBusy: refreshing || loading,
      })
    ) {
      onRefresh();
    }
  }, [loading, onRefresh, refreshing]);

  const renderTimelineItem = ({ item }: { item: ChatTimelineItem }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateDividerWrap}>
          <View style={styles.dateDivider} />
          <Text style={styles.dateDividerText}>{item.label}</Text>
          <View style={styles.dateDivider} />
        </View>
      );
    }

    const message = item.message;
    const isMe = message.senderRole === "me";
    const isSystem = message.senderRole === "system";
    const senderName =
      message.senderDisplayName ||
      (isSystem ? "Hệ thống HV Travel" : title);
    const messageText =
      message.messageType === "text" && message.text.trim().length > 0
        ? message.text
        : "Loại tin nhắn này chưa hỗ trợ trên mobile.";

    return (
      <View style={[styles.messageBubbleWrap, isMe && styles.messageBubbleWrapMe]}>
        {!isMe ? (
          <View style={[styles.senderAvatar, isSystem && styles.senderAvatarSystem]}>
            <Ionicons
              name={isSystem ? "notifications-outline" : "headset-outline"}
              size={16}
              color={isSystem ? "#1d4ed8" : theme.colors.primary}
            />
          </View>
        ) : null}

        <View style={styles.messageBody}>
          {!isMe ? <Text style={styles.senderName}>{senderName}</Text> : null}

          <View
            style={[
              styles.messageBubble,
              isMe ? styles.messageBubbleMe : styles.messageBubbleOther,
              isSystem && styles.messageBubbleSystem,
            ]}
          >
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {messageText}
            </Text>
          </View>

          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {formatMessageTime(message.sentAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (!conversationId) {
      return (
        <EmptyState
          icon="chatbox-ellipses-outline"
          title="Không tìm thấy cuộc trò chuyện"
          description="Cuộc trò chuyện này không còn khả dụng trên thiết bị của bạn."
        />
      );
    }

    if (!token) {
      return (
        <EmptyState
          icon="lock-closed-outline"
          title="Bạn chưa đăng nhập"
          description="Đăng nhập để xem lịch sử trò chuyện với tư vấn viên."
        />
      );
    }

    if (showInitialSkeleton) {
      return (
        <View style={styles.skeletonWrap}>
          <ChatTimelineSkeletonList />
        </View>
      );
    }

    return (
      <FlatList
        data={timeline}
        keyExtractor={(item) => item.id}
        renderItem={renderTimelineItem}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="Chưa có tin nhắn"
            description="Nội dung trò chuyện sẽ hiển thị tại đây khi hệ thống có dữ liệu."
          />
        }
        ListFooterComponent={
          <SectionCard style={styles.readOnlyCard}>
            <View style={styles.readOnlyIcon}>
              <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.readOnlyContent}>
              <Text style={styles.readOnlyTitle}>Chế độ xem lịch sử</Text>
              <Text style={styles.readOnlyDescription}>
                Hiện tại mobile chỉ hỗ trợ xem lịch sử chat. Phản hồi mới vẫn được xử lý trên web.
              </Text>
            </View>
          </SectionCard>
        }
        contentContainerStyle={[
          styles.listContent,
          timeline.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <AppHeader
        variant="compact"
        title={title}
        subtitle={getChatConversationSubtitle(status)}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.container}>{renderContent()}</View>

      <LoadingOverlay visible={refreshing} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  skeletonWrap: {
    flex: 1,
    paddingHorizontal: theme.layout.detailPadding,
    paddingVertical: 16,
  },
  listContent: {
    paddingHorizontal: theme.layout.detailPadding,
    paddingVertical: 16,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: "center",
  },
  dateDividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dateDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dateDividerText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.gray,
  },
  messageBubbleWrap: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  messageBubbleWrapMe: {
    justifyContent: "flex-end",
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  senderAvatarSystem: {
    backgroundColor: "#dbeafe",
  },
  messageBody: {
    maxWidth: "78%",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.colors.gray,
    marginBottom: 6,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleOther: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageBubbleSystem: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  messageBubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  messageTextMe: {
    color: theme.colors.white,
  },
  messageTime: {
    fontSize: 11,
    color: theme.colors.gray,
    marginTop: 6,
    marginHorizontal: 4,
  },
  messageTimeMe: {
    textAlign: "right",
  },
  readOnlyCard: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  readOnlyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  readOnlyContent: {
    flex: 1,
  },
  readOnlyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: theme.colors.text,
  },
  readOnlyDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.gray,
  },
});
