const mockSecureStoreState = new Map();
const mockAsyncStorageState = new Map();

const mockSecureStore = {
  AFTER_FIRST_UNLOCK: "after-first-unlock",
  getItemAsync: jest.fn(async (key) =>
    mockSecureStoreState.has(key) ? mockSecureStoreState.get(key) : null
  ),
  setItemAsync: jest.fn(async (key, value) => {
    mockSecureStoreState.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key) => {
    mockSecureStoreState.delete(key);
  }),
};

const mockAsyncStorage = {
  getItem: jest.fn(async (key) =>
    mockAsyncStorageState.has(key) ? mockAsyncStorageState.get(key) : null
  ),
  setItem: jest.fn(async (key, value) => {
    mockAsyncStorageState.set(key, value);
  }),
  removeItem: jest.fn(async (key) => {
    mockAsyncStorageState.delete(key);
  }),
};

jest.mock("expo-secure-store", () => mockSecureStore);
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: mockAsyncStorage,
  ...mockAsyncStorage,
}));

const createJsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const resetStorage = () => {
  mockSecureStoreState.clear();
  mockAsyncStorageState.clear();
  mockSecureStore.getItemAsync.mockClear();
  mockSecureStore.setItemAsync.mockClear();
  mockSecureStore.deleteItemAsync.mockClear();
  mockAsyncStorage.getItem.mockClear();
  mockAsyncStorage.setItem.mockClear();
  mockAsyncStorage.removeItem.mockClear();
};

const loadAuthModules = () => {
  jest.resetModules();
  const apiModule = require("../.test-dist/config/api");
  const api = apiModule.default || apiModule;
  const { ApiService } = require("../.test-dist/services/ApiService");
  const { AuthSessionService } = require("../.test-dist/services/AuthSessionService");

  return { api, ApiService, AuthSessionService };
};

describe("auth session manager", () => {
  beforeEach(() => {
    resetStorage();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  test("cleans up legacy auth keys exactly once and forces re-login on the upgrade restore", async () => {
    mockSecureStoreState.set("access_token", "legacy-access");
    mockSecureStoreState.set("SecureStore", "legacy-secure-store");
    mockSecureStoreState.set("token_customer-1", "legacy-per-account-token");
    mockAsyncStorageState.set(
      "SAVED_ACCOUNTS",
      JSON.stringify([
        {
          id: "customer-1",
          fullName: "Nguyen Van A",
          email: "traveler@example.com",
          lastLoginAt: 1711000000000,
        },
      ])
    );
    mockAsyncStorageState.set("token", "legacy-async-token");

    const { AuthSessionService } = loadAuthModules();

    const firstRestore = await AuthSessionService.restoreSession();

    expect(firstRestore.requiresReauth).toBe(true);
    expect(firstRestore.session).toBeNull();
    expect(mockSecureStoreState.has("access_token")).toBe(false);
    expect(mockSecureStoreState.has("SecureStore")).toBe(false);
    expect(mockSecureStoreState.has("token_customer-1")).toBe(false);
    expect(mockAsyncStorageState.has("token")).toBe(false);

    const deletesAfterFirstRestore = mockSecureStore.deleteItemAsync.mock.calls.length;
    const secondRestore = await AuthSessionService.restoreSession();

    expect(secondRestore.requiresReauth).toBe(false);
    expect(secondRestore.session).toBeNull();
    expect(mockSecureStore.deleteItemAsync.mock.calls).toHaveLength(deletesAfterFirstRestore);
  });

  test("resumes a remembered account through the canonical refresh-token session without per-account tokens", async () => {
    const { api, AuthSessionService } = loadAuthModules();

    await AuthSessionService.setSessionFromAuthResponse({
      data: {
        customer: {
          id: "customer-1",
          fullName: "Nguyen Van A",
          email: "traveler@example.com",
        },
        accessToken: "access-token-1",
        refreshToken: "refresh-token-1",
      },
    });

    await AuthSessionService.rememberCurrentAccount();

    expect(mockSecureStoreState.has("token_customer-1")).toBe(false);
    expect(JSON.parse(mockAsyncStorageState.get("SAVED_ACCOUNTS"))).toEqual([
      expect.objectContaining({
        id: "customer-1",
        email: "traveler@example.com",
        fullName: "Nguyen Van A",
      }),
    ]);

    global.fetch.mockImplementation(async (url, options = {}) => {
      if (url === api.refresh) {
        expect(JSON.parse(options.body)).toEqual({ refreshToken: "refresh-token-1" });
        return createJsonResponse(200, {
          data: {
            accessToken: "access-token-2",
            refreshToken: "refresh-token-2",
          },
        });
      }

      if (url === api.me) {
        expect(options.headers.Authorization).toBe("Bearer access-token-2");
        return createJsonResponse(200, {
          data: {
            customer: {
              id: "customer-1",
              fullName: "Nguyen Van A",
              email: "traveler@example.com",
            },
          },
        });
      }

      throw new Error(`Unexpected URL ${url}`);
    });

    const customer = await AuthSessionService.resumeRememberedAccount("customer-1");
    const session = await AuthSessionService.getSession();

    expect(customer.id).toBe("customer-1");
    expect(session.accessToken).toBe("access-token-2");
    expect(session.refreshToken).toBe("refresh-token-2");
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("does not resume a remembered account after logout cleared the canonical session", async () => {
    const { AuthSessionService } = loadAuthModules();

    await AuthSessionService.setSessionFromAuthResponse({
      data: {
        customer: {
          id: "customer-1",
          fullName: "Nguyen Van A",
          email: "traveler@example.com",
        },
        accessToken: "access-token-1",
        refreshToken: "refresh-token-1",
      },
    });

    expect(await AuthSessionService.canResumeRememberedAccount("customer-1")).toBe(true);

    await AuthSessionService.clearSession();

    expect(await AuthSessionService.canResumeRememberedAccount("customer-1")).toBe(false);
  });

  test("soft logout hides auto-login but still allows quick resume for the remembered account", async () => {
    const { AuthSessionService } = loadAuthModules();

    await AuthSessionService.setSessionFromAuthResponse({
      data: {
        customer: {
          id: "customer-1",
          fullName: "Nguyen Van A",
          email: "traveler@example.com",
        },
        accessToken: "access-token-1",
        refreshToken: "refresh-token-1",
      },
    });
    await AuthSessionService.rememberCurrentAccount();

    await AuthSessionService.softLogout();

    const restored = await AuthSessionService.restoreSession();

    expect(restored.requiresReauth).toBe(false);
    expect(restored.session).toBeNull();
    expect(await AuthSessionService.canResumeRememberedAccount("customer-1")).toBe(true);
  });

  test("reuses the same generated deviceId on the same device", async () => {
    const { AuthSessionService } = loadAuthModules();

    const firstDeviceId = await AuthSessionService.getOrCreateDeviceId();
    const secondDeviceId = await AuthSessionService.getOrCreateDeviceId();

    expect(firstDeviceId).toBe(secondDeviceId);
    expect(firstDeviceId).toMatch(/^device-/);
  });

  test("uses a single refresh request for concurrent 401s and retries each request once", async () => {
    const { api, ApiService, AuthSessionService } = loadAuthModules();

    await AuthSessionService.setSessionFromAuthResponse({
      data: {
        customer: {
          id: "customer-1",
          fullName: "Nguyen Van A",
          email: "traveler@example.com",
        },
        accessToken: "expired-access-token",
        refreshToken: "refresh-token-1",
      },
    });

    const protectedHits = new Map();

    global.fetch.mockImplementation(async (url, options = {}) => {
      if (url === api.refresh) {
        return createJsonResponse(200, {
          data: {
            accessToken: "fresh-access-token",
            refreshToken: "refresh-token-2",
          },
        });
      }

      const attempt = (protectedHits.get(url) || 0) + 1;
      protectedHits.set(url, attempt);

      if (attempt === 1) {
        expect(options.headers.Authorization).toBe("Bearer expired-access-token");
        return createJsonResponse(401, { message: "Expired token" });
      }

      expect(options.headers.Authorization).toBe("Bearer fresh-access-token");
      return createJsonResponse(200, {
        ok: true,
        url,
      });
    });

    const [bookings, profile] = await Promise.all([
      ApiService.fetchWithTimeout(`${api.get_bookings}`, {
        method: "GET",
        headers: { Authorization: "Bearer expired-access-token" },
      }),
      ApiService.fetchWithTimeout(`${api.get_customer_profile}`, {
        method: "GET",
        headers: { Authorization: "Bearer expired-access-token" },
      }),
    ]);

    expect(bookings).toEqual({ ok: true, url: `${api.get_bookings}` });
    expect(profile).toEqual({ ok: true, url: `${api.get_customer_profile}` });
    expect(global.fetch.mock.calls.filter(([url]) => url === api.refresh)).toHaveLength(1);
    expect(protectedHits.get(`${api.get_bookings}`)).toBe(2);
    expect(protectedHits.get(`${api.get_customer_profile}`)).toBe(2);
  });
});
