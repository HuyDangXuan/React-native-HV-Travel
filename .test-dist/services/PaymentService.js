"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const ApiService_1 = require("./ApiService");
const api_1 = __importDefault(require("../config/api"));
const MOMO_PAYMENT_TIMEOUT_MS = 40000;
const ZALOPAY_PAYMENT_TIMEOUT_MS = 40000;
const unwrapData = (response) => {
    if (response?.data !== undefined)
        return response.data;
    return response;
};
class PaymentService {
}
exports.PaymentService = PaymentService;
_a = PaymentService;
PaymentService.getPayments = async (token) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.get_payments, {
        method: "GET",
        headers: { "Authorization": "Bearer " + token },
    });
};
PaymentService.createPayment = async (token, data) => {
    return ApiService_1.ApiService.fetchWithTimeout(api_1.default.create_payment, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
};
PaymentService.createMomoPayment = async (token, data) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.create_momo_payment, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: data.bookingId }),
    }, MOMO_PAYMENT_TIMEOUT_MS);
    return unwrapData(response);
};
PaymentService.queryMomoPayment = async (token, data) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.query_momo_payment, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }, MOMO_PAYMENT_TIMEOUT_MS);
    return unwrapData(response);
};
PaymentService.getMomoPaymentStatus = async (token, paymentId) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.momo_payment_status(paymentId), {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
    });
    return unwrapData(response);
};
PaymentService.createZaloPayPayment = async (token, data) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.create_zalopay_payment, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId: data.bookingId }),
    }, ZALOPAY_PAYMENT_TIMEOUT_MS);
    return unwrapData(response);
};
PaymentService.queryZaloPayPayment = async (token, data) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.query_zalopay_payment, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }, ZALOPAY_PAYMENT_TIMEOUT_MS);
    return unwrapData(response);
};
PaymentService.getZaloPayPaymentStatus = async (token, paymentId) => {
    const response = await ApiService_1.ApiService.fetchWithTimeout(api_1.default.zalopay_payment_status(paymentId), {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
    });
    return unwrapData(response);
};
