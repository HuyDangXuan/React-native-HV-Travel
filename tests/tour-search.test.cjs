const {
  applyTourSearchFilters,
  buildSuggestedCategories,
  buildSuggestedTours,
  createDefaultTourSearchFilters,
  getTourSearchPriceBounds,
  hasActiveTourSearchFilters,
  shouldShowTourSearchSuggestions,
} = require("../.test-dist/utils/tourSearch");

const sampleTours = [
  {
    id: "1",
    name: "Hạ Long Premium",
    rating: 4.8,
    displayPrice: 3200000,
    category: "Biển",
    durationDays: 3,
    destinationCity: "Hạ Long",
    destinationCountry: "Việt Nam",
    discountPercent: 10,
  },
  {
    id: "2",
    name: "Sapa Adventure",
    rating: 4.6,
    displayPrice: 2800000,
    category: "Núi",
    durationDays: 2,
    destinationCity: "Sa Pa",
    destinationCountry: "Việt Nam",
    discountPercent: 0,
  },
  {
    id: "3",
    name: "Huế Heritage",
    rating: 4.9,
    displayPrice: 4100000,
    category: "Văn hóa",
    durationDays: 4,
    destinationCity: "Huế",
    destinationCountry: "Việt Nam",
    discountPercent: 15,
  },
];

describe("tour search helpers", () => {
  test("shows suggestions only when query is empty and no filters are active", () => {
    expect(shouldShowTourSearchSuggestions("", false)).toBe(true);
    expect(shouldShowTourSearchSuggestions("ha long", false)).toBe(false);
    expect(shouldShowTourSearchSuggestions("", true)).toBe(false);
  });

  test("builds unique suggested categories from tours", () => {
    expect(buildSuggestedCategories(sampleTours, 2)).toEqual(["Biển", "Núi"]);
  });

  test("builds suggested tours by rating then discount", () => {
    expect(buildSuggestedTours(sampleTours, 2).map((tour) => tour.id)).toEqual(["3", "1"]);
  });

  test("detects active filters away from defaults", () => {
    const bounds = getTourSearchPriceBounds(sampleTours);
    const defaults = createDefaultTourSearchFilters(bounds);

    expect(hasActiveTourSearchFilters(defaults, bounds, null)).toBe(false);
    expect(
      hasActiveTourSearchFilters(
        {
          ...defaults,
          minRating: 4,
        },
        bounds,
        null
      )
    ).toBe(true);
    expect(hasActiveTourSearchFilters(defaults, bounds, "Biển")).toBe(true);
  });

  test("filters tours by keyword, category, duration, rating, and sort order", () => {
    const bounds = getTourSearchPriceBounds(sampleTours);
    const defaults = createDefaultTourSearchFilters(bounds);

    expect(
      applyTourSearchFilters(sampleTours, "huế", null, {
        ...defaults,
        sortBy: "rating",
      }).map((tour) => tour.id)
    ).toEqual(["3"]);

    expect(
      applyTourSearchFilters(sampleTours, "", "Biển", {
        ...defaults,
        duration: "2_3",
      }).map((tour) => tour.id)
    ).toEqual(["1"]);

    expect(
      applyTourSearchFilters(sampleTours, "", null, {
        ...defaults,
        minRating: 4.7,
        sortBy: "price_desc",
      }).map((tour) => tour.id)
    ).toEqual(["3", "1"]);
  });
});
