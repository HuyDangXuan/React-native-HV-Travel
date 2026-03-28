"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithTour = void 0;
const api_1 = __importDefault(require("../config/api"));
const ApiService_1 = require("./ApiService");
const chatWithTour = async (tourId, message, conversationId) => {
    const res = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.chatbot, {
        method: "POST",
        body: JSON.stringify({
            tourId,
            message,
            conversationId,
        }),
    });
    return res.reply;
};
exports.chatWithTour = chatWithTour;
