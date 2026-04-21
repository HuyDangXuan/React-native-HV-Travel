"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatbotModal;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_native_1 = require("react-native");
const vector_icons_1 = require("@expo/vector-icons");
const ThemeModeContext_1 = require("../../context/ThemeModeContext");
const I18nContext_1 = require("../../context/I18nContext");
const ChatbotService_1 = require("../../services/ChatbotService");
const chatbot_1 = require("../../utils/chatbot");
const { height } = react_native_1.Dimensions.get("window");
function ChatbotModal({ visible, onClose, tour }) {
    const { t } = (0, I18nContext_1.useI18n)();
    const appTheme = (0, ThemeModeContext_1.useAppTheme)();
    const ui = (0, react_1.useMemo)(() => ({
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
    }), [appTheme]);
    const styles = (0, react_1.useMemo)(() => createStyles(ui), [ui]);
    const [messages, setMessages] = (0, react_1.useState)([]);
    const [input, setInput] = (0, react_1.useState)("");
    const [sending, setSending] = (0, react_1.useState)(false);
    const [conversationId, setConversationId] = (0, react_1.useState)("");
    const listRef = (0, react_1.useRef)(null);
    const initialHeight = height * 0.85;
    const modalHeight = (0, react_1.useRef)(new react_native_1.Animated.Value(initialHeight)).current;
    const currentHeight = (0, react_1.useRef)(initialHeight);
    const dragStartHeight = (0, react_1.useRef)(initialHeight);
    const keyboardOffset = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const panResponder = (0, react_1.useRef)(react_native_1.PanResponder.create({
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
            react_native_1.Animated.spring(modalHeight, {
                toValue: nextHeight,
                useNativeDriver: false,
            }).start();
        },
    })).current;
    (0, react_1.useEffect)(() => {
        const show = react_native_1.Keyboard.addListener(react_native_1.Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (event) => {
            react_native_1.Animated.timing(keyboardOffset, {
                toValue: event.endCoordinates.height,
                duration: 250,
                useNativeDriver: false,
            }).start(() => {
                listRef.current?.scrollToEnd({ animated: true });
            });
        });
        const hide = react_native_1.Keyboard.addListener(react_native_1.Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => {
            react_native_1.Animated.timing(keyboardOffset, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        });
        return () => {
            show.remove();
            hide.remove();
        };
    }, [keyboardOffset]);
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        const nextConversationId = (0, chatbot_1.createConversationId)();
        setConversationId(nextConversationId);
        setInput("");
        setSending(false);
        setMessages([
            {
                id: "init",
                role: "bot",
                text: (0, chatbot_1.buildChatbotWelcomeMessage)(t, tour?.name),
            },
        ]);
        currentHeight.current = initialHeight;
        modalHeight.setValue(initialHeight);
    }, [initialHeight, modalHeight, t, tour?.name, visible]);
    (0, react_1.useEffect)(() => {
        if (!visible)
            return;
        const timeout = setTimeout(() => {
            listRef.current?.scrollToEnd({ animated: true });
        }, 80);
        return () => clearTimeout(timeout);
    }, [messages, visible]);
    const sendMessage = async () => {
        if (!input.trim() || sending)
            return;
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
            const reply = await (0, ChatbotService_1.chatWithTour)(targetTourId, userText, conversationId);
            setMessages((prev) => prev.map((message) => message.id === "typing"
                ? { id: `${Date.now()}-bot`, role: "bot", text: reply }
                : message));
        }
        catch {
            setMessages((prev) => prev.map((message) => message.id === "typing"
                ? {
                    id: `${Date.now()}-bot-error`,
                    role: "bot",
                    text: (0, chatbot_1.buildChatbotBusyMessage)(t),
                }
                : message));
        }
        finally {
            setSending(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)(react_native_1.Modal, { visible: visible, transparent: true, animationType: "slide", onRequestClose: onClose, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.overlay, children: (0, jsx_runtime_1.jsxs)(react_native_1.Animated.View, { style: [styles.container, { height: modalHeight }], children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.handleWrapper, ...panResponder.panHandlers, children: (0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.handle }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.header, children: [(0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.headerInfo, children: [(0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.botAvatar, children: (0, jsx_runtime_1.jsx)(vector_icons_1.Ionicons, { name: "chatbubble-ellipses", size: 18, color: ui.onPrimary }) }), (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.headerTextWrap, children: [(0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.title, children: t("chatbot.title") }), (0, jsx_runtime_1.jsx)(react_native_1.Text, { style: styles.subtitle, numberOfLines: 1, children: t("chatbot.subtitleOnline") })] })] }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { onPress: onClose, style: styles.closeBtn, accessibilityLabel: t("chatbot.closeLabel"), children: (0, jsx_runtime_1.jsx)(vector_icons_1.Ionicons, { name: "close", size: 20, color: ui.textPrimary }) })] }), (0, jsx_runtime_1.jsx)(react_native_1.FlatList, { ref: listRef, data: messages, keyExtractor: (item) => item.id, contentContainerStyle: styles.chatList, renderItem: ({ item }) => ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: [
                                styles.bubble,
                                item.role === "user" ? styles.userBubble : styles.botBubble,
                            ], children: item.typing ? ((0, jsx_runtime_1.jsx)(TypingIndicator, { styles: styles, ui: ui })) : ((0, jsx_runtime_1.jsx)(MarkdownText, { text: item.text || "", isUser: item.role === "user", styles: styles })) })) }), (0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: { paddingBottom: keyboardOffset }, children: (0, jsx_runtime_1.jsxs)(react_native_1.View, { style: styles.inputRow, children: [(0, jsx_runtime_1.jsx)(react_native_1.TextInput, { placeholder: t("chatbot.placeholder"), placeholderTextColor: ui.textSecondary, value: input, onChangeText: setInput, style: styles.input, selectionColor: ui.primary, onSubmitEditing: sendMessage }), (0, jsx_runtime_1.jsx)(react_native_1.Pressable, { onPress: sendMessage, disabled: !input.trim() || sending, style: [styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled], children: (0, jsx_runtime_1.jsx)(vector_icons_1.Ionicons, { name: "send", size: 18, color: ui.onPrimary }) })] }) })] }) }) }));
}
function MarkdownText({ text, isUser, styles, }) {
    return ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: [styles.text, isUser && styles.userText], children: text.split("**").map((part, index) => ((0, jsx_runtime_1.jsx)(react_native_1.Text, { style: index % 2 ? styles.boldText : undefined, children: part }, `${part}-${index}`))) }));
}
function TypingIndicator({ styles, ui, }) {
    const dotA = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const dotB = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const dotC = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    const dots = [dotA, dotB, dotC];
    (0, react_1.useEffect)(() => {
        const animations = dots.map((dot, index) => react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.timing(dot, {
                toValue: -4,
                duration: 260,
                delay: index * 120,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(dot, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }),
        ])));
        animations.forEach((animation) => animation.start());
        return () => {
            animations.forEach((animation) => animation.stop());
        };
    }, [dotA, dotB, dotC, dots]);
    return ((0, jsx_runtime_1.jsx)(react_native_1.View, { style: styles.typingWrap, children: dots.map((dot, index) => ((0, jsx_runtime_1.jsx)(react_native_1.Animated.View, { style: [
                styles.typingDot,
                {
                    backgroundColor: ui.textSecondary,
                    transform: [{ translateY: dot }],
                },
            ] }, index))) }));
}
function createStyles(ui) {
    return react_native_1.StyleSheet.create({
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
