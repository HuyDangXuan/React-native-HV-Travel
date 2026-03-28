// ============================================================
// Review Model — Khớp với ASP.NET Backend entity "Review"
// Collection riêng (không embedded trong Tour)
// ============================================================

export interface Review {
  id: string;
  tourId: string;
  customerId: string;    // Ref tới Customer (tên fetch qua populate)
  rating: number;        // 1-5
  comment?: string;
  createdAt?: string;
  isApproved?: boolean;  // Kiểm duyệt bởi admin
}
