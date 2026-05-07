const {
  buildMomoPaymentRouteParams,
  buildZaloPayPaymentRouteParams,
  buildPaymentResultResetState,
  buildMainTabsResetState,
  buildMyBookingResetState,
} = require("../.test-dist/utils/paymentNavigation");

describe("payment navigation reset helpers", () => {
  test("builds success reset state that drops booking and payment history", () => {
    const params = {
      id: "TOUR-001",
      total: 2450000,
      amountText: "2.450.000 ₫",
      orderId: "DL123456",
      method: "ZaloPay",
    };

    expect(buildPaymentResultResetState("PaymentSuccessScreen", params)).toEqual({
      index: 1,
      routes: [
        { name: "MainTabs" },
        { name: "PaymentSuccessScreen", params },
      ],
    });
  });

  test("builds failed reset state that keeps only main tabs and failed result", () => {
    const params = {
      id: "TOUR-001",
      total: 2450000,
      amountText: "2.450.000 ₫",
      orderId: "DL123456",
      method: "VNPay",
      reason: "timeout",
    };

    expect(buildPaymentResultResetState("PaymentFailedScreen", params)).toEqual({
      index: 1,
      routes: [
        { name: "MainTabs" },
        { name: "PaymentFailedScreen", params },
      ],
    });
  });

  test("builds a home reset state for result CTA", () => {
    expect(buildMainTabsResetState()).toEqual({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  });

  test("builds a booked-trips reset state for result CTA", () => {
    expect(buildMyBookingResetState()).toEqual({
      index: 1,
      routes: [{ name: "MainTabs" }, { name: "MyBookingScreen" }],
    });
  });

  test("builds MoMo payment route params without mixing booking and provider ids", () => {
    expect(
      buildMomoPaymentRouteParams({
        tourId: "TOUR-001",
        total: 2450000,
        amountText: "2.450.000 ₫",
        bookingId: "booking-1",
        bookingCode: "HV001",
        payment: {
          paymentId: "payment-1",
          orderId: "MOMO_HV001_1710000000000",
          requestId: "REQ_1710000000000",
          status: "Pending",
          payUrl: "https://test-payment.momo.vn/pay",
          deeplink: "momo://pay",
          qrCodeUrl: "https://test-payment.momo.vn/qr",
        },
      })
    ).toEqual({
      id: "TOUR-001",
      total: 2450000,
      amountText: "2.450.000 ₫",
      method: "MoMo",
      bookingId: "booking-1",
      orderId: "HV001",
      paymentId: "payment-1",
      momoOrderId: "MOMO_HV001_1710000000000",
      requestId: "REQ_1710000000000",
      paymentStatus: "Pending",
      payUrl: "https://test-payment.momo.vn/pay",
      deeplink: "momo://pay",
      qrCodeUrl: "https://test-payment.momo.vn/qr",
    });
  });

  test("builds ZaloPay payment route params without mixing booking and provider ids", () => {
    expect(
      buildZaloPayPaymentRouteParams({
        tourId: "TOUR-001",
        total: 2450000,
        amountText: "2.450.000 â‚«",
        bookingId: "booking-1",
        bookingCode: "HV001",
        payment: {
          paymentId: "payment-2",
          appTransId: "260421_HV001_abcd1234",
          status: "Pending",
          zpTransToken: "zp-token-1",
          orderUrl: "https://sb-openapi.zalopay.vn/order",
          qrCode: "000201010212ZALOPAYQR",
        },
      })
    ).toEqual({
      id: "TOUR-001",
      total: 2450000,
      amountText: "2.450.000 â‚«",
      method: "ZaloPay",
      bookingId: "booking-1",
      orderId: "HV001",
      paymentId: "payment-2",
      zaloPayAppTransId: "260421_HV001_abcd1234",
      paymentStatus: "Pending",
      zpTransToken: "zp-token-1",
      orderUrl: "https://sb-openapi.zalopay.vn/order",
      qrCode: "000201010212ZALOPAYQR",
    });
  });
});
