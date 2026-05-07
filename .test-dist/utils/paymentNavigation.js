"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMainTabsResetState = buildMainTabsResetState;
exports.buildMyBookingResetState = buildMyBookingResetState;
exports.buildPaymentResultResetState = buildPaymentResultResetState;
exports.buildMomoPaymentRouteParams = buildMomoPaymentRouteParams;
exports.buildZaloPayPaymentRouteParams = buildZaloPayPaymentRouteParams;
function buildMainTabsResetState() {
    return {
        index: 0,
        routes: [{ name: "MainTabs" }],
    };
}
function buildMyBookingResetState() {
    return {
        index: 1,
        routes: [{ name: "MainTabs" }, { name: "MyBookingScreen" }],
    };
}
function buildPaymentResultResetState(routeName, params) {
    return {
        index: 1,
        routes: [{ name: "MainTabs" }, { name: routeName, params }],
    };
}
function buildMomoPaymentRouteParams({ tourId, total, amountText, bookingId, bookingCode, payment, }) {
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
function buildZaloPayPaymentRouteParams({ tourId, total, amountText, bookingId, bookingCode, payment, }) {
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
