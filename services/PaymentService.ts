import { ApiService } from "./ApiService";
import api from "../config/api";

export class PaymentService {
  static getPayments = async (token: string) => {
    return ApiService.fetchWithTimeout(api.get_payments, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token },
    });
  };

  static createPayment = async (token: string, data: Record<string, any>) => {
    return ApiService.fetchWithTimeout(api.create_payment, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };
}
