const {
  buildTourGalleryImages,
  clampGalleryIndex,
  getTourDetailDisplayState,
} = require("../.test-dist/utils/tourDetail");

describe("tour detail helpers", () => {
  test("returns filtered tour gallery images", () => {
    expect(buildTourGalleryImages(["a.jpg", "", "b.jpg"])).toEqual(["a.jpg", "b.jpg"]);
  });

  test("returns fallback image when gallery is empty", () => {
    expect(buildTourGalleryImages([])).toHaveLength(1);
    expect(buildTourGalleryImages(null)).toHaveLength(1);
  });

  test("clamps gallery index into safe bounds", () => {
    expect(clampGalleryIndex(-1, 3)).toBe(0);
    expect(clampGalleryIndex(10, 3)).toBe(2);
    expect(clampGalleryIndex(1, 3)).toBe(1);
  });

  test("uses content skeleton instead of blocking overlay on first detail load", () => {
    expect(
      getTourDetailDisplayState({
        isLoading: true,
        tour: null,
      })
    ).toEqual({
      showContentSkeleton: true,
      showBlockingOverlay: false,
      hasTour: false,
    });
  });
});
