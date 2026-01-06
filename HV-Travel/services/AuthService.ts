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
}