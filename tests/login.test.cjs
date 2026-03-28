jest.mock("expo-secure-store", () => ({
  AFTER_FIRST_UNLOCK: "after-first-unlock",
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => null),
    setItem: jest.fn(async () => undefined),
    removeItem: jest.fn(async () => undefined),
  },
}));

const apiModule = require("../.test-dist/config/api");
const { ApiService } = require("../.test-dist/services/ApiService");
const { AuthService } = require("../.test-dist/services/AuthService");
const authSchema = require("../.test-dist/validators/authSchema");

const api = apiModule.default || apiModule;

describe("login unit tests", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("loginSchema accepts a valid email and password", () => {
    const { error, value } = authSchema.loginSchema.validate({
      email: "traveler@example.com",
      password: "secret123",
    });

    expect(error).toBeUndefined();
    expect(value.email).toBe("traveler@example.com");
    expect(value.password).toBe("secret123");
  });

  test("loginSchema rejects an invalid email", () => {
    const { error } = authSchema.loginSchema.validate({
      email: "not-an-email",
      password: "secret123",
    });

    expect(error).toBeTruthy();
    expect(error.details[0].message).toMatch(/Email/i);
  });

  test("loginSchema rejects a password shorter than 6 characters", () => {
    const { error } = authSchema.loginSchema.validate({
      email: "traveler@example.com",
      password: "12345",
    });

    expect(error).toBeTruthy();
    expect(error.details[0].message).toMatch(/mật khẩu|máº­t kháº©u/i);
  });

  test("AuthService.login sends the expected login request", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ status: true });

    const response = await AuthService.login(
      "traveler@example.com",
      "secret123",
      "device-1"
    );

    expect(response).toEqual({ status: true });
    expect(fetchSpy).toHaveBeenCalledWith(api.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "traveler@example.com",
        password: "secret123",
        deviceId: "device-1",
      }),
    });
  });

  test("AuthService.authToken normalizes a nested customer payload", async () => {
    jest.spyOn(ApiService, "fetchWithTimeout").mockResolvedValue({
      data: {
        customer: {
          _id: "cus_123",
          fullName: "Nguyen Van A",
          email: "traveler@example.com",
          phone_number: "0900000000",
        },
      },
    });

    const customer = await AuthService.authToken("token-123");

    expect(customer.id).toBe("cus_123");
    expect(customer.fullName).toBe("Nguyen Van A");
    expect(customer.phoneNumber).toBe("0900000000");
  });
});
