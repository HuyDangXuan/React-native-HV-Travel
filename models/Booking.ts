// ============================================================
// Booking Model — Khớp với ASP.NET Backend entity "Booking"
// ============================================================

export interface TourSnapshot {
  code?: string;
  name: string;
  startDate: string;   // ISO DateTime
  duration: string;    // "3 Days 2 Nights"
}

export interface Passenger {
  fullName: string;
  birthDate?: string;
  type: "Adult" | "Child" | "Infant";
  gender?: string;
  passportNumber?: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

export interface BookingHistoryLog {
  action: string;
  timestamp: string;
  user: string;
  note?: string;
}

export type BookingStatus =
  | "Pending"
  | "Paid"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "Refunded";

export type PaymentStatus = "Unpaid" | "Partial" | "Full" | "Refunded";

export interface Booking {
  id: string;
  bookingCode: string;
  tourId: string;
  tourSnapshot?: TourSnapshot;
  customerId: string;
  bookingDate: string;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  participantsCount: number;
  passengers: Passenger[];
  contactInfo?: ContactInfo;
  notes?: string;
  historyLog?: BookingHistoryLog[];
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
