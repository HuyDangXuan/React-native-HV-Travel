import { ApiService } from "./ApiService";
import api from "../config/api";
import { MoMoPaymentSession, ZaloPayPaymentSession } from "../models/Payment";

const MOMO_PAYMENT_TIMEOUT_MS = 40000;
const ZALOPAY_PAYMENT_TIMEOUT_MS = 40000;

const unwrapData = <T>(response: any): T => {
  if (response?.data !== undefined) return response.data as T;
  return response as T;
};

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

  static createMomoPayment = async (
    token: string,
    data: { bookingId: string }
  ): Promise<MoMoPaymentSession> => {
    const response = await ApiService.fetchWithTimeout(
      api.create_momo_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: data.bookingId }),
      },
      MOMO_PAYMENT_TIMEOUT_MS
    );

    return unwrapData<MoMoPaymentSession>(response);
  };

  static queryMomoPayment = async (
    token: string,
    data: { paymentId?: string; orderId?: string }
  ): Promise<MoMoPaymentSession> => {
    const response = await ApiService.fetchWithTimeout(
      api.query_momo_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      MOMO_PAYMENT_TIMEOUT_MS
    );

    return unwrapData<MoMoPaymentSession>(response);
  };

  static getMomoPaymentStatus = async (
    token: string,
    paymentId: string
  ): Promise<MoMoPaymentSession> => {
    const response = await ApiService.fetchWithTimeout(api.momo_payment_status(paymentId), {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    return unwrapData<MoMoPaymentSession>(response);
  };

  static createZaloPayPayment = async (
    token: string,
    data: { bookingId: string }
  ): Promise<ZaloPayPaymentSession> => {
    const response = await ApiService.fetchWithTimeout(
      api.create_zalopay_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: data.bookingId }),
      },
      ZALOPAY_PAYMENT_TIMEOUT_MS
    );

    return unwrapData<ZaloPayPaymentSession>(response);
  };

  static queryZaloPayPayment = async (
    token: string,
    data: { paymentId?: string; appTransId?: string }
  ): Promise<ZaloPayPaymentSession> => {
    const response = await ApiService.fetchWithTimeout(
      api.query_zalopay_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      ZALOPAY_PAYMENT_TIMEOUT_MS
    );

    return unwrapData<ZaloPayPaymentSession>(response);
  };

  static getZaloPayPaymentStatus = async (
    token: string,
    paymentId: string
  ): Promise<ZaloPayPaymentSession> => {
    const response = await ApiService.fetchWithTimeout(api.zalopay_payment_status(paymentId), {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    return unwrapData<ZaloPayPaymentSession>(response);
  };
}
