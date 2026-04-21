# Favourite Home Tour UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Favourite screen use the same tour card and filter UI as the Home screen.

**Architecture:** Extract the Home tour card, category bar, and filter bottom sheet into reusable components under `components/tours`. Favourite maps favourite API data into the same UI contract and reuses the shared `utils/tourSearch` filter helpers.

**Tech Stack:** React Native, Expo, TypeScript, Jest, existing theme/i18n contexts, `@ptomasroos/react-native-multi-slider`.

---

### Task 1: Add Regression Coverage

- [x] Add a regression test for reading duration days from tour data.
- [x] Confirm the test fails before adding `getTourSearchDurationDays`.
- [x] Add the helper and confirm the focused test passes.

### Task 2: Extract Shared Tour UI

- [x] Create `components/tours/TourCard.tsx`.
- [x] Create `components/tours/TourCategoryBar.tsx`.
- [x] Create `components/tours/TourFilterSheet.tsx`.
- [x] Create `components/tours/tourUiTypes.ts`.

### Task 3: Wire Favourite To Shared Home UI

- [x] Map favourites to the shared card contract, including `durationDays`.
- [x] Use Home-style category chips under the Favourite header.
- [x] Use Home-style filter button and bottom sheet.
- [x] Use Home-style two-column card grid.
- [x] Keep Favourite-specific heart behavior: pressing the heart removes the tour.

### Task 4: Verify

- [x] Run `npm run test:unit -- --runTestsByPath tests/tour-search.test.cjs`.
- [x] Run `npm run build:test`.
- [x] Run `npx tsc --noEmit` and record unrelated existing failures outside this change.
