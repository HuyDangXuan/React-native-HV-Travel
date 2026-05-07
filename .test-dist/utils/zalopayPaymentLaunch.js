"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveZaloPayPaymentLaunch = resolveZaloPayPaymentLaunch;
function resolveZaloPayPaymentLaunch({ isNativeAvailable, zpTransToken, orderUrl, }) {
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
