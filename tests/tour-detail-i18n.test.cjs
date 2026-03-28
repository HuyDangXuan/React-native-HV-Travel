const { translate } = require("../.test-dist/i18n/index");

describe("tour detail i18n keys", () => {
  test("exposes localized tour detail keys instead of raw key names", () => {
    expect(translate("vi", "tourDetail.bookNow")).not.toBe("tourDetail.bookNow");
    expect(translate("vi", "tourDetail.tabOverview")).not.toBe("tourDetail.tabOverview");
    expect(translate("vi", "tourDetail.reviewShowMore")).not.toBe("tourDetail.reviewShowMore");

    expect(translate("en", "tourDetail.bookNow")).not.toBe("tourDetail.bookNow");
    expect(translate("en", "tourDetail.tabOverview")).not.toBe("tourDetail.tabOverview");
    expect(translate("en", "tourDetail.reviewShowMore")).not.toBe("tourDetail.reviewShowMore");
  });

  test("exposes localized chatbot keys instead of raw key names", () => {
    expect(translate("vi", "chatbot.title")).not.toBe("chatbot.title");
    expect(translate("vi", "chatbot.placeholder")).not.toBe("chatbot.placeholder");
    expect(translate("en", "chatbot.title")).not.toBe("chatbot.title");
    expect(translate("en", "chatbot.placeholder")).not.toBe("chatbot.placeholder");
  });
});
