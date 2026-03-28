import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import api from "../config/api";
import { Customer } from "../models/Customer";
import { AccountStorageService } from "./AccountStorageService";
import { normalizeCustomer } from "./dataAdapters";

type AuthResponseData = {
  customer?: Customer | Record<string, unknown> | null;
  accessToken?: string;
  refreshToken?: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  customer: Customer | null;
};

type RestoreSessionResult = {
  session: AuthSession | null;
  requiresReauth: boolean;
};

type SessionListener = (session: AuthSession | null) => void;

const SESSION_KEY = "auth_session_v1";
const DEVICE_ID_KEY = "auth_device_id_v1";
const MIGRATION_KEY = "auth_session_migration_v1";
const SOFT_LOGOUT_KEY = "auth_soft_logout_v1";
const LEGACY_SECURE_KEYS = ["access_token", "SecureStore"];
const LEGACY_ASYNC_KEYS = ["token"];

let refreshPromise: Promise<AuthSession> | null = null;
const listeners = new Set<SessionListener>();

const parseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const toError = (status: number, fallbackMessage: string, body?: any) => ({
  status,
  message: body?.message || body?.error || fallbackMessage,
  data: body,
});

const emitSessionChanged = (session: AuthSession | null) => {
  listeners.forEach((listener) => listener(session));
};

const isSoftLoggedOut = async () => {
  return (await AsyncStorage.getItem(SOFT_LOGOUT_KEY)) === "1";
};

const setSoftLogoutFlag = async (value: boolean) => {
  if (value) {
    await AsyncStorage.setItem(SOFT_LOGOUT_KEY, "1");
    return;
  }

  await AsyncStorage.removeItem(SOFT_LOGOUT_KEY);
};

const createDeviceId = () =>
  `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeSessionCustomer = (
  customer?: Customer | Record<string, unknown> | null
) => {
  return customer ? normalizeCustomer(customer as Record<string, unknown>) : null;
};

const extractAuthSession = (
  response: any,
  currentSession?: AuthSession | null
): AuthSession => {
  const data: AuthResponseData = response?.data ?? response ?? {};
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

const persistSession = async (session: AuthSession) => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  });
};

const readSessionFromStorage = async (): Promise<AuthSession | null> => {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.accessToken || !parsed?.refreshToken) {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      customer: parsed.customer || null,
    };
  } catch {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
};

const cleanLegacyStorageOnce = async (): Promise<boolean> => {
  const migrationDone = await AsyncStorage.getItem(MIGRATION_KEY);
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
    const value = await AsyncStorage.getItem(key);
    if (value) {
      foundLegacyState = true;
    }
    await AsyncStorage.removeItem(key);
  }

  const accounts = await AccountStorageService.getAccounts();
  for (const account of accounts) {
    const legacyAccountTokenKey = `token_${account.id}`;
    const value = await SecureStore.getItemAsync(legacyAccountTokenKey);
    if (value) {
      foundLegacyState = true;
    }
    await SecureStore.deleteItemAsync(legacyAccountTokenKey);
  }

  await AsyncStorage.setItem(MIGRATION_KEY, "done");
  return foundLegacyState;
};

const requestFreshSession = async (session: AuthSession): Promise<AuthSession> => {
  const response = await fetch(api.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  });
  const body = await parseJson<any>(response);

  if (!response.ok) {
    throw toError(response.status, "Không thể làm mới phiên đăng nhập", body);
  }

  return extractAuthSession(body, session);
};

const requestCurrentCustomer = async (accessToken: string): Promise<Customer> => {
  const response = await fetch(api.me, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const body = await parseJson<any>(response);

  if (!response.ok) {
    throw toError(response.status, "Không thể lấy thông tin tài khoản", body);
  }

  const customer = normalizeCustomer(body?.data?.customer || body?.data || body);
  if (!customer) {
    throw { status: 401, message: "Không thể xác thực tài khoản" };
  }

  return customer;
};

export class AuthSessionService {
  static subscribe(listener: SessionListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  static async getSession(): Promise<AuthSession | null> {
    return readSessionFromStorage();
  }

  static async getOrCreateDeviceId(): Promise<string> {
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

  static async canResumeRememberedAccount(customerId: string): Promise<boolean> {
    const session = await readSessionFromStorage();
    return Boolean(session?.refreshToken && session.customer?.id === customerId);
  }

  static async restoreSession(): Promise<RestoreSessionResult> {
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

  static async setSessionFromAuthResponse(response: any): Promise<AuthSession> {
    const session = extractAuthSession(response);
    await persistSession(session);
    await setSoftLogoutFlag(false);
    emitSessionChanged(session);
    return session;
  }

  static async updateCustomer(customer: Customer): Promise<AuthSession | null> {
    const session = await readSessionFromStorage();
    if (!session) return null;

    const updatedSession = { ...session, customer };
    await persistSession(updatedSession);
    await setSoftLogoutFlag(false);
    emitSessionChanged(updatedSession);
    return updatedSession;
  }

  static async clearSession(): Promise<void> {
    refreshPromise = null;
    await SecureStore.deleteItemAsync(SESSION_KEY);
    await setSoftLogoutFlag(false);
    emitSessionChanged(null);
  }

  static async softLogout(): Promise<void> {
    refreshPromise = null;
    await setSoftLogoutFlag(true);
    emitSessionChanged(null);
  }

  static async rememberCurrentAccount(): Promise<void> {
    const session = await readSessionFromStorage();
    const customer = session?.customer;

    if (!session || !customer) {
      throw { status: 400, message: "Không có phiên đăng nhập để lưu" };
    }

    await AccountStorageService.saveAccount({
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      avatar: customer.avatarUrl ? { uri: customer.avatarUrl } : undefined,
      lastLoginAt: Date.now(),
    });
  }

  static async resumeRememberedAccount(customerId: string): Promise<Customer> {
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

  static async refreshSession(): Promise<AuthSession> {
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
      } catch (error: any) {
        if (error?.status === 401) {
          await this.clearSession();
        }
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  }
}
