type AppRouteName =
  | "MainTabs"
  | "MyBookingScreen"
  | "PaymentSuccessScreen"
  | "PaymentFailedScreen";

type ResetRoute = {
  name: AppRouteName;
  params?: Record<string, unknown>;
};

export type PaymentResultRouteName = "PaymentSuccessScreen" | "PaymentFailedScreen";

export type NavigationResetState = {
  index: number;
  routes: ResetRoute[];
};

type MomoPaymentSessionLike = {
  paymentId: string;
  orderId: string;
  requestId?: string;
  status?: string;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
};

type ZaloPayPaymentSessionLike = {
  paymentId: string;
  appTransId: string;
  status?: string;
  zpTransToken?: string;
  orderUrl?: string;
  qrCode?: string;
};

export function buildMainTabsResetState(): NavigationResetState {
  return {
    index: 0,
    routes: [{ name: "MainTabs" }],
  };
}

export function buildMyBookingResetState(): NavigationResetState {
  return {
    index: 1,
    routes: [{ name: "MainTabs" }, { name: "MyBookingScreen" }],
  };
}

export function buildPaymentResultResetState(
  routeName: PaymentResultRouteName,
  params: Record<string, unknown>
): NavigationResetState {
  return {
    index: 1,
    routes: [{ name: "MainTabs" }, { name: routeName, params }],
  };
}

export function buildMomoPaymentRouteParams({
  tourId,
  total,
  amountText,
  bookingId,
  bookingCode,
  payment,
}: {
  tourId?: string;
  total: number;
  amountText: string;
  bookingId: string;
  bookingCode: string;
  payment: MomoPaymentSessionLike;
}) {
  return {
    id: tourId,
    total,
    amountText,
    method: "MoMo",
    bookingId,
    orderId: bookingCode,
    paymentId: payment.paymentId,
    momoOrderId: payment.orderId,
    requestId: payment.requestId || "",
    paymentStatus: payment.status || "Pending",
    payUrl: payment.payUrl || "",
    deeplink: payment.deeplink || "",
    qrCodeUrl: payment.qrCodeUrl || "",
  };
}

export function buildZaloPayPaymentRouteParams({
  tourId,
  total,
  amountText,
  bookingId,
  bookingCode,
  payment,
}: {
  tourId?: string;
  total: number;
  amountText: string;
  bookingId: string;
  bookingCode: string;
  payment: ZaloPayPaymentSessionLike;
}) {
  return {
    id: tourId,
    total,
    amountText,
    method: "ZaloPay",
    bookingId,
    orderId: bookingCode,
    paymentId: payment.paymentId,
    zaloPayAppTransId: payment.appTransId,
    paymentStatus: payment.status || "Pending",
    zpTransToken: payment.zpTransToken || "",
    orderUrl: payment.orderUrl || "",
    qrCode: payment.qrCode || "",
  };
}
