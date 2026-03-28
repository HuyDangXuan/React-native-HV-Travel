export const ONBOARDING_STORAGE_KEY = "has_seen_onboarding";
export const ONBOARDING_VERSION = 2;

export function getOnboardingStorageValue(version = ONBOARDING_VERSION) {
  return `v${version}`;
}

export function hasSeenCurrentOnboarding(
  storedValue: string | null | undefined,
  version = ONBOARDING_VERSION
) {
  return storedValue === getOnboardingStorageValue(version);
}
