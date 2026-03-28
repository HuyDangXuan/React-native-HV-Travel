const { translate } = require("../.test-dist/i18n/index");
const {
  buildChatbotWelcomeMessage,
  buildChatbotBusyMessage,
  getChatbotTourName,
} = require("../.test-dist/utils/chatbot");

describe("chatbot ui helpers", () => {
  test("returns localized welcome message with the current tour name", () => {
    const viT = (key, params) => translate("vi", key, params);
    const enT = (key, params) => translate("en", key, params);

    expect(buildChatbotWelcomeMessage(viT, "Đà Lạt 3 ngày 2 đêm")).toContain("Đà Lạt 3 ngày 2 đêm");
    expect(buildChatbotWelcomeMessage(viT, "Đà Lạt 3 ngày 2 đêm")).toContain("Bạn muốn hỏi gì");

    expect(buildChatbotWelcomeMessage(enT, "Da Lat 3 days 2 nights")).toContain(
      "Da Lat 3 days 2 nights"
    );
    expect(buildChatbotWelcomeMessage(enT, "Da Lat 3 days 2 nights")).toContain(
      "What would you like to ask"
    );
  });

  test("falls back to a localized generic tour name when tour name is missing", () => {
    const viT = (key, params) => translate("vi", key, params);
    const enT = (key, params) => translate("en", key, params);

    expect(getChatbotTourName(viT, "")).toBe("tour này");
    expect(getChatbotTourName(enT, "")).toBe("this tour");
  });

  test("returns localized busy fallback message", () => {
    const viT = (key, params) => translate("vi", key, params);
    const enT = (key, params) => translate("en", key, params);

    expect(buildChatbotBusyMessage(viT)).toBe("Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.");
    expect(buildChatbotBusyMessage(enT)).toBe("Sorry, the system is busy. Please try again later.");
  });
});
