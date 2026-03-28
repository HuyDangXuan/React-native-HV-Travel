// ============================================================
// Tour Model — Khớp với ASP.NET Backend entity "Tour"
// ============================================================

export interface Destination {
  city: string;
  country?: string;
  region?: "North" | "Central" | "South";
}

export interface TourPrice {
  adult: number;
  child: number;       // Backend dùng "child" (không phải "children")
  infant: number;      // Backend dùng "infant" (không phải "baby")
  currency?: string;   // Default "VND"
  discount?: number;   // % giảm giá
}

export interface TourDuration {
  days: number;
  nights: number;
  text: string;        // VD: "3 Days 2 Nights"
}

export interface ScheduleItem {
  day: number;
  title: string;
  description: string;
  activities: string[]; // Mảng string thuần
}

export interface Tour {
  id: string;
  code?: string;
  name: string;
  description: string;
  shortDescription?: string;
  category: string;              // String trực tiếp (Adventure, Culture, Food, Nature, Luxury)
  destination?: Destination;
  images: string[];              // images[0] = thumbnail
  price: TourPrice;
  duration: TourDuration;
  startDates: string[];          // Mảng nhiều ngày ISO
  schedule: ScheduleItem[];
  generatedInclusions?: string[];
  generatedExclusions?: string[];
  maxParticipants: number;
  currentParticipants: number;
  rating: number;
  reviewCount: number;
  reviews?: import("./Review").Review[];
  status?: "Active" | "Inactive" | "SoldOut" | "ComingSoon";
  createdAt?: string;
  updatedAt?: string;
}
