"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSessionService = void 0;
const SecureStore = __importStar(require("expo-secure-store"));
const async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
const api_1 = __importDefault(require("../config/api"));
const AccountStorageService_1 = require("./AccountStorageService");
const dataAdapters_1 = require("./dataAdapters");
const SESSION_KEY = "auth_session_v1";
const DEVICE_ID_KEY = "auth_device_id_v1";
const MIGRATION_KEY = "auth_session_migration_v1";
const SOFT_LOGOUT_KEY = "auth_soft_logout_v1";
const LEGACY_SECURE_KEYS = ["access_token", "SecureStore"];
const LEGACY_ASYNC_KEYS = ["token"];
let refreshPromise = null;
const listeners = new Set();
const parseJson = async (response) => {
    try {
        return (await response.json());
    }
    catch {
        return null;
    }
};
const toError = (status, fallbackMessage, body) => ({
    status,
    message: body?.message || body?.error || fallbackMessage,
    data: body,
});
const emitSessionChanged = (session) => {
    listeners.forEach((listener) => listener(session));
};
const isSoftLoggedOut = async () => {
    return (await async_storage_1.default.getItem(SOFT_LOGOUT_KEY)) === "1";
};
const setSoftLogoutFlag = async (value) => {
    if (value) {
        await async_storage_1.default.setItem(SOFT_LOGOUT_KEY, "1");
        return;
    }
    await async_storage_1.default.removeItem(SOFT_LOGOUT_KEY);
};
const createDeviceId = () => `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const normalizeSessionCustomer = (customer) => {
    return customer ? (0, dataAdapters_1.normalizeCustomer)(customer) : null;
};
const extractAuthSession = (response, currentSession) => {
    const data = response?.data ?? response ?? {};
    const accessToken = data.accessToken;
    const refreshToken = data.refreshToken || currentSession?.refreshToken;
    const customer = normalizeSessionCustomer(data.customer) || currentSession?.customer || null;
    if (!accessToken || !refreshToken || !customer) {
        throw { status: 500, message: "Phản hồi đăng nhập không hợp lệ" };
    }
    return {
        accessToken,
        refreshToken,
        customer,
    };
};
const persistSession = async (session) => {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
};
const readSessionFromStorage = async () => {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw)
        return null;
    try {
        const parsed = JSON.parse(raw);
        if (!parsed?.accessToken || !parsed?.refreshToken) {
            await SecureStore.deleteItemAsync(SESSION_KEY);
            return null;
        }
        return {
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
            customer: parsed.customer || null,
        };
    }
    catch {
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
    }
};
const cleanLegacyStorageOnce = async () => {
    const migrationDone = await async_storage_1.default.getItem(MIGRATION_KEY);
    if (migrationDone === "done") {
        return false;
    }
    let foundLegacyState = false;
    for (const key of LEGACY_SECURE_KEYS) {
        const value = await SecureStore.getItemAsync(key);
        if (value) {
            foundLegacyState = true;
        }
        await SecureStore.deleteItemAsync(key);
    }
    for (const key of LEGACY_ASYNC_KEYS) {
        const value = await async_storage_1.default.getItem(key);
        if (value) {
            foundLegacyState = true;
        }
        await async_storage_1.default.removeItem(key);
    }
    const accounts = await AccountStorageService_1.AccountStorageService.getAccounts();
    for (const account of accounts) {
        const legacyAccountTokenKey = `token_${account.id}`;
        const value = await SecureStore.getItemAsync(legacyAccountTokenKey);
        if (value) {
            foundLegacyState = true;
        }
        await SecureStore.deleteItemAsync(legacyAccountTokenKey);
    }
    await async_storage_1.default.setItem(MIGRATION_KEY, "done");
    return foundLegacyState;
};
const requestFreshSession = async (session) => {
    const response = await fetch(api_1.default.refresh, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
    });
    const body = await parseJson(response);
    if (!response.ok) {
        throw toError(response.status, "Không thể làm mới phiên đăng nhập", body);
    }
    return extractAuthSession(body, session);
};
const requestCurrentCustomer = async (accessToken) => {
    const response = await fetch(api_1.default.me, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    const body = await parseJson(response);
    if (!response.ok) {
        throw toError(response.status, "Không thể lấy thông tin tài khoản", body);
    }
    const customer = (0, dataAdapters_1.normalizeCustomer)(body?.data?.customer || body?.data || body);
    if (!customer) {
        throw { status: 401, message: "Không thể xác thực tài khoản" };
    }
    return customer;
};
class AuthSessionService {
    static subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
    static async getSession() {
        return readSessionFromStorage();
    }
    static async getOrCreateDeviceId() {
        const existingDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (existingDeviceId) {
            return existingDeviceId;
        }
        const deviceId = createDeviceId();
        await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceId, {
            keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
        });
        return deviceId;
    }
    static async canResumeRememberedAccount(customerId) {
        const session = await readSessionFromStorage();
        return Boolean(session?.refreshToken && session.customer?.id === customerId);
    }
    static async restoreSession() {
        const legacyStateRemoved = await cleanLegacyStorageOnce();
        if (legacyStateRemoved) {
            await this.clearSession();
            return { session: null, requiresReauth: true };
        }
        const session = await readSessionFromStorage();
        if (session && (await isSoftLoggedOut())) {
            return {
                session: null,
                requiresReauth: false,
            };
        }
        return {
            session,
            requiresReauth: false,
        };
    }
    static async setSessionFromAuthResponse(response) {
        const session = extractAuthSession(response);
        await persistSession(session);
        await setSoftLogoutFlag(false);
        emitSessionChanged(session);
        return session;
    }
    static async updateCustomer(customer) {
        const session = await readSessionFromStorage();
        if (!session)
            return null;
        const updatedSession = { ...session, customer };
        await persistSession(updatedSession);
        await setSoftLogoutFlag(false);
        emitSessionChanged(updatedSession);
        return updatedSession;
    }
    static async clearSession() {
        refreshPromise = null;
        await SecureStore.deleteItemAsync(SESSION_KEY);
        await setSoftLogoutFlag(false);
        emitSessionChanged(null);
    }
    static async softLogout() {
        refreshPromise = null;
        await setSoftLogoutFlag(true);
        emitSessionChanged(null);
    }
    static async rememberCurrentAccount() {
        const session = await readSessionFromStorage();
        const customer = session?.customer;
        if (!session || !customer) {
            throw { status: 400, message: "Không có phiên đăng nhập để lưu" };
        }
        await AccountStorageService_1.AccountStorageService.saveAccount({
            id: customer.id,
            fullName: customer.fullName,
            email: customer.email,
            avatar: customer.avatarUrl ? { uri: customer.avatarUrl } : undefined,
            lastLoginAt: Date.now(),
        });
    }
    static async resumeRememberedAccount(customerId) {
        const session = await readSessionFromStorage();
        if (!session || session.customer?.id !== customerId) {
            await this.clearSession();
            throw { status: 401, message: "Vui lòng đăng nhập lại để tiếp tục" };
        }
        const refreshedSession = await this.refreshSession();
        const customer = await requestCurrentCustomer(refreshedSession.accessToken);
        await this.updateCustomer(customer);
        return customer;
    }
    static async refreshSession() {
        if (refreshPromise) {
            return refreshPromise;
        }
        refreshPromise = (async () => {
            const session = await readSessionFromStorage();
            if (!session) {
                throw { status: 401, message: "Phiên đăng nhập đã hết hạn" };
            }
            try {
                const refreshedSession = await requestFreshSession(session);
                await persistSession(refreshedSession);
                await setSoftLogoutFlag(false);
                emitSessionChanged(refreshedSession);
                return refreshedSession;
            }
            catch (error) {
                if (error?.status === 401) {
                    await this.clearSession();
                }
                throw error;
            }
            finally {
                refreshPromise = null;
            }
        })();
        return refreshPromise;
    }
}
exports.AuthSessionService = AuthSessionService;
