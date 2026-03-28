// ============================================================
// Payment Model — Khớp với ASP.NET Backend entity "Payment"
// Tách riêng khỏi Booking (backend tách collection riêng)
// ============================================================

export type PaymentMethod = "CreditCard" | "BankTransfer" | "Cash";
export type PaymentResultStatus = "Success" | "Failed" | "Pending";

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  status: PaymentResultStatus;
}
