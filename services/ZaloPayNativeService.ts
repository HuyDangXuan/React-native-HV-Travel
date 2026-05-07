import { NativeEventEmitter, NativeModules } from "react-native";

export type ZaloPayNativeResult = {
  returnCode: number;
  transactionId?: string;
  zpTransToken?: string;
  appTransId?: string;
  message?: string;
  raw?: unknown;
};

type ZaloPayBridge = {
  payOrder?: (zpTransToken: string) => Promise<unknown> | unknown;
};

const getBridge = (): ZaloPayBridge | undefined => {
  return NativeModules.PayZaloBridge as ZaloPayBridge | undefined;
};

const normalizeResult = (raw: any): ZaloPayNativeResult => {
  if (!raw) return { returnCode: 0, raw };

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

export class ZaloPayNativeService {
  static isAvailable() {
    return typeof getBridge()?.payOrder === "function";
  }

  static subscribe(listener: (result: ZaloPayNativeResult) => void) {
    const bridge = getBridge();
    if (!bridge) {
      return () => undefined;
    }

    const emitter = new NativeEventEmitter(bridge as any);
    const subscription = emitter.addListener("EventPayZalo", (data) => {
      listener(normalizeResult(data));
    });

    return () => subscription.remove();
  }

  static async payOrder(zpTransToken: string): Promise<ZaloPayNativeResult> {
    const bridge = getBridge();
    if (!bridge?.payOrder) {
      return {
        returnCode: -1,
        message: "ZaloPay SDK chua san sang. Can custom dev build de kiem tra App-to-App.",
      };
    }

    try {
      const raw = bridge.payOrder(zpTransToken);
      if (raw && typeof (raw as Promise<unknown>).then === "function") {
        return normalizeResult(await raw);
      }

      return normalizeResult(raw);
    } catch (error: any) {
      return {
        returnCode: -1,
        message: error?.message || "Khong the mo ZaloPay SDK",
        raw: error,
      };
    }
  }
}
