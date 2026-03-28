import api from "../config/api";
import { normalizeCustomer } from "./dataAdapters";
import { ApiService } from "./ApiService";

export class AuthService {
  static login = async (email: string, password: string, deviceId: string) => {
    return ApiService.fetchWithTimeout(api.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceId }),
    });
  };

  static logout = async (token: string) => {
    return ApiService.fetchWithTimeout(api.logout, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  static getSessions = async (token: string) => {
    return ApiService.fetchWithTimeout(api.auth_sessions, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  static logoutSession = async (token: string, sessionId: string) => {
    return ApiService.fetchWithTimeout(`${api.auth_sessions}/${sessionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  static logoutAllDevices = async (token: string) => {
    return ApiService.fetchWithTimeout(api.logout_all_devices, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  static register = async (
    fullname: string,
    email: string,
    password: string,
    repassword: string,
    deviceId: string
  ) => {
    return ApiService.fetchWithTimeout(api.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullname,
        email,
        password,
        rePassword: repassword,
        deviceId,
      }),
    });
  };

  static refresh = async (refreshToken: string) => {
    return ApiService.fetchWithTimeout(api.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  };

  static changePassword = async (
    token: string,
    currentPassword: string,
    newPassword: string
  ) => {
    return ApiService.fetchWithTimeout(api.change_password, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  };

  static forgotPassword = async (email: string) => {
    return ApiService.fetchWithTimeout(api.forgot_password, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  };

  static verifyOTP = async (otpId: string, otp: string) => {
    return ApiService.fetchWithTimeout(api.verify_otp, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpId, otp }),
    });
  };

  static resetPassword = async (otpId: string, newPassword: string) => {
    return ApiService.fetchWithTimeout(api.reset_password, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpId, newPassword }),
    });
  };

  static authToken = async (token: string) => {
    const response = await ApiService.fetchWithTimeout(api.me, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const customer = normalizeCustomer(response?.data?.customer || response?.data || response);

    if (!customer) {
      throw { status: 401, message: "Unauthorized" };
    }

    return customer;
  };
}
