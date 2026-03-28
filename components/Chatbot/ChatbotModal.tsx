import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Dimensions,
  Keyboard,
  Platform,
  Animated,
  PanResponder,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAppTheme } from "../../context/ThemeModeContext";
import { useI18n } from "../../context/I18nContext";
import { chatWithTour } from "../../services/ChatbotService";
import {
  buildChatbotBusyMessage,
  buildChatbotWelcomeMessage,
  createConversationId,
} from "../../utils/chatbot";

const { height } = Dimensions.get("window");

type Message = {
  id: string;
  role: "user" | "bot";
  text?: string;
  typing?: boolean;
};

type ChatbotModalProps = {
  visible: boolean;
  onClose: () => void;
  tour?: {
    id?: string;
    _id?: string;
    name?: string;
  } | null;
};

type ChatUi = {
  overlay: string;
  surface: string;
  mutedSurface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  inputSurface: string;
  handle: string;
};

export default function ChatbotModal({ visible, onClose, tour }: ChatbotModalProps) {
  const { t } = useI18n();
  const appTheme = useAppTheme();
  const ui = useMemo<ChatUi>(
    () => ({
      overlay: appTheme.colors.overlay,
      surface: appTheme.semantic.screenSurface,
      mutedSurface: appTheme.semantic.screenMutedSurface,
      border: appTheme.semantic.divider,
      textPrimary: appTheme.semantic.textPrimary,
      textSecondary: appTheme.semantic.textSecondary,
      primary: appTheme.colors.primary,
      onPrimary: appTheme.colors.white,
      inputSurface: appTheme.semantic.screenBackground,
      handle: appTheme.colors.placeholder,
    }),
    [appTheme]
  );
  const styles = useMemo(() => createStyles(ui), [ui]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState("");

  const listRef = useRef<FlatList<Message>>(null);

  const initialHeight = height * 0.85;
  const modalHeight = useRef(new Animated.Value(initialHeight)).current;
  const currentHeight = useRef(initialHeight);
  const dragStartHeight = useRef(initialHeight);
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartHeight.current = currentHeight.current;
      },
      onPanResponderMove: (_, gesture) => {
        const min = height * 0.55;
        const max = height * 0.9;
        const nextHeight = dragStartHeight.current - gesture.dy;

        if (nextHeight >= min && nextHeight <= max) {
          modalHeight.setValue(nextHeight);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const min = height * 0.55;
        const max = height * 0.9;
        const nextHeight = Math.max(min, Math.min(max, dragStartHeight.current - gesture.dy));

        currentHeight.current = nextHeight;
        Animated.spring(modalHeight, {
          toValue: nextHeight,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        Animated.timing(keyboardOffset, {
          toValue: event.endCoordinates.height,
          duration: 250,
          useNativeDriver: false,
        }).start(() => {
          listRef.current?.scrollToEnd({ animated: true });
        });
      }
    );

    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.timing(keyboardOffset, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, [keyboardOffset]);

  useEffect(() => {
    if (!visible) return;

    const nextConversationId = createConversationId();
    setConversationId(nextConversationId);
    setInput("");
    setSending(false);
    setMessages([
      {
        id: "init",
        role: "bot",
        text: buildChatbotWelcomeMessage(t, tour?.name),
      },
    ]);

    currentHeight.current = initialHeight;
    modalHeight.setValue(initialHeight);
  }, [initialHeight, modalHeight, t, tour?.name, visible]);

  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timeout);
  }, [messages, visible]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const targetTourId = tour?.id || tour?._id;
    const userText = input.trim();
    setInput("");
    setSending(true);
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", text: userText },
      { id: "typing", role: "bot", typing: true },
    ]);

    try {
      if (!targetTourId) {
        throw new Error("Missing tour id");
      }

      const reply = await chatWithTour(targetTourId, userText, conversationId);
      setMessages((prev) =>
        prev.map((message) =>
          message.id === "typing"
            ? { id: `${Date.now()}-bot`, role: "bot", text: reply }
            : message
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === "typing"
            ? {
                id: `${Date.now()}-bot-error`,
                role: "bot",
                text: buildChatbotBusyMessage(t),
              }
            : message
        )
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { height: modalHeight }]}>
          <View style={styles.handleWrapper} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <View style={styles.botAvatar}>
                <Ionicons name="chatbubble-ellipses" size={18} color={ui.onPrimary} />
              </View>
              <View style={styles.headerTextWrap}>
                <Text style={styles.title}>{t("chatbot.title")}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {t("chatbot.subtitleOnline")}
                </Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityLabel={t("chatbot.closeLabel")}>
              <Ionicons name="close" size={20} color={ui.textPrimary} />
            </Pressable>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.role === "user" ? styles.userBubble : styles.botBubble,
                ]}
              >
                {item.typing ? (
                  <TypingIndicator styles={styles} ui={ui} />
                ) : (
                  <MarkdownText text={item.text || ""} isUser={item.role === "user"} styles={styles} />
                )}
              </View>
            )}
          />

          <Animated.View style={{ paddingBottom: keyboardOffset }}>
            <View style={styles.inputRow}>
              <TextInput
                placeholder={t("chatbot.placeholder")}
                placeholderTextColor={ui.textSecondary}
                value={input}
                onChangeText={setInput}
                style={styles.input}
                selectionColor={ui.primary}
                onSubmitEditing={sendMessage}
              />
              <Pressable
                onPress={sendMessage}
                disabled={!input.trim() || sending}
                style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              >
                <Ionicons name="send" size={18} color={ui.onPrimary} />
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function MarkdownText({
  text,
  isUser,
  styles,
}: {
  text: string;
  isUser: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Text style={[styles.text, isUser && styles.userText]}>
      {text.split("**").map((part, index) => (
        <Text key={`${part}-${index}`} style={index % 2 ? styles.boldText : undefined}>
          {part}
        </Text>
      ))}
    </Text>
  );
}

function TypingIndicator({
  styles,
  ui,
}: {
  styles: ReturnType<typeof createStyles>;
  ui: ChatUi;
}) {
  const dotA = useRef(new Animated.Value(0)).current;
  const dotB = useRef(new Animated.Value(0)).current;
  const dotC = useRef(new Animated.Value(0)).current;
  const dots = [dotA, dotB, dotC];

  useEffect(() => {
    const animations = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: -4,
            duration: 260,
            delay: index * 120,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dotA, dotB, dotC, dots]);

  return (
    <View style={styles.typingWrap}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              backgroundColor: ui.textSecondary,
              transform: [{ translateY: dot }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function createStyles(ui: ChatUi) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: ui.overlay,
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: ui.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: "hidden",
    },
    handleWrapper: {
      alignItems: "center",
      paddingVertical: 12,
    },
    handle: {
      width: 44,
      height: 5,
      borderRadius: 999,
      backgroundColor: ui.handle,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: ui.border,
    },
    headerInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    headerTextWrap: {
      flex: 1,
    },
    botAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: 17,
      fontWeight: "800",
      color: ui.textPrimary,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 13,
      color: ui.textSecondary,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: ui.mutedSurface,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: ui.border,
    },
    chatList: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      gap: 10,
    },
    bubble: {
      maxWidth: "82%",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 18,
    },
    userBubble: {
      alignSelf: "flex-end",
      backgroundColor: ui.primary,
      borderTopRightRadius: 6,
    },
    botBubble: {
      alignSelf: "flex-start",
      backgroundColor: ui.mutedSurface,
      borderTopLeftRadius: 6,
      borderWidth: 1,
      borderColor: ui.border,
    },
    text: {
      fontSize: 15,
      lineHeight: 22,
      color: ui.textPrimary,
    },
    userText: {
      color: ui.onPrimary,
    },
    boldText: {
      fontWeight: "800",
    },
    typingWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 18,
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 12,
      borderTopWidth: 1,
      borderTopColor: ui.border,
      backgroundColor: ui.surface,
    },
    input: {
      flex: 1,
      height: 46,
      borderRadius: 23,
      paddingHorizontal: 18,
      backgroundColor: ui.inputSurface,
      color: ui.textPrimary,
      borderWidth: 1,
      borderColor: ui.border,
    },
    sendBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: ui.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    sendBtnDisabled: {
      opacity: 0.45,
    },
  });
}
