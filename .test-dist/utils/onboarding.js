"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONBOARDING_VERSION = exports.ONBOARDING_STORAGE_KEY = void 0;
exports.getOnboardingStorageValue = getOnboardingStorageValue;
exports.hasSeenCurrentOnboarding = hasSeenCurrentOnboarding;
exports.ONBOARDING_STORAGE_KEY = "has_seen_onboarding";
exports.ONBOARDING_VERSION = 2;
function getOnboardingStorageValue(version = exports.ONBOARDING_VERSION) {
    return `v${version}`;
}
function hasSeenCurrentOnboarding(storedValue, version = exports.ONBOARDING_VERSION) {
    return storedValue === getOnboardingStorageValue(version);
}
