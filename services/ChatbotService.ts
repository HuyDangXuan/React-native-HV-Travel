import api from "../config/api";
import { ApiService } from "./ApiService";

export const chatWithTour = async (
  tourId: string,
  message: string,
  conversationId: string,
): Promise<string> => {
  const res = await ApiService.fetchWithTimeout(
    api.chatbot,
    {
      method: "POST",
      body: JSON.stringify({
        tourId,
        message,
        conversationId,
      }),
    }
  );

  return res.reply;
};