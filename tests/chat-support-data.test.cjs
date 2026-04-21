const {
  normalizeChatMessage,
  sortSupportConversations,
  getPrimarySupportConversation,
} = require("../.test-dist/services/dataAdapters");

jest.mock("../.test-dist/services/ApiService", () => ({
  ApiService: {
    fetchWithTimeout: jest.fn(),
  },
}));

const {
  ChatService,
  normalizeChatServiceMessagesResponse,
} = require("../.test-dist/services/ChatService");
const { ApiService } = require("../.test-dist/services/ApiService");

describe("support chat data adapters", () => {
  test("normalizes support chat messages from backend payloads", () => {
    const message = normalizeChatMessage({
      _id: "msg-1",
      conversationId: "conv-1",
      senderType: "customer",
      senderDisplayName: "Nguyễn Vũ",
      messageType: "text",
      content: "Xin chào",
      clientMessageId: "client-123",
      isRead: true,
    });

    expect(message.id).toBe("msg-1");
    expect(message.senderRole).toBe("me");
    expect(message.clientMessageId).toBe("client-123");
    expect(message.text).toBe("Xin chào");
  });

  test("normalizes staff and admin chat messages as support messages", () => {
    expect(
      normalizeChatMessage({
        _id: "staff-message",
        conversationId: "conv-1",
        senderType: "staff",
        content: "Toi dang kiem tra booking",
      }).senderRole
    ).toBe("support");

    expect(
      normalizeChatMessage({
        _id: "admin-message",
        conversationId: "conv-1",
        senderType: "admin",
        content: "Da cap nhat thong tin",
      }).senderRole
    ).toBe("support");
  });

  test("normalizes sent message responses that include an OK message field", () => {
    const [message] = normalizeChatServiceMessagesResponse({
      status: true,
      message: "OK",
      data: {
        id: "msg-2",
        conversationId: "conv-1",
        senderType: "customer",
        content: "Xin chao staff",
        clientMessageId: "client-456",
      },
      conversation: {
        id: "conv-1",
      },
    });

    expect(message.id).toBe("msg-2");
    expect(message.senderRole).toBe("me");
    expect(message.text).toBe("Xin chao staff");
    expect(message.clientMessageId).toBe("client-456");
  });

  test("sendMessage returns the created message from wrapped backend responses", async () => {
    ApiService.fetchWithTimeout.mockResolvedValueOnce({
      status: true,
      message: "OK",
      data: {
        id: "msg-3",
        conversationId: "conv-1",
        senderType: "customer",
        content: "Can ho tro booking",
        clientMessageId: "client-789",
      },
      conversation: {
        id: "conv-1",
      },
    });

    const message = await ChatService.sendMessage(
      "token-1",
      "conv-1",
      "Can ho tro booking",
      "client-789"
    );

    expect(message?.id).toBe("msg-3");
    expect(message?.text).toBe("Can ho tro booking");
    expect(message?.clientMessageId).toBe("client-789");
  });

  test("sorts unread support conversations first and picks the primary one", () => {
    const conversations = sortSupportConversations([
      {
        id: "a",
        customerId: "1",
        code: "",
        preview: "Old",
        lastMessageAt: "2026-03-01T10:00:00.000Z",
        unreadCount: 0,
        status: "waitingStaff",
        channel: "web",
        title: "HV Travel Support",
        subtitle: "Đang chờ tư vấn viên",
      },
      {
        id: "b",
        customerId: "1",
        code: "",
        preview: "New unread",
        lastMessageAt: "2026-03-02T10:00:00.000Z",
        unreadCount: 2,
        status: "waitingStaff",
        channel: "web",
        title: "HV Travel Support",
        subtitle: "Đang chờ tư vấn viên",
      },
    ]);

    expect(conversations[0].id).toBe("b");
    expect(getPrimarySupportConversation(conversations)?.id).toBe("b");
  });
});
