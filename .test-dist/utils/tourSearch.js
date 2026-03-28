"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldShowTourSearchSuggestions = exports.hasActiveTourSearchFilters = exports.buildSuggestedTours = exports.buildSuggestedCategories = exports.applyTourSearchFilters = exports.formatCompactSearchPrice = exports.normalizeTourSearchFilters = exports.normalizeTourSearchPriceInput = exports.createDefaultTourSearchFilters = exports.getTourSearchPriceBounds = void 0;
const FALLBACK_PRICE_MAX = 5000000;
const roundUpToStep = (value, step) => Math.ceil(value / step) * step;
const roundUpPriceCeiling = (value) => {
    if (value <= 0)
        return FALLBACK_PRICE_MAX;
    if (value < 5000000)
        return roundUpToStep(value, 500000);
    if (value <= 20000000)
        return roundUpToStep(value, 1000000);
    return roundUpToStep(value, 5000000);
};
const getPriceStep = (maxPrice) => {
    if (maxPrice < 5000000)
        return 50000;
    if (maxPrice <= 20000000)
        return 100000;
    return 500000;
};
const matchesDuration = (days, option) => {
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
const getTourSearchPriceBounds = (list, requestedMaxPrice) => {
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
exports.getTourSearchPriceBounds = getTourSearchPriceBounds;
const createDefaultTourSearchFilters = (bounds) => ({
    sortBy: "popular",
    minPrice: bounds.minAvailablePrice,
    maxPrice: bounds.sliderMaxPrice,
    duration: "all",
    minRating: 0,
});
exports.createDefaultTourSearchFilters = createDefaultTourSearchFilters;
const normalizeTourSearchPriceInput = (rawValue) => {
    const numericValue = rawValue.replace(/[^\d]/g, "");
    return Math.max(0, Number(numericValue || 0));
};
exports.normalizeTourSearchPriceInput = normalizeTourSearchPriceInput;
const normalizeTourSearchFilters = (value, bounds) => {
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
exports.normalizeTourSearchFilters = normalizeTourSearchFilters;
const formatCompactSearchPrice = (price) => {
    if (price >= 1000000000) {
        const value = price / 1000000000;
        return `${Number.isInteger(value) ? value : value.toFixed(1)}B`;
    }
    if (price >= 1000000) {
        const value = price / 1000000;
        return `${Number.isInteger(value) ? value : value.toFixed(1)}M`;
    }
    if (price >= 1000)
        return `${Math.round(price / 1000)}K`;
    return String(price);
};
exports.formatCompactSearchPrice = formatCompactSearchPrice;
const applyTourSearchFilters = (list, search, selectedCategory, filters) => {
    let result = list;
    if (selectedCategory) {
        result = result.filter((tour) => tour.category === selectedCategory);
    }
    const key = search.trim().toLowerCase();
    if (key) {
        result = result.filter((tour) => [tour.name, tour.destinationCity, tour.destinationCountry, tour.category]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(key)));
    }
    result = result.filter((tour) => {
        const rating = Number(tour.rating ?? 0);
        return (tour.displayPrice >= filters.minPrice &&
            tour.displayPrice <= filters.maxPrice &&
            matchesDuration(tour.durationDays, filters.duration) &&
            rating >= filters.minRating);
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
                if (ratingDiff !== 0)
                    return ratingDiff;
                return Number(b.discountPercent ?? 0) - Number(a.discountPercent ?? 0);
            });
            break;
    }
    return sorted;
};
exports.applyTourSearchFilters = applyTourSearchFilters;
const buildSuggestedCategories = (list, limit = 6) => {
    return Array.from(new Set(list.map((tour) => tour.category).filter(Boolean))).slice(0, limit);
};
exports.buildSuggestedCategories = buildSuggestedCategories;
const buildSuggestedTours = (list, limit = 4) => {
    return [...list]
        .sort((a, b) => {
        const ratingDiff = Number(b.rating ?? 0) - Number(a.rating ?? 0);
        if (ratingDiff !== 0)
            return ratingDiff;
        const discountDiff = Number(b.discountPercent ?? 0) - Number(a.discountPercent ?? 0);
        if (discountDiff !== 0)
            return discountDiff;
        return a.displayPrice - b.displayPrice;
    })
        .slice(0, limit);
};
exports.buildSuggestedTours = buildSuggestedTours;
const hasActiveTourSearchFilters = (filters, bounds, selectedCategory) => {
    const defaults = (0, exports.createDefaultTourSearchFilters)(bounds);
    return (Boolean(selectedCategory) ||
        filters.sortBy !== defaults.sortBy ||
        filters.minPrice !== defaults.minPrice ||
        filters.maxPrice !== defaults.maxPrice ||
        filters.duration !== defaults.duration ||
        filters.minRating !== defaults.minRating);
};
exports.hasActiveTourSearchFilters = hasActiveTourSearchFilters;
const shouldShowTourSearchSuggestions = (search, hasActiveFilters) => {
    return search.trim().length === 0 && !hasActiveFilters;
};
exports.shouldShowTourSearchSuggestions = shouldShowTourSearchSuggestions;
