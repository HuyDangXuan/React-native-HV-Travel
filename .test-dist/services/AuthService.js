"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const api_1 = __importDefault(require("../config/api"));
const dataAdapters_1 = require("./dataAdapters");
const ApiService_1 = require("./ApiService");
class AuthService {
}
exports.AuthService = AuthService;
_a = AuthService;
AuthService.login = async (email, password, deviceId) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, deviceId }),
    });
};
AuthService.logout = async (token) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.logout, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
};
AuthService.getSessions = async (token) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.auth_sessions, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
};
AuthService.logoutSession = async (token, sessionId) => {
    return ApiService_1.ApiService.fetchWithTimeout(`${api_1.default.auth_sessions}/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
};
AuthService.logoutAllDevices = async (token) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.logout_all_devices, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
    });
};
AuthService.register = async (fullname, email, password, repassword, deviceId) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.register, {
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
AuthService.refresh = async (refreshToken) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.refresh, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
    });
};
AuthService.changePassword = async (token, currentPassword, newPassword) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.change_password, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
    });
};
AuthService.forgotPassword = async (email) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.forgot_password, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
};
AuthService.verifyOTP = async (otpId, otp) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.verify_otp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, otp }),
    });
};
AuthService.resetPassword = async (otpId, newPassword) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.reset_password, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpId, newPassword }),
    });
};
AuthService.authToken = async (token) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.me, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
    });
    const customer = (0, dataAdapters_1.normalizeCustomer)(response?.data?.customer || response?.data || response);
    if (!customer) {
        throw { status: 401, message: "Unauthorized" };
    }
    return customer;
};
