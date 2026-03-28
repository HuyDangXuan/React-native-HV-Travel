// ============================================================
// Customer Model — Thay thế User model cũ
// Khớp với ASP.NET Backend entity "Customer"
// ============================================================

export interface Address {
  street?: string;
  city?: string;
  country?: string;
}

export interface CustomerStats {
  totalSpending?: number;   // Computed server-side (BsonIgnore)
  totalOrders?: number;     // Computed server-side (BsonIgnore)
  loyaltyPoints: number;
  lastActivity: string;     // ISO DateTime
}

export interface Customer {
  id: string;
  customerCode?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  address?: Address;
  notes?: string;
  segment?: "VIP" | "New" | "Standard" | "ChurnRisk" | "Inactive";
  status?: "Active" | "Banned";
  stats?: CustomerStats;
  tags?: string[];
  emailVerified?: boolean;
  phoneVerified?: boolean;
  tokenVersion?: number;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
}
