// ============================================================
// Promotion Model — Khớp với ASP.NET Backend entity "Promotion"
// ============================================================

export interface Promotion {
  id: string;
  code: string;               // VD: "WELCOME2024"
  discountPercentage: number;
  description?: string;
  validFrom: string;           // ISO DateTime
  validTo: string;             // ISO DateTime
  isActive: boolean;
}
