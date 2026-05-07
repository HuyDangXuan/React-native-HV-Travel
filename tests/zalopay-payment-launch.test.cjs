const {
  resolveZaloPayPaymentLaunch,
} = require("../.test-dist/utils/zalopayPaymentLaunch");

describe("ZaloPay payment launch resolver", () => {
  test("uses native SDK when bridge is available and token exists", () => {
    expect(
      resolveZaloPayPaymentLaunch({
        isNativeAvailable: true,
        zpTransToken: "zp-token-1",
        orderUrl: "https://sb-openapi.zalopay.vn/order",
      })
    ).toEqual({
      mode: "native",
      target: "zp-token-1",
      message: "",
    });
  });

  test("falls back to orderUrl when native SDK is unavailable", () => {
    expect(
      resolveZaloPayPaymentLaunch({
        isNativeAvailable: false,
        zpTransToken: "zp-token-1",
        orderUrl: "https://sb-openapi.zalopay.vn/order",
      })
    ).toEqual({
      mode: "url",
      target: "https://sb-openapi.zalopay.vn/order",
      message: "ZaloPay SDK chua san sang, dang mo cong thanh toan ZaloPay.",
    });
  });

  test("reports unavailable when neither SDK token nor orderUrl can be used", () => {
    expect(
      resolveZaloPayPaymentLaunch({
        isNativeAvailable: false,
        zpTransToken: "",
        orderUrl: "",
      })
    ).toEqual({
      mode: "unavailable",
      target: "",
      message: "Thieu du lieu thanh toan ZaloPay tu backend.",
    });
  });
});
