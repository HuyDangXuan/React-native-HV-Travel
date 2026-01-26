import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Animated, PanResponder } from "react-native";
import theme from "../../config/theme";
import { chatWithTour } from "../../services/ChatbotService";
import { string } from "joi";
const { height } = Dimensions.get("window");

type Message = {
  id: string;
  role: "user" | "bot";
  text?: string;
  typing?: boolean;
};

export default function ChatbotModal({ visible, onClose, tour }: any) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<FlatList>(null);
  const [conversationIdRef, setCreateConversationId] = useState("");

  /* ================= DRAG MODAL ================= */
  const INITIAL_HEIGHT = height * 0.85;

  const modalHeight = useRef(new Animated.Value(INITIAL_HEIGHT)).current;
  const currentHeight = useRef(INITIAL_HEIGHT);
  const dragStartHeight = useRef(INITIAL_HEIGHT);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        dragStartHeight.current = currentHeight.current;
      },

      onPanResponderMove: (_, g) => {
        const newHeight = dragStartHeight.current - g.dy;
        const min = height * 0.55;
        const max = height * 0.9;

        if (newHeight >= min && newHeight <= max) {
          modalHeight.setValue(newHeight);
        }
      },

      onPanResponderRelease: (_, g) => {
        const min = height * 0.55;
        const max = height * 0.9;

        let finalHeight = dragStartHeight.current - g.dy;
        finalHeight = Math.max(min, Math.min(max, finalHeight));

        currentHeight.current = finalHeight;

        Animated.spring(modalHeight, {
          toValue: finalHeight,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  /* ================= KEYBOARD (CHỈ INPUT) ================= */
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: any) => {
        Animated.timing(keyboardOffset, {
          toValue: e.endCoordinates.height,
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
  }, []);

  const createConversationId = () => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /* ================= INIT ================= */
  useEffect(() => {
    if (visible) {
      setCreateConversationId(createConversationId());
      setMessages([
        {
          id: "init",
          role: "bot",
          text: `Chào bạn 👋  
Mình là trợ lý cho tour **${tour?.name || ""}**.  
Bạn muốn hỏi gì về tour này?`,
        },
      ]);

      const h = height * 0.85;
      currentHeight.current = h;
      modalHeight.setValue(h);
    }
  }, [visible]);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, [messages]);

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const userText = input;
    setInput("");
    setSending(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", text: userText },
      { id: "typing", role: "bot", typing: true },
    ]);

    try {
      const reply = await chatWithTour(tour._id, userText, conversationIdRef);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "typing"
            ? { id: Date.now().toString(), role: "bot", text: reply }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "typing"
            ? {
                id: Date.now().toString(),
                role: "bot",
                text: "Xin lỗi, hệ thống đang bận 😢",
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  /* ================= UI HELPERS ================= */
  function MarkdownText({ text, isUser }: any) {
    return (
      <Text style={[styles.text, isUser && { color: "#fff" }]}>
        {text.split("**").map((p: string, i: number) => (
          <Text key={i} style={i % 2 ? { fontWeight: "700" } : undefined}>
            {p}
          </Text>
        ))}
      </Text>
    );
  }

  function TypingIndicator() {
    const dots = [0, 1, 2].map(() => useRef(new Animated.Value(0)).current);

    useEffect(() => {
      dots.forEach((dot, i) => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: -4,
              duration: 300,
              delay: i * 120,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, []);

    return (
      <View style={{ flexDirection: "row", gap: 6 }}>
        {dots.map((d, i) => (
          <Animated.View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#9CA3AF",
              transform: [{ translateY: d }],
            }}
          />
        ))}
      </View>
    );
  }

  /* ================= RENDER ================= */
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { height: modalHeight }]}>
          <View style={styles.handleWrapper} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={styles.botAvatar}>
                <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.title}>Trợ lý tour HV Travel</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  Đang hoạt động
                </Text>
              </View>
            </View>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} />
            </Pressable>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.chatList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.role === "user"
                    ? styles.userBubble
                    : styles.botBubble,
                ]}
              >
                {item.typing ? (
                  <TypingIndicator />
                ) : (
                  <MarkdownText
                    text={item.text || ""}
                    isUser={item.role === "user"}
                  />
                )}
              </View>
            )}
          />

          {/* INPUT CHỈ LÙI THEO KEYBOARD */}
          <Animated.View style={{ paddingBottom: keyboardOffset }}>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Hỏi về tour này..."
                value={input}
                onChangeText={setInput}
                style={styles.input}
                onSubmitEditing={sendMessage}
              />
              <Pressable
                onPress={sendMessage}
                disabled={!input.trim() || sending}
                style={[
                  styles.sendBtn,
                  (!input.trim() || sending) && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  handleWrapper: {
    alignItems: "center",
    paddingVertical: 12,
  },

  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 17, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#6B7280" },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  chatList: {
    padding: 16,
    gap: 10,
  },

  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },

  userBubble: {
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-end",
    borderTopRightRadius: 6,
  },

  botBubble: {
    backgroundColor: "#F3F4F6",
    alignSelf: "flex-start",
    borderTopLeftRadius: 6,
  },

  text: {
    fontSize: 15,
    lineHeight: 21,
    color: "#111827",
  },

  inputRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },

  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 24,
    paddingHorizontal: 18,
    height: 46,
  },

  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
