import api from "../config/api";
import { ApiService } from "./ApiService";
import {
  ChatConversationSummary,
  ChatMessageItem,
  normalizeChatConversations,
  normalizeChatMessages,
} from "./dataAdapters";

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

  static getMessages = async (
    token: string,
    conversationId: string
  ): Promise<ChatMessageItem[]> => {
    const response = await ApiService.fetchWithTimeout(api.get_chat_messages(conversationId), {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    return normalizeChatMessages(response);
  };

  static markConversationRead = async (token: string, conversationId: string) =>
    ApiService.fetchWithTimeout(api.mark_chat_conversation_read(conversationId), {
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
    });
}
