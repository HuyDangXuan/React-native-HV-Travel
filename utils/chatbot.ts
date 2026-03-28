type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

export function getChatbotTourName(t: TranslateFn, tourName?: string | null) {
  const normalized = typeof tourName === "string" ? tourName.trim() : "";
  return normalized || t("chatbot.tourFallback");
}

export function buildChatbotWelcomeMessage(t: TranslateFn, tourName?: string | null) {
  return t("chatbot.welcome", {
    tourName: getChatbotTourName(t, tourName),
  });
}

export function buildChatbotBusyMessage(t: TranslateFn) {
  return t("chatbot.busy");
}

export function createConversationId(now = Date.now(), random = Math.random()) {
  return `${now}-${random.toString(36).slice(2, 10)}`;
}
