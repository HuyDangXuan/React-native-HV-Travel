import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";

import AppHeader from "../../../../components/ui/AppHeader";
import EmptyState from "../../../../components/ui/EmptyState";
import SectionCard from "../../../../components/ui/SectionCard";
import { ChatTimelineSkeletonList } from "../../../../components/skeleton/MainTabSkeletons";
import LoadingOverlay from "../../../Loading/LoadingOverlay";
import { useAuth } from "../../../../context/AuthContext";
import { useI18n } from "../../../../context/I18nContext";
import { useAppTheme } from "../../../../context/ThemeModeContext";
import { ChatService } from "../../../../services/ChatService";
import {
  ChatConversationSummary,
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
  supportEntry?: boolean;
};

type ChatTimelineItem =
  | { id: string; type: "date"; label: string }
  | { id: string; type: "message"; message: ChatMessageItem };

const PULL_REFRESH_THRESHOLD = 72;
const POLLING_INTERVAL_MS = 8000;
const ACTIVE_CHAT_STATUSES = new Set(["waitingStaff", "open", "pending"]);

const isActiveChatStatus = (status?: string) =>
  ACTIVE_CHAT_STATUSES.has(String(status ?? "waitingStaff"));

const getMessageTimestamp = (message: ChatMessageItem) => {
  const timestamp = new Date(message.sentAt ?? "").getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const mergeChatMessages = (
  currentMessages: ChatMessageItem[],
  incomingMessages: ChatMessageItem[]
) => {
  const merged = [...currentMessages];

  incomingMessages.forEach((incoming) => {
    const existingIndex = merged.findIndex((item) => {
      const matchesClientId =
        incoming.clientMessageId &&
        item.clientMessageId &&
        incoming.clientMessageId === item.clientMessageId;
      return matchesClientId || item.id === incoming.id;
    });

    if (existingIndex >= 0) {
      merged[existingIndex] = incoming;
      return;
    }

    merged.push(incoming);
  });

  return merged.sort((left, right) => getMessageTimestamp(left) - getMessageTimestamp(right));
};

const formatMessageTime = (value?: string, localeCode = "vi-VN") => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(localeCode, {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateLabel = (value?: string, localeCode = "vi-VN") => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString(localeCode, {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const buildTimeline = (messages: ChatMessageItem[], localeCode = "vi-VN"): ChatTimelineItem[] => {
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
        label: formatDateLabel(message.sentAt, localeCode),
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
  const { t, locale } = useI18n();
  const theme = useAppTheme();

  const conversationId = params.conversationId ?? "";
  const initialTitle = params.title ?? t("inbox.supportThreadTitle");
  const initialStatus = params.status ?? "waitingStaff";
  const supportEntry = params.supportEntry ?? false;

  const [conversation, setConversation] = useState<ChatConversationSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [composerValue, setComposerValue] = useState("");
  const [composerMode, setComposerMode] = useState<"ready" | "unavailable">("ready");
  const pullOffsetRef = useRef(0);

  const localeCode = locale === "en" ? "en-US" : "vi-VN";
  const activeConversationId = conversation?.id ?? conversationId;
  const activeTitle = conversation?.title ?? initialTitle;
  const activeStatus = conversation?.status ?? initialStatus;
  const subtitle = getChatConversationSubtitle(activeStatus);
  const canSendMessage = Boolean(activeConversationId) && isActiveChatStatus(activeStatus);
  const timeline = useMemo(() => buildTimeline(messages, localeCode), [messages, localeCode]);
  const showInitialSkeleton = loading && !conversation && messages.length === 0;
  const isBusy = loading || refreshing || sending || reopening;
  const topicChips = [
    t("inbox.supportTopicBooking"),
    t("inbox.supportTopicPayment"),
    t("inbox.supportTopicRefund"),
  ];

  const loadThread = useCallback(
    async ({ refresh = false }: { refresh?: boolean } = {}) => {
      if (!token) {
        setConversation(null);
        setMessages([]);
        setComposerMode("unavailable");
        setLoading(false);
        return;
      }

      try {
        if (!refresh) {
          setLoading(true);
        }

        if (conversationId) {
          const foundConversation = await ChatService.getConversation(token, conversationId);
          const data = await ChatService.getMessages(token, conversationId);
          const nextConversation =
            foundConversation ?? {
              id: conversationId,
              customerId: "",
              code: "",
              preview: "",
              lastMessageAt: undefined,
              unreadCount: 0,
              status: activeStatus,
              channel: "web",
              title: activeTitle,
              subtitle,
            };
          setConversation(nextConversation);
          setMessages((prev) => (refresh ? mergeChatMessages(prev, data) : data));
          setComposerMode(isActiveChatStatus(nextConversation.status) ? "ready" : "unavailable");
          await ChatService.markConversationRead(token, conversationId).catch(() => undefined);
          return;
        }

        if (supportEntry) {
          const bootstrap = await ChatService.bootstrapSupportConversation(token);
          setConversation(bootstrap.conversation);
          setMessages((prev) =>
            refresh ? mergeChatMessages(prev, bootstrap.messages) : bootstrap.messages
          );
          setComposerMode(
            bootstrap.canCreate &&
              (!bootstrap.conversation || isActiveChatStatus(bootstrap.conversation.status))
              ? "ready"
              : "unavailable"
          );

          if (bootstrap.conversation) {
            await ChatService.markConversationRead(token, bootstrap.conversation.id).catch(
              () => undefined
            );
          }
          return;
        }

        setConversation(null);
        setMessages([]);
        setComposerMode("unavailable");
      } catch (error: any) {
        if (!refresh) {
          setConversation(null);
          setMessages([]);
          setComposerMode("unavailable");
        }

        if (!refresh) {
          MessageBoxService.error(
            t("common.error"),
            error?.message || t("inbox.chatLoadFailed"),
            t("common.ok")
          );
        }
      } finally {
        if (!refresh) {
          setLoading(false);
        }
      }
    },
    [activeStatus, activeTitle, conversationId, supportEntry, subtitle, t, token]
  );

  useFocusEffect(
    useCallback(() => {
      loadThread({ refresh: false });

      if (!token || (!conversationId && !supportEntry && !activeConversationId)) {
        return undefined;
      }

      const intervalId = setInterval(() => {
        loadThread({ refresh: true });
      }, POLLING_INTERVAL_MS);

      return () => {
        clearInterval(intervalId);
      };
    }, [activeConversationId, conversationId, loadThread, supportEntry, token])
  );

  const onRefresh = useCallback(async () => {
    if (refreshing || loading) return;
    setRefreshing(true);
    try {
      await loadThread({ refresh: true });
    } finally {
      setRefreshing(false);
    }
  }, [loadThread, loading, refreshing]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    pullOffsetRef.current = Math.min(pullOffsetRef.current, event.nativeEvent.contentOffset.y);
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    pullOffsetRef.current = 0;
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (
      shouldTriggerOverlayRefresh({
        minOffsetY: pullOffsetRef.current,
        threshold: PULL_REFRESH_THRESHOLD,
        isBusy,
      })
    ) {
      onRefresh();
    }
  }, [isBusy, onRefresh]);

  const renderSupportIntro = () => (
    <SectionCard style={[styles.supportIntroCard, { backgroundColor: theme.semantic.screenSurface }]}>
      <View style={[styles.supportIntroIcon, { backgroundColor: theme.colors.primaryLight }]}>
        <Ionicons name="headset-outline" size={20} color={theme.colors.primary} />
      </View>

      <View style={styles.supportIntroContent}>
        <View style={styles.supportIntroHeaderRow}>
          <Text style={[styles.supportIntroTitle, { color: theme.semantic.textPrimary }]}>
            {activeTitle}
          </Text>

          <View
            style={[
              styles.supportIntroStatusPill,
              {
                backgroundColor:
                  theme.name === "dark" ? "rgba(34, 211, 238, 0.12)" : "#ecfeff",
              },
            ]}
          >
            <Text style={[styles.supportIntroStatusText, { color: theme.colors.primary }]}>
              {subtitle}
            </Text>
          </View>
        </View>

        <Text style={[styles.supportIntroDescription, { color: theme.semantic.textSecondary }]}>
          {t("inbox.supportThreadDescription")}
        </Text>

        <View style={styles.topicRow}>
          {topicChips.map((label) => (
            <View
              key={label}
              style={[
                styles.topicChip,
                {
                  backgroundColor:
                    theme.name === "dark"
                      ? "rgba(34, 211, 238, 0.08)"
                      : "rgba(18, 181, 164, 0.08)",
                  borderColor: theme.semantic.divider,
                },
              ]}
            >
              <Text style={[styles.topicChipText, { color: theme.semantic.textPrimary }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.supportIntroMetaRow}>
          <Ionicons name="time-outline" size={14} color={theme.semantic.textSecondary} />
          <Text style={[styles.supportIntroMetaText, { color: theme.semantic.textSecondary }]}>
            {conversation
              ? t("inbox.supportConversationReady")
              : composerMode === "unavailable"
                ? t("inbox.supportComposerConnecting")
                : t("inbox.supportEntryPending")}
          </Text>
        </View>
      </View>
    </SectionCard>
  );

  const handleReopenConversation = useCallback(async () => {
    if (!token || !activeConversationId) return;

    try {
      setReopening(true);
      const reopenedConversation = await ChatService.reopenConversation(token, activeConversationId);
      if (reopenedConversation) {
        setConversation(reopenedConversation);
        setComposerMode("ready");
      }
      await loadThread({ refresh: true });
    } catch (error: any) {
      MessageBoxService.error(
        t("common.error"),
        error?.message || t("inbox.supportReopenFailed"),
        t("common.ok")
      );
    } finally {
      setReopening(false);
    }
  }, [activeConversationId, loadThread, t, token]);

  const handleSendMessage = useCallback(async () => {
    if (!token) {
      navigation.navigate("LoginScreen");
      return;
    }

    const content = composerValue.trim();
    if (!content || !activeConversationId || !canSendMessage) {
      MessageBoxService.error(
        t("common.error"),
        t("inbox.supportComposerConnecting"),
        t("common.ok")
      );
      return;
    }

    const clientMessageId = uuidv4();
    const optimisticMessage: ChatMessageItem = {
      id: `local-${clientMessageId}`,
      conversationId: activeConversationId,
      senderRole: "me",
      senderDisplayName: "",
      messageType: "text",
      text: content,
      sentAt: new Date().toISOString(),
      isRead: true,
      clientMessageId,
    };

    setComposerValue("");
    setSending(true);
    setMessages((prev) => mergeChatMessages(prev, [optimisticMessage]));

    try {
      const sentMessage = await ChatService.sendMessage(
        token,
        activeConversationId,
        content,
        clientMessageId
      );

      if (sentMessage) {
        setMessages((prev) => mergeChatMessages(prev, [sentMessage]));
      } else {
        await loadThread({ refresh: true });
      }
    } catch (error: any) {
      setMessages((prev) =>
        prev.filter(
          (message) =>
            !(
              message.clientMessageId === clientMessageId &&
              message.id === optimisticMessage.id
            )
        )
      );
      MessageBoxService.error(
        t("common.error"),
        error?.message || t("inbox.chatSendFailed"),
        t("common.ok")
      );
    } finally {
      setSending(false);
    }
  }, [activeConversationId, canSendMessage, composerValue, loadThread, navigation, t, token]);

  const renderComposer = () => {
    if (activeConversationId && !canSendMessage) {
      return (
        <SectionCard
          style={[styles.composerCard, { backgroundColor: theme.semantic.screenSurface }]}
        >
          <View style={styles.composerHeaderRow}>
            <View style={[styles.composerIcon, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.colors.primary} />
            </View>

            <View style={styles.composerHeaderContent}>
              <Text style={[styles.composerTitle, { color: theme.semantic.textPrimary }]}>
                {t("inbox.supportConversationClosedTitle")}
              </Text>
              <Text style={[styles.composerDescription, { color: theme.semantic.textSecondary }]}>
                {t("inbox.supportConversationClosedDescription")}
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.reopenButton,
              {
                backgroundColor: reopening ? theme.semantic.divider : theme.colors.primary,
              },
            ]}
            disabled={reopening}
            onPress={handleReopenConversation}
          >
            {reopening ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Ionicons name="refresh" size={16} color={theme.colors.white} />
            )}
            <Text style={[styles.reopenButtonText, { color: theme.colors.white }]}>
              {reopening ? t("inbox.supportReopening") : t("inbox.supportReopen")}
            </Text>
          </Pressable>
        </SectionCard>
      );
    }

    const isDisabled = !activeConversationId || composerMode === "unavailable" || sending;

    return (
      <SectionCard style={[styles.composerCard, { backgroundColor: theme.semantic.screenSurface }]}>
        <View style={styles.composerHeaderRow}>
          <View style={[styles.composerIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="chatbubbles-outline" size={18} color={theme.colors.primary} />
          </View>

          <View style={styles.composerHeaderContent}>
            <Text style={[styles.composerTitle, { color: theme.semantic.textPrimary }]}>
              {t("inbox.supportComposerTitle")}
            </Text>
            <Text style={[styles.composerDescription, { color: theme.semantic.textSecondary }]}>
              {conversation
                ? t("inbox.supportComposerHintActive")
                : t("inbox.supportComposerHintStart")}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.composerField,
            {
              backgroundColor: theme.semantic.screenBackground,
              borderColor: theme.semantic.divider,
              opacity: isDisabled ? 0.8 : 1,
            },
          ]}
        >
          <TextInput
            value={composerValue}
            onChangeText={setComposerValue}
            placeholder={t("inbox.supportComposerPlaceholder")}
            placeholderTextColor={theme.semantic.textSecondary}
            editable={!isDisabled}
            multiline
            style={[styles.composerInput, { color: theme.semantic.textPrimary }]}
          />

          <Pressable
            style={[
              styles.composerSendButton,
              {
                backgroundColor: isDisabled ? theme.semantic.divider : theme.colors.primary,
                opacity: composerValue.trim().length === 0 ? 0.75 : 1,
              },
            ]}
            disabled={isDisabled || composerValue.trim().length === 0}
            onPress={handleSendMessage}
          >
            {sending ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Ionicons
                name="send"
                size={15}
                color={isDisabled ? theme.semantic.textSecondary : theme.colors.white}
              />
            )}
          </Pressable>
        </View>

        <View style={styles.composerFooterRow}>
          <View
            style={[
              styles.composerFooterPill,
              {
                backgroundColor: theme.name === "dark" ? "rgba(148, 163, 184, 0.12)" : "#f1f5f9",
              },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={12} color={theme.semantic.textSecondary} />
            <Text style={[styles.composerFooterText, { color: theme.semantic.textSecondary }]}>
              {conversation
                ? t("inbox.supportComposerReady")
                : composerMode === "unavailable"
                  ? t("inbox.supportComposerConnecting")
                  : t("inbox.supportComposerPending")}
            </Text>
          </View>

          <Text style={[styles.composerNote, { color: theme.semantic.textSecondary }]}>
            {conversation
              ? t("inbox.supportComposerHintActive")
              : t("inbox.supportComposerHintStart")}
          </Text>
        </View>
      </SectionCard>
    );
  };

  const renderTimelineItem = ({ item }: { item: ChatTimelineItem }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateDividerWrap}>
          <View style={[styles.dateDivider, { backgroundColor: theme.semantic.divider }]} />
          <Text style={[styles.dateDividerText, { color: theme.semantic.textSecondary }]}>
            {item.label}
          </Text>
          <View style={[styles.dateDivider, { backgroundColor: theme.semantic.divider }]} />
        </View>
      );
    }

    const message = item.message;
    const isMe = message.senderRole === "me";
    const isSystem = message.senderRole === "system";
    const senderName =
      message.senderDisplayName || (isSystem ? t("inbox.supportSystemName") : activeTitle);
    const messageText =
      message.messageType === "text" && message.text.trim().length > 0
        ? message.text
        : t("inbox.unsupportedMessage");

    return (
      <View style={[styles.messageBubbleWrap, isMe && styles.messageBubbleWrapMe]}>
        {!isMe ? (
          <View
            style={[
              styles.senderAvatar,
              {
                backgroundColor: isSystem
                  ? theme.name === "dark"
                    ? "rgba(96, 165, 250, 0.16)"
                    : "#dbeafe"
                  : theme.colors.primaryLight,
              },
            ]}
          >
            <Ionicons
              name={isSystem ? "notifications-outline" : "headset-outline"}
              size={16}
              color={isSystem ? "#60a5fa" : theme.colors.primary}
            />
          </View>
        ) : null}

        <View style={styles.messageBody}>
          {!isMe ? (
            <View style={styles.messageMetaRow}>
              <View style={styles.senderNameWrap}>
                <Text style={[styles.senderName, { color: theme.semantic.textPrimary }]}>
                  {senderName}
                </Text>
                {isSystem ? (
                  <Text style={[styles.senderRole, { color: theme.semantic.textSecondary }]}>
                    {t("inbox.systemUpdate")}
                  </Text>
                ) : null}
              </View>

              <Text style={[styles.messageTime, { color: theme.semantic.textSecondary }]}>
                {formatMessageTime(message.sentAt, localeCode)}
              </Text>
            </View>
          ) : null}

          <View
            style={[
              styles.messageBubble,
              isMe
                ? [styles.messageBubbleMe, { backgroundColor: theme.colors.primary }]
                : [
                    styles.messageBubbleOther,
                    {
                      backgroundColor: theme.semantic.screenSurface,
                      borderColor: theme.semantic.divider,
                    },
                  ],
              isSystem && {
                backgroundColor: theme.name === "dark" ? "rgba(96, 165, 250, 0.12)" : "#eff6ff",
                borderColor: theme.name === "dark" ? "rgba(96, 165, 250, 0.24)" : "#bfdbfe",
              },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                { color: isMe ? theme.colors.white : theme.semantic.textPrimary },
              ]}
            >
              {messageText}
            </Text>
          </View>

          {isMe ? (
            <Text
              style={[
                styles.messageTime,
                { color: theme.semantic.textSecondary },
                styles.messageTimeMe,
              ]}
            >
              {formatMessageTime(message.sentAt, localeCode)}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderEmptyMessages = () => (
    <SectionCard style={[styles.demoNoticeCard, { backgroundColor: theme.semantic.screenSurface }]}>
      <View style={[styles.demoNoticeIcon, { backgroundColor: theme.colors.primaryLight }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.demoNoticeContent}>
        <Text style={[styles.demoNoticeTitle, { color: theme.semantic.textPrimary }]}>
          {conversation
            ? t("inbox.emptyMessagesTitle")
            : t("inbox.supportConversationStartingTitle")}
        </Text>
        <Text style={[styles.demoNoticeDescription, { color: theme.semantic.textSecondary }]}>
          {conversation
            ? t("inbox.supportThreadEmptyDescription")
            : composerMode === "unavailable"
              ? t("inbox.supportConversationUnavailable")
              : t("inbox.supportConversationStartingDescription")}
        </Text>
      </View>
    </SectionCard>
  );

  const renderContent = () => {
    if (!token) {
      return (
        <View style={styles.emptyWrap}>
          {renderSupportIntro()}

          <EmptyState
            icon="lock-closed-outline"
            title={t("inbox.guestTitle")}
            description={t("inbox.guestMessagesDescription")}
          />
        </View>
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
        ListHeaderComponent={<View style={styles.threadHeaderWrap}>{renderSupportIntro()}</View>}
        ListEmptyComponent={renderEmptyMessages}
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
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.semantic.screenBackground }]}
      edges={["top", "bottom"]}
    >
      <AppHeader
        variant="compact"
        title={activeTitle}
        subtitle={subtitle}
        subtitleStyle={styles.headerSubtitle}
        onBack={() => navigation.goBack()}
        style={{ backgroundColor: theme.semantic.screenBackground }}
      />

      <View style={styles.container}>
        {renderContent()}
        {token && !showInitialSkeleton ? renderComposer() : null}
      </View>

      <LoadingOverlay visible={refreshing} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  skeletonWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  listContentEmpty: {
    justifyContent: "space-between",
  },
  threadHeaderWrap: {
    marginBottom: 8,
  },
  supportIntroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  supportIntroIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  supportIntroContent: {
    flex: 1,
    minWidth: 0,
  },
  supportIntroHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  supportIntroTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  supportIntroStatusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    maxWidth: "55%",
  },
  supportIntroStatusText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "right",
  },
  supportIntroDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 10,
  },
  topicRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  topicChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  supportIntroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  supportIntroMetaText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  demoNoticeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  demoNoticeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  demoNoticeContent: {
    flex: 1,
  },
  demoNoticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  demoNoticeDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  dateDividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 10,
  },
  dateDivider: {
    flex: 1,
    height: 1,
  },
  dateDividerText: {
    fontSize: 12,
    fontWeight: "700",
  },
  messageBubbleWrap: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "flex-end",
    gap: 8,
  },
  messageBubbleWrapMe: {
    justifyContent: "flex-end",
  },
  senderAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBody: {
    maxWidth: "80%",
    minWidth: 0,
  },
  messageMetaRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  senderNameWrap: {
    flex: 1,
    minWidth: 0,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 4,
  },
  senderRole: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    marginLeft: 4,
  },
  messageBubble: {
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
  },
  messageBubbleOther: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6,
    marginHorizontal: 4,
    fontWeight: "600",
  },
  messageTimeMe: {
    textAlign: "right",
  },
  composerCard: {
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  composerHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  composerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  composerHeaderContent: {
    flex: 1,
    minWidth: 0,
  },
  composerTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  composerDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
  },
  composerField: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 10,
    gap: 10,
  },
  composerInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    minHeight: 24,
    maxHeight: 110,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  composerSendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  reopenButton: {
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reopenButtonText: {
    fontSize: 13,
    fontWeight: "800",
  },
  composerFooterRow: {
    gap: 8,
  },
  composerFooterPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  composerFooterText: {
    fontSize: 11,
    fontWeight: "700",
  },
  composerNote: {
    fontSize: 12,
    lineHeight: 18,
  },
  headerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
});
