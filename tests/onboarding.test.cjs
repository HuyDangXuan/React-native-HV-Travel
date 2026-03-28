describe("onboarding version gate", () => {
  test("treats legacy boolean flag as unseen when onboarding version changes", () => {
    const {
      ONBOARDING_VERSION,
      hasSeenCurrentOnboarding,
    } = require("../.test-dist/utils/onboarding");

    expect(hasSeenCurrentOnboarding(null)).toBe(false);
    expect(hasSeenCurrentOnboarding("true")).toBe(false);
    expect(hasSeenCurrentOnboarding("false")).toBe(false);
    expect(hasSeenCurrentOnboarding("1")).toBe(false);
    expect(hasSeenCurrentOnboarding(`v${ONBOARDING_VERSION - 1}`)).toBe(false);
    expect(hasSeenCurrentOnboarding(`v${ONBOARDING_VERSION}`)).toBe(true);
  });
});
