import { ApiService } from "./ApiService";
import api from "../config/api";

export class NotificationService {
  static getNotifications = async (token: string) => {
    return ApiService.fetchWithTimeout(api.get_notifications, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token },
    });
  };

  static markAsRead = async (token: string, id: string) => {
    return ApiService.fetchWithTimeout(api.mark_notification_read(id), {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token },
    });
  };
}
