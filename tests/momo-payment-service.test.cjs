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
const { PaymentService } = require("../.test-dist/services/PaymentService");

const api = apiModule.default || apiModule;

describe("MoMo payment service", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("createMomoPayment posts only bookingId to backend", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ data: { paymentId: "payment-1", status: "Pending" } });

    const response = await PaymentService.createMomoPayment("token-1", {
      bookingId: "booking-1",
    });

    expect(response).toEqual({ paymentId: "payment-1", status: "Pending" });
    expect(fetchSpy).toHaveBeenCalledWith(
      api.create_momo_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer token-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: "booking-1" }),
      },
      40000
    );
  });

  test("queryMomoPayment asks backend to synchronize provider status", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ data: { paymentId: "payment-1", status: "Success" } });

    const response = await PaymentService.queryMomoPayment("token-1", {
      paymentId: "payment-1",
    });

    expect(response.status).toBe("Success");
    expect(fetchSpy).toHaveBeenCalledWith(
      api.query_momo_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer token-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId: "payment-1" }),
      },
      40000
    );
  });

  test("getMomoPaymentStatus fetches payment status by payment id", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ data: { paymentId: "payment-1", status: "Pending" } });

    const response = await PaymentService.getMomoPaymentStatus("token-1", "payment-1");

    expect(response.status).toBe("Pending");
    expect(fetchSpy).toHaveBeenCalledWith(api.momo_payment_status("payment-1"), {
      method: "GET",
      headers: { Authorization: "Bearer token-1" },
    });
  });

  test("createZaloPayPayment posts only bookingId to backend", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ data: { paymentId: "payment-2", status: "Pending" } });

    const response = await PaymentService.createZaloPayPayment("token-1", {
      bookingId: "booking-1",
    });

    expect(response).toEqual({ paymentId: "payment-2", status: "Pending" });
    expect(fetchSpy).toHaveBeenCalledWith(
      api.create_zalopay_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer token-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: "booking-1" }),
      },
      40000
    );
  });

  test("queryZaloPayPayment asks backend to synchronize provider status", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ data: { paymentId: "payment-2", status: "Success" } });

    const response = await PaymentService.queryZaloPayPayment("token-1", {
      paymentId: "payment-2",
    });

    expect(response.status).toBe("Success");
    expect(fetchSpy).toHaveBeenCalledWith(
      api.query_zalopay_payment,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer token-1",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId: "payment-2" }),
      },
      40000
    );
  });

  test("getZaloPayPaymentStatus fetches payment status by payment id", async () => {
    const fetchSpy = jest
      .spyOn(ApiService, "fetchWithTimeout")
      .mockResolvedValue({ data: { paymentId: "payment-2", status: "Pending" } });

    const response = await PaymentService.getZaloPayPaymentStatus("token-1", "payment-2");

    expect(response.status).toBe("Pending");
    expect(fetchSpy).toHaveBeenCalledWith(api.zalopay_payment_status("payment-2"), {
      method: "GET",
      headers: { Authorization: "Bearer token-1" },
    });
  });
});
