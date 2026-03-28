import { ApiService } from "./ApiService";
import api from "../config/api";
import { normalizeCustomer } from "./dataAdapters";

export class CustomerService {
  static getProfile = async (token: string) => {
    const response = await ApiService.fetchWithTimeout(api.get_customer_profile, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token },
    });
    return normalizeCustomer(response?.data ?? response);
  };

  static updateProfile = async (token: string, data: Record<string, any>) => {
    const response = await ApiService.fetchWithTimeout(api.update_customer_profile, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return normalizeCustomer(response?.data ?? response);
  };
}
