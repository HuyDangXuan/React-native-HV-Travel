"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZaloPayNativeService = void 0;
const react_native_1 = require("react-native");
const getBridge = () => {
    return react_native_1.NativeModules.PayZaloBridge;
};
const normalizeResult = (raw) => {
    if (!raw)
        return { returnCode: 0, raw };
    const returnCode = Number(raw.returnCode ?? raw.errorCode ?? raw.code ?? 0);
    return {
        returnCode: Number.isFinite(returnCode) ? returnCode : 0,
        transactionId: raw.transactionId || raw.zpTransId || raw.zp_trans_id,
        zpTransToken: raw.zpTranstoken || raw.zpTransToken || raw.zp_trans_token,
        appTransId: raw.appTransId || raw.appTransID || raw.app_trans_id,
        message: raw.message || raw.returnMessage || raw.errorMessage,
        raw,
    };
};
class ZaloPayNativeService {
    static isAvailable() {
        return typeof getBridge()?.payOrder === "function";
    }
    static subscribe(listener) {
        const bridge = getBridge();
        if (!bridge) {
            return () => undefined;
        }
        const emitter = new react_native_1.NativeEventEmitter(bridge);
        const subscription = emitter.addListener("EventPayZalo", (data) => {
            listener(normalizeResult(data));
        });
        return () => subscription.remove();
    }
    static async payOrder(zpTransToken) {
        const bridge = getBridge();
        if (!bridge?.payOrder) {
            return {
                returnCode: -1,
                message: "ZaloPay SDK chua san sang. Can custom dev build de kiem tra App-to-App.",
            };
        }
        try {
            const raw = bridge.payOrder(zpTransToken);
            if (raw && typeof raw.then === "function") {
                return normalizeResult(await raw);
            }
            return normalizeResult(raw);
        }
        catch (error) {
            return {
                returnCode: -1,
                message: error?.message || "Khong the mo ZaloPay SDK",
                raw: error,
            };
        }
    }
}
exports.ZaloPayNativeService = ZaloPayNativeService;
