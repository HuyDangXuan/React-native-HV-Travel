const {
  shouldTriggerOverlayRefresh,
} = require("../.test-dist/utils/pullToRefresh");

describe("overlay pull-to-refresh utilities", () => {
  test("triggers refresh when pulled past threshold and not busy", () => {
    expect(
      shouldTriggerOverlayRefresh({
        minOffsetY: -92,
        threshold: 72,
        isBusy: false,
      })
    ).toBe(true);
  });

  test("does not trigger when pull distance is below threshold", () => {
    expect(
      shouldTriggerOverlayRefresh({
        minOffsetY: -40,
        threshold: 72,
        isBusy: false,
      })
    ).toBe(false);
  });

  test("does not trigger while a refresh is already in progress", () => {
    expect(
      shouldTriggerOverlayRefresh({
        minOffsetY: -120,
        threshold: 72,
        isBusy: true,
      })
    ).toBe(false);
  });
});
