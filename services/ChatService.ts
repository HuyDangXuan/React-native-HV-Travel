import api from "../config/api";
import { ApiService } from "./ApiService";
import {
  ChatConversationSummary,
  ChatMessageItem,
  SupportConversationBootstrapResult,
  getPrimarySupportConversation,
  normalizeChatConversations,
  normalizeChatConversation,
  normalizeChatMessage,
  normalizeChatMessages,
} from "./dataAdapters";

type ChatError = {
  status?: number;
  message?: string;
  data?: any;
};

const isEndpointUnavailableError = (error: unknown) => {
  if (typeof error !== "object" || error === null) return false;
  const status = (error as ChatError).status ?? 0;
  return status === 404 || status === 405 || status === 501;
};

const normalizeConversationResponse = (payload: any): ChatConversationSummary | null => {
  const rawConversation =
    payload?.data?.conversation ??
    payload?.data?.data?.conversation ??
    payload?.conversation ??
    payload?.data?.data ??
    payload?.data ??
    payload;

  const conversation = normalizeChatConversation(rawConversation);
  return conversation.id ? conversation : null;
};

const normalizeMessagesResponse = (payload: any): ChatMessageItem[] => {
  if (Array.isArray(payload?.data)) {
    return normalizeChatMessages(payload.data);
  }

  const rawMessage =
    payload?.data?.message ??
    payload?.data?.data?.message ??
    payload?.message ??
    payload?.data?.data ??
    payload;

  if (rawMessage && !Array.isArray(rawMessage) && rawMessage.id) {
    return [normalizeChatMessage(rawMessage)];
  }

  if (payload && !Array.isArray(payload) && payload.id) {
    return [normalizeChatMessage(payload)];
  }

  return normalizeChatMessages(payload);
};

export class ChatService {
  static getConversations = async (
    token: string,
    filters?: { conversationCode?: string; customerId?: string }
  ): Promise<ChatConversationSummary[]> => {
    const query = new URLSearchParams();

    if (filters?.conversationCode?.trim()) {
      query.set("conversationCode", filters.conversationCode.trim());
    }

    if (filters?.customerId?.trim()) {
      query.set("customerId", filters.customerId.trim());
    }

    const requestUrl = query.toString()
      ? `${api.get_chat_conversations}?${query.toString()}`
      : api.get_chat_conversations;

    const response = await ApiService.fetchWithTimeout(requestUrl, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    return normalizeChatConversations(response);
  };

  static getConversation = async (
    token: string,
    conversationId: string
  ): Promise<ChatConversationSummary | null> => {
    const conversations = await this.getConversations(token);
    const match = conversations.find((item) => item.id === conversationId);
    return match ?? null;
  };

  static bootstrapSupportConversation = async (
    token: string
  ): Promise<SupportConversationBootstrapResult> => {
    const conversations = await this.getConversations(token);
    const existing = getPrimarySupportConversation(conversations);

    if (existing) {
      const messages = await this.getMessages(token, existing.id).catch(() => []);
      return {
        conversation: existing,
        messages,
        created: false,
        canCreate: true,
      };
    }

    try {
      const response = await ApiService.fetchWithTimeout(api.create_chat_conversation, {
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

      const messages = await this.getMessages(token, conversation.id).catch(() => []);
      return {
        conversation,
        messages,
        created: true,
        canCreate: true,
      };
    } catch (error) {
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

  static createConversation = async (
    token: string,
    input: { channel?: string; sourcePage?: string; participantType?: string } = {}
  ): Promise<ChatConversationSummary> => {
    const response = await ApiService.fetchWithTimeout(api.create_chat_conversation, {
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

  static getMessages = async (
    token: string,
    conversationId: string
  ): Promise<ChatMessageItem[]> => {
    const response = await ApiService.fetchWithTimeout(api.get_chat_messages(conversationId), {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    return normalizeMessagesResponse(response);
  };

  static sendMessage = async (
    token: string,
    conversationId: string,
    content: string,
    clientMessageId: string
  ): Promise<ChatMessageItem | null> => {
    const response = await ApiService.fetchWithTimeout(api.send_chat_message(conversationId), {
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

    const message = normalizeMessagesResponse(response)[0];
    return message ?? null;
  };

  static markConversationRead = async (token: string, conversationId: string) =>
    ApiService.fetchWithTimeout(api.mark_chat_conversation_read(conversationId), {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
}
