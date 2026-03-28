/**
 * Utility to safely extract a number from various formats, 
 * especially MongoDB Decimal128 (returned as { $numberDecimal: "string" } in .lean() mode)
 */
export const extractNumber = (val: any): number => {
  if (typeof val === "number") return val;
  if (!val) return 0;

  // Handle MongoDB Decimal128 object
  if (typeof val === "object" && val.$numberDecimal) {
    return parseFloat(val.$numberDecimal) || 0;
  }

  // Handle string
  if (typeof val === "string") {
    return parseFloat(val) || 0;
  }

  return 0;
};
