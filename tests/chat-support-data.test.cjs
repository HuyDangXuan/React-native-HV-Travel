const {
  normalizeChatMessage,
  sortSupportConversations,
  getPrimarySupportConversation,
} = require("../.test-dist/services/dataAdapters");

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
