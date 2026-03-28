const {
  normalizeNotificationList,
  mapNotificationToInboxItem,
} = require("../.test-dist/utils/inboxNotifications");

describe("inbox notification helpers", () => {
  test("normalizes direct array payloads", () => {
    const source = [{ id: "1", title: "A" }];

    expect(normalizeNotificationList(source)).toEqual(source);
  });

  test("normalizes wrapped notification arrays", () => {
    const source = [{ id: "2", title: "B" }];

    expect(normalizeNotificationList({ notifications: source })).toEqual(source);
    expect(normalizeNotificationList({ data: source })).toEqual(source);
    expect(normalizeNotificationList({ items: source })).toEqual(source);
  });

  test("maps backend notification into inbox item shape", () => {
    const item = mapNotificationToInboxItem({
      id: "n1",
      title: "Khuyến mãi",
      message: "Giảm giá tour",
      type: "Promotion",
      isRead: false,
      createdAt: "2026-03-28T10:00:00.000Z",
    });

    expect(item.id).toBe("n1");
    expect(item.preview).toBe("Giảm giá tour");
    expect(item.isUnread).toBe(true);
    expect(item.systemIcon).toBe("pricetag-outline");
  });
});
