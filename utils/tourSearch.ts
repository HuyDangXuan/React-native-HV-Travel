export type TourSearchSortOption = "popular" | "price_asc" | "price_desc" | "rating";
export type TourSearchDurationOption = "all" | "1" | "2_3" | "4_7" | "7_plus";

export type TourSearchFilters = {
  sortBy: TourSearchSortOption;
  minPrice: number;
  maxPrice: number;
  duration: TourSearchDurationOption;
  minRating: number;
};

export type TourSearchPriceBounds = {
  minAvailablePrice: number;
  maxAvailablePrice: number;
  sliderMaxPrice: number;
  step: number;
  minGap: number;
};

export type TourSearchCard = {
  id: string;
  name: string;
  rating?: number;
  displayPrice: number;
  category: string;
  durationDays: number;
  destinationCity?: string;
  destinationCountry?: string;
  discountPercent?: number;
};

const FALLBACK_PRICE_MAX = 5000000;

const roundUpToStep = (value: number, step: number) => Math.ceil(value / step) * step;

const roundUpPriceCeiling = (value: number) => {
  if (value <= 0) return FALLBACK_PRICE_MAX;
  if (value < 5000000) return roundUpToStep(value, 500000);
  if (value <= 20000000) return roundUpToStep(value, 1000000);
  return roundUpToStep(value, 5000000);
};

const getPriceStep = (maxPrice: number) => {
  if (maxPrice < 5000000) return 50000;
  if (maxPrice <= 20000000) return 100000;
  return 500000;
};

const matchesDuration = (days: number, option: TourSearchDurationOption) => {
  switch (option) {
    case "1":
      return days <= 1;
    case "2_3":
      return days >= 2 && days <= 3;
    case "4_7":
      return days >= 4 && days <= 7;
    case "7_plus":
      return days >= 7;
    default:
      return true;
  }
};

export const getTourSearchPriceBounds = (
  list: TourSearchCard[],
  requestedMaxPrice?: number
): TourSearchPriceBounds => {
  const prices = list
    .map((tour) => Number(tour.displayPrice))
    .filter((price) => Number.isFinite(price) && price >= 0);

  if (!prices.length) {
    const sliderMaxPrice = roundUpPriceCeiling(Math.max(requestedMaxPrice ?? 0, FALLBACK_PRICE_MAX));
    const step = getPriceStep(sliderMaxPrice);
    return {
      minAvailablePrice: 0,
      maxAvailablePrice: sliderMaxPrice,
      sliderMaxPrice,
      step,
      minGap: step,
    };
  }

  const minAvailablePrice = Math.min(...prices);
  const maxAvailablePrice = Math.max(...prices);
  const ceilingSeed = Math.max(maxAvailablePrice, requestedMaxPrice ?? 0, minAvailablePrice);
  const sliderMaxPrice = Math.max(roundUpPriceCeiling(ceilingSeed), minAvailablePrice);
  const step = getPriceStep(sliderMaxPrice);

  return {
    minAvailablePrice,
    maxAvailablePrice,
    sliderMaxPrice,
    step,
    minGap: step,
  };
};

export const createDefaultTourSearchFilters = (bounds: TourSearchPriceBounds): TourSearchFilters => ({
  sortBy: "popular",
  minPrice: bounds.minAvailablePrice,
  maxPrice: bounds.sliderMaxPrice,
  duration: "all",
  minRating: 0,
});

export const normalizeTourSearchPriceInput = (rawValue: string) => {
  const numericValue = rawValue.replace(/[^\d]/g, "");
  return Math.max(0, Number(numericValue || 0));
};

export const normalizeTourSearchFilters = (
  value: TourSearchFilters,
  bounds: TourSearchPriceBounds
): TourSearchFilters => {
  const safeMin = Math.max(bounds.minAvailablePrice, Math.min(value.minPrice, value.maxPrice));
  const safeMax = Math.min(bounds.sliderMaxPrice, Math.max(value.minPrice, value.maxPrice));

  if (safeMax - safeMin < bounds.minGap) {
    const nextMax = Math.min(bounds.sliderMaxPrice, safeMin + bounds.minGap);
    const nextMin = Math.max(bounds.minAvailablePrice, nextMax - bounds.minGap);
    return {
      ...value,
      minPrice: nextMin,
      maxPrice: nextMax,
    };
  }

  return {
    ...value,
    minPrice: safeMin,
    maxPrice: safeMax,
  };
};

export const formatCompactSearchPrice = (price: number) => {
  if (price >= 1000000000) {
    const value = price / 1000000000;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}B`;
  }
  if (price >= 1000000) {
    const value = price / 1000000;
    return `${Number.isInteger(value) ? value : value.toFixed(1)}M`;
  }
  if (price >= 1000) return `${Math.round(price / 1000)}K`;
  return String(price);
};

export const applyTourSearchFilters = <T extends TourSearchCard>(
  list: T[],
  search: string,
  selectedCategory: string | null,
  filters: TourSearchFilters
) => {
  let result = list;

  if (selectedCategory) {
    result = result.filter((tour) => tour.category === selectedCategory);
  }

  const key = search.trim().toLowerCase();
  if (key) {
    result = result.filter((tour) =>
      [tour.name, tour.destinationCity, tour.destinationCountry, tour.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(key))
    );
  }

  result = result.filter((tour) => {
    const rating = Number(tour.rating ?? 0);
    return (
      tour.displayPrice >= filters.minPrice &&
      tour.displayPrice <= filters.maxPrice &&
      matchesDuration(tour.durationDays, filters.duration) &&
      rating >= filters.minRating
    );
  });

  const sorted = [...result];
  switch (filters.sortBy) {
    case "price_asc":
      sorted.sort((a, b) => a.displayPrice - b.displayPrice);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.displayPrice - a.displayPrice);
      break;
    case "rating":
    case "popular":
    default:
      sorted.sort((a, b) => {
        const ratingDiff = Number(b.rating ?? 0) - Number(a.rating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        return Number(b.discountPercent ?? 0) - Number(a.discountPercent ?? 0);
      });
      break;
  }

  return sorted;
};

export const buildSuggestedCategories = <T extends TourSearchCard>(list: T[], limit = 6) => {
  return Array.from(new Set(list.map((tour) => tour.category).filter(Boolean))).slice(0, limit);
};

export const buildSuggestedTours = <T extends TourSearchCard>(list: T[], limit = 4): T[] => {
  return [...list]
    .sort((a, b) => {
      const ratingDiff = Number(b.rating ?? 0) - Number(a.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      const discountDiff = Number(b.discountPercent ?? 0) - Number(a.discountPercent ?? 0);
      if (discountDiff !== 0) return discountDiff;
      return a.displayPrice - b.displayPrice;
    })
    .slice(0, limit);
};

export const hasActiveTourSearchFilters = (
  filters: TourSearchFilters,
  bounds: TourSearchPriceBounds,
  selectedCategory: string | null
) => {
  const defaults = createDefaultTourSearchFilters(bounds);

  return (
    Boolean(selectedCategory) ||
    filters.sortBy !== defaults.sortBy ||
    filters.minPrice !== defaults.minPrice ||
    filters.maxPrice !== defaults.maxPrice ||
    filters.duration !== defaults.duration ||
    filters.minRating !== defaults.minRating
  );
};

export const shouldShowTourSearchSuggestions = (search: string, hasActiveFilters: boolean) => {
  return search.trim().length === 0 && !hasActiveFilters;
};
