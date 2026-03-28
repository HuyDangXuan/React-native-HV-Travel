import { ApiService } from "./ApiService";
import api from "../config/api";
import {
  BookingListResult,
  BookingQuote,
  CreateBookingInput,
  normalizeBooking,
  normalizeBookings,
  normalizeBookingQuote,
  toCalculatePricePayload,
  toCreateBookingPayload,
} from "./dataAdapters";
import { Booking } from "../models/Booking";

export class BookingService {
  /** Lấy danh sách booking của customer hiện tại (có phân trang) */
  static getBookings = async (
    token: string,
    params?: { status?: string; page?: number; limit?: number }
  ): Promise<BookingListResult> => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const url = api.get_bookings + (qs ? `?${qs}` : "");

    const response = await ApiService.fetchWithTimeout(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });
    return normalizeBookings(response);
  };

  /** Lấy chi tiết 1 booking */
  static getBookingDetail = async (token: string, id: string): Promise<Booking> => {
    const response = await ApiService.fetchWithTimeout(api.get_booking_detail(id), {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });
    return normalizeBooking(response?.data ?? response);
  };

  /** Tính giá quote trước khi đặt */
  static calculatePrice = async (
    token: string,
    data: { tourId: string; adultCount?: number; childCount?: number; infantCount?: number }
  ): Promise<BookingQuote> => {
    const response = await ApiService.fetchWithTimeout(api.create_booking + "/calculate-price", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toCalculatePricePayload(data)),
    });
    return normalizeBookingQuote(response);
  };

  /** Tạo booking mới */
  static createBooking = async (token: string, data: CreateBookingInput) => {
    const response = await ApiService.fetchWithTimeout(api.create_booking, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toCreateBookingPayload(data)),
    });
    return normalizeBooking(response?.data ?? response);
  };

  /** Hủy booking (chỉ customer, chỉ khi status chưa Completed/Cancelled) */
  static cancelBooking = async (
    token: string,
    id: string,
    note?: string
  ): Promise<Booking> => {
    const response = await ApiService.fetchWithTimeout(api.cancel_booking(id), {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "Cancelled", note: note || "Khách hàng hủy booking" }),
    });
    return normalizeBooking(response?.data ?? response);
  };
}
