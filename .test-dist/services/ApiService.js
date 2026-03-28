"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiService = void 0;
const AuthSessionService_1 = require("./AuthSessionService");
class ApiService {
    static isAuthExpiredError(error) {
        return (typeof error === "object" &&
            error !== null &&
            "status" in error &&
            error.status === 401);
    }
}
exports.ApiService = ApiService;
_a = ApiService;
ApiService.fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const rawHeaders = (options.headers || {});
        const headers = { ...rawHeaders };
        const hasContentType = Object.keys(headers).some((key) => key.toLowerCase() === "content-type");
        if (!hasContentType && options.body) {
            headers["Content-Type"] = "application/json";
        }
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        const authorizationHeader = headers.Authorization || headers.authorization || "";
        if (response.status === 401 &&
            !options._skipAuthRefresh &&
            typeof authorizationHeader === "string" &&
            authorizationHeader.startsWith("Bearer ")) {
            try {
                const refreshedSession = await AuthSessionService_1.AuthSessionService.refreshSession();
                return _a.fetchWithTimeout(url, {
                    ...options,
                    headers: {
                        ...headers,
                        Authorization: `Bearer ${refreshedSession.accessToken}`,
                    },
                    _skipAuthRefresh: true,
                }, timeout);
            }
            catch (refreshError) {
                if (_a.isAuthExpiredError(refreshError)) {
                    throw refreshError;
                }
                throw refreshError;
            }
        }
        if (!response.ok) {
            throw {
                status: response.status,
                message: data?.message || data?.error || "Request failed",
                data,
            };
        }
        return data;
    }
    catch (err) {
        if (err?.name === "AbortError") {
            throw { status: 408, message: "Request timeout" };
        }
        throw err;
    }
    finally {
        clearTimeout(timer);
    }
};
