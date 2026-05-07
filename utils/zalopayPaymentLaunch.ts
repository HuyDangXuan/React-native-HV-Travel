export type ZaloPayPaymentLaunchMode = "native" | "url" | "unavailable";

export type ZaloPayPaymentLaunchDecision = {
  mode: ZaloPayPaymentLaunchMode;
  target: string;
  message: string;
};

export function resolveZaloPayPaymentLaunch({
  isNativeAvailable,
  zpTransToken,
  orderUrl,
}: {
  isNativeAvailable: boolean;
  zpTransToken?: string;
  orderUrl?: string;
}): ZaloPayPaymentLaunchDecision {
  const token = zpTransToken?.trim() || "";
  const url = orderUrl?.trim() || "";

  if (isNativeAvailable && token) {
    return {
      mode: "native",
      target: token,
      message: "",
    };
  }

  if (url) {
    return {
      mode: "url",
      target: url,
      message: "ZaloPay SDK chua san sang, dang mo cong thanh toan ZaloPay.",
    };
  }

  return {
    mode: "unavailable",
    target: "",
    message: "Thieu du lieu thanh toan ZaloPay tu backend.",
  };
}
