# Booking/Payment I18n And Tour Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hoàn tất i18n cho toàn bộ flow booking/payment và sửa viewer ảnh ở màn chi tiết tour để hero image và overview gallery dùng chung một full-screen viewer hoạt động đúng.

**Architecture:** Giữ nguyên business flow hiện có, chỉ thay text hardcode bằng key i18n, chuẩn hóa format locale runtime, và nối `OverviewTab` vào viewer dùng chung của `TourDetail`. Các thay đổi gallery được gom tại `TourDetail` để không tạo thêm viewer riêng ở tab con.

**Tech Stack:** React Native, React Navigation, Expo, TypeScript, `useI18n`, `useAppTheme`, `expo-status-bar`, Jest, targeted TypeScript compile.

---

### Task 1: Tour Gallery Viewer Wiring

**Files:**
- Modify: `screens/Main/Home/Details/TourDetail.tsx`
- Modify: `screens/Main/Home/Details/TourDetailTabs/OverviewTab.tsx`

- [ ] Add `onOpenGallery(index)` prop to `OverviewTab` and make gallery thumbnails clickable.
- [ ] Make `OverviewTab` render `Pressable` thumbnails and pass the tapped index back to `TourDetail`.
- [ ] In `TourDetail`, wire hero tap to `openGallery(0)` and overview thumbnails to `openGallery(index)`.
- [ ] Adjust gallery modal header spacing so the close button aligns with the detail back-button row/inset.
- [ ] Guard empty gallery and single-image cases without opening a broken viewer.

### Task 2: Locale Keys For Booking/Payment

**Files:**
- Modify: `i18n/locales/vi.ts`
- Modify: `i18n/locales/en.ts`

- [ ] Add missing `paymentMethod.*` keys for payment selection screen and modal content.
- [ ] Add missing `paymentFlow.*` keys for `MoMo`, `VNPay`, `ZaloPay`, `BankTransfer`, and `Cash`.
- [ ] Add any missing `paymentResult.*` keys still relied on by success/failed screens.
- [ ] Keep key grouping consistent with the spec to avoid mixing method-flow strings into `booking.*`.

### Task 3: Payment Method Screen I18n

**Files:**
- Modify: `screens/Main/Home/Payment/PaymentMethodScreen.tsx`

- [ ] Replace hardcoded titles, descriptions, modal text, button labels, and error messages with `t(...)`.
- [ ] Replace fixed locale currency formatting with runtime locale-aware formatting.
- [ ] Preserve existing booking creation flow and method navigation.

### Task 4: Payment Flow Screens I18n

**Files:**
- Modify: `screens/Main/Home/Payment/Method/MoMoScreen.tsx`
- Modify: `screens/Main/Home/Payment/Method/VNPayScreen.tsx`
- Modify: `screens/Main/Home/Payment/Method/ZaloPayScreen.tsx`
- Modify: `screens/Main/Home/Payment/Method/BankTransferScreen.tsx`
- Modify: `screens/Main/Home/Payment/Method/CashPaymentScreen.tsx`

- [ ] Replace hardcoded text, headings, instructions, notes, button labels, and failure/success navigation copy with `t(...)`.
- [ ] Use locale-aware date/time and currency formatting in each screen.
- [ ] Keep the existing method-specific flows unchanged other than text/formatting cleanup.

### Task 5: Payment Result Screen Final Rà Soát

**Files:**
- Modify: `screens/Main/Home/Payment/Method/PaymentResults/PaymentSuccessScreen.tsx`
- Modify: `screens/Main/Home/Payment/Method/PaymentResults/PaymentFailedScreen.tsx`

- [ ] Verify result screens consume only locale keys and runtime locale formatting.
- [ ] Fill any remaining missing locale keys and remove leftover fallback text that is still hardcoded.

### Task 6: Verification

**Files:**
- Test: `tests/tour-detail-i18n.test.cjs`
- Test: `tests/chatbot-ui.test.cjs`

- [ ] Run `npm.cmd run build:test`.
- [ ] Run targeted TypeScript compile for `TourDetail + Booking + Payment`.
- [ ] Manually smoke check hero/gallery open index behavior and booking/payment text in `vi/en`.
- [ ] Note any residual gaps that are blocked by current Jest config or Expo runtime only.
