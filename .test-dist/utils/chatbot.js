"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatbotTourName = getChatbotTourName;
exports.buildChatbotWelcomeMessage = buildChatbotWelcomeMessage;
exports.buildChatbotBusyMessage = buildChatbotBusyMessage;
exports.createConversationId = createConversationId;
function getChatbotTourName(t, tourName) {
    const normalized = typeof tourName === "string" ? tourName.trim() : "";
    return normalized || t("chatbot.tourFallback");
}
function buildChatbotWelcomeMessage(t, tourName) {
    return t("chatbot.welcome", {
        tourName: getChatbotTourName(t, tourName),
    });
}
function buildChatbotBusyMessage(t) {
    return t("chatbot.busy");
}
function createConversationId(now = Date.now(), random = Math.random()) {
    return `${now}-${random.toString(36).slice(2, 10)}`;
}
