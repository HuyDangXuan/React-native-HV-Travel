"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = exports.normalizeChatServiceMessagesResponse = void 0;
const api_1 = __importDefault(require("../config/api"));
const ApiService_1 = require("./ApiService");
const dataAdapters_1 = require("./dataAdapters");
const isEndpointUnavailableError = (error) => {
    if (typeof error !== "object" || error === null)
        return false;
    const status = error.status ?? 0;
    return status === 404 || status === 405 || status === 501;
};
const normalizeConversationResponse = (payload) => {
    const rawConversation = payload?.data?.conversation ??
        payload?.data?.data?.conversation ??
        payload?.conversation ??
        payload?.data?.data ??
        payload?.data ??
        payload;
    const conversation = (0, dataAdapters_1.normalizeChatConversation)(rawConversation);
    return conversation.id ? conversation : null;
};
const normalizeChatServiceMessagesResponse = (payload) => {
    if (Array.isArray(payload?.data)) {
        return (0, dataAdapters_1.normalizeChatMessages)(payload.data);
    }
    const rawMessage = payload?.data?.message ??
        payload?.data?.data?.message ??
        payload?.data?.data ??
        payload?.data ??
        (payload?.message && typeof payload.message === "object" ? payload.message : undefined) ??
        payload;
    if (rawMessage && !Array.isArray(rawMessage) && rawMessage.id) {
        return [(0, dataAdapters_1.normalizeChatMessage)(rawMessage)];
    }
    if (payload && !Array.isArray(payload) && payload.id) {
        return [(0, dataAdapters_1.normalizeChatMessage)(payload)];
    }
    return (0, dataAdapters_1.normalizeChatMessages)(payload);
};
exports.normalizeChatServiceMessagesResponse = normalizeChatServiceMessagesResponse;
class ChatService {
}
exports.ChatService = ChatService;
_a = ChatService;
ChatService.getConversations = async (token, filters) => {
    const query = new URLSearchParams();
    if (filters?.conversationCode?.trim()) {
        query.set("conversationCode", filters.conversationCode.trim());
    }
    if (filters?.customerId?.trim()) {
        query.set("customerId", filters.customerId.trim());
    }
    const requestUrl = query.toString()
        ? `${api_1.default.get_chat_conversations}?${query.toString()}`
        : api_1.default.get_chat_conversations;
    const response = await ApiService_1.ApiService.fetchWithTimeout(requestUrl, {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
    });
    return (0, dataAdapters_1.normalizeChatConversations)(response);
};
ChatService.getConversation = async (token, conversationId) => {
    const conversations = await _a.getConversations(token);
    const match = conversations.find((item) => item.id === conversationId);
    return match ?? null;
};
ChatService.bootstrapSupportConversation = async (token) => {
    const conversations = await _a.getConversations(token);
    const existing = (0, dataAdapters_1.getPrimarySupportConversation)(conversations);
    if (existing) {
        const messages = await _a.getMessages(token, existing.id).catch(() => []);
        return {
            conversation: existing,
            messages,
            created: false,
            canCreate: true,
        };
    }
    try {
        const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.create_chat_conversation, {
            method: "POST",
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                channel: "mobile",
                participantType: "customer",
                sourcePage: "inbox",
            }),
        });
        const conversation = normalizeConversationResponse(response);
        if (!conversation) {
            return {
                conversation: null,
                messages: [],
                created: false,
                canCreate: false,
            };
        }
        const messages = await _a.getMessages(token, conversation.id).catch(() => []);
        return {
            conversation,
            messages,
            created: true,
            canCreate: true,
        };
    }
    catch (error) {
        if (isEndpointUnavailableError(error)) {
            return {
                conversation: null,
                messages: [],
                created: false,
                canCreate: false,
            };
        }
        throw error;
    }
};
ChatService.createConversation = async (token, input = {}) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.create_chat_conversation, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            channel: input.channel ?? "mobile",
            sourcePage: input.sourcePage ?? "inbox",
            participantType: input.participantType ?? "customer",
        }),
    });
    const conversation = normalizeConversationResponse(response);
    if (!conversation) {
        throw {
            status: 500,
            message: "Không tạo được cuộc trò chuyện hỗ trợ",
        };
    }
    return conversation;
};
ChatService.getMessages = async (token, conversationId) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.get_chat_messages(conversationId), {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
    });
    return (0, exports.normalizeChatServiceMessagesResponse)(response);
};
ChatService.sendMessage = async (token, conversationId, content, clientMessageId) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.send_chat_message(conversationId), {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messageType: "text",
            content,
            clientMessageId,
        }),
    });
    const message = (0, exports.normalizeChatServiceMessagesResponse)(response)[0];
    return message ?? null;
};
ChatService.markConversationRead = async (token, conversationId) => ApiService_1.ApiService.fetchWithTimeout(api_1.default.mark_chat_conversation_read(conversationId), {
    method: "PUT",
    headers: { Authorization: "Bearer " + token },
});
ChatService.reopenConversation = async (token, conversationId) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.reopen_chat_conversation(conversationId), {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
    });
    return normalizeConversationResponse(response);
};
