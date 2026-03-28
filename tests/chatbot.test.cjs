const apiModule = require("../.test-dist/config/api");
const { ApiService } = require("../.test-dist/services/ApiService");
const { chatWithTour } = require("../.test-dist/services/ChatbotService");

const api = apiModule.default || apiModule;

describe("chatbot unit tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("chatWithTour sends requests to the chatbot endpoint", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ reply: "Xin chao" });

    await chatWithTour("tour-1", "Tour nay co gi hay?", "conv-1");

    expect(fetchSpy).toHaveBeenCalledWith(api.chatbot, {
      method: "POST",
      body: JSON.stringify({
        tourId: "tour-1",
        message: "Tour nay co gi hay?",
        conversationId: "conv-1",
      }),
    });
  });

  test("chatWithTour includes tourId, message, and conversationId in the payload", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ reply: "3 ngay 2 dem" });

    await chatWithTour("tour-42", "Lich trinh bao nhieu ngay?", "conv-42");

    const [, options] = fetchSpy.mock.calls[0];
    expect(JSON.parse(options.body)).toEqual({
      tourId: "tour-42",
      message: "Lich trinh bao nhieu ngay?",
      conversationId: "conv-42",
    });
  });

  test("chatWithTour returns the reply text from the API response", async () => {
    jest.spyOn(ApiService, "fetchWithTimeout").mockResolvedValue({
      reply: "Tour nay con cho cho thang 4.",
    });

    const reply = await chatWithTour("tour-5", "Con cho khong?", "conv-5");

    expect(reply).toBe("Tour nay con cho cho thang 4.");
  });

  test("chatWithTour forwards an empty conversation id without altering it", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ reply: "Toi se tao cuoc hoi thoai moi." });

    await chatWithTour("tour-6", "Bat dau tu dau?", "");

    const [, options] = fetchSpy.mock.calls[0];
    expect(JSON.parse(options.body).conversationId).toBe("");
  });

  test("chatWithTour rethrows API errors", async () => {
    jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockRejectedValue(new Error("Chatbot unavailable"));

    await expect(
      chatWithTour("tour-7", "Xin tu van", "conv-7")
    ).rejects.toThrow("Chatbot unavailable");
  });
});
