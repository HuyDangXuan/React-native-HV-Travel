// ============================================================
// Payment Model — Khớp với ASP.NET Backend entity "Payment"
// Tách riêng khỏi Booking (backend tách collection riêng)
// ============================================================

export type PaymentMethod = "CreditCard" | "BankTransfer" | "Cash" | "MoMo" | "ZaloPay";
export type PaymentResultStatus = "Success" | "Failed" | "Pending";

export interface MoMoPaymentSession {
  paymentId: string;
  bookingId: string;
  orderId: string;
  requestId: string;
  amount: number;
  status: PaymentResultStatus;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  transId?: string;
  resultCode?: number | null;
  message?: string;
}

export interface ZaloPayPaymentSession {
  paymentId: string;
  bookingId: string;
  appTransId: string;
  amount: number;
  status: PaymentResultStatus;
  zpTransToken?: string;
  orderUrl?: string;
  qrCode?: string;
  transId?: string;
  returnCode?: number | null;
  message?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  status: PaymentResultStatus;
}
