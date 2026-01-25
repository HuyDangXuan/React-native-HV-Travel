import api from "../config/api";
import { ApiService } from "./ApiService";

export class AuthService {
  static login = async (email: string, password: string) => {
    return ApiService.fetchWithTimeout(`${api.login}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password

        })
    });
  };

  static logout = async (token: string) => {
    console.log("api logout:", api.logout);
    return ApiService.fetchWithTimeout(`${api.logout}`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
    });
  }

  static register = async (fullname: string, email: string, password: string, repassword: string) => {
    return ApiService.fetchWithTimeout(`${api.register}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullname,
        email: email,
        password: password,
        rePassword: repassword,
      })
    });
  };

  static changePassword = async (userId: string, oldPass: string, newPass: string) => {
    return ApiService.fetchWithTimeout(`${api.change_password}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, oldPass, newPass })
    });
  };

  static forgotPassword = async (email: string) => {
    return ApiService.fetchWithTimeout(`${api.forgot_password}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
  };

  static verifyOTP = async (otpId: string, otp: string) => {
    return ApiService.fetchWithTimeout(`${api.verify_otp}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpId, otp })
    });
  };

  static resetPassword = async (otpId: string, newPassword: string) => {
    return ApiService.fetchWithTimeout(`${api.reset_password}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpId, newPassword })
    });
  };

  static authToken = async (token: string) => {
    console.log("api auth:", api.me);
    return ApiService.fetchWithTimeout(`${api.me}`, {
      method: "GET",
      headers: { "Authorization": "Bearer " + token },
    });
  }
}