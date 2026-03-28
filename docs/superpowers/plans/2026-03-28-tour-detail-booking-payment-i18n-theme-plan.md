# Tour Detail, Booking, Payment I18n And Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đồng bộ `i18n` và `runtime theme` cho toàn bộ flow `Tour detail -> Booking -> Payment -> Result` mà không đổi logic nghiệp vụ hiện có.

**Architecture:** Giữ nguyên navigation, service, payload booking/payment và chỉ thay lớp presentation. Mỗi màn sẽ chuyển sang `useI18n()` cho text, `useAppTheme()` và `useThemeMode()` cho màu/status bar; các task màn hình chỉ ghi ra danh sách key cần thêm, còn một task tích hợp cuối cùng mới sở hữu `i18n/locales/vi.ts` và `i18n/locales/en.ts` để tránh conflict.

**Tech Stack:** React Native, TypeScript, Expo StatusBar, custom `I18nContext`, custom `ThemeModeContext`, Jest, `tsc`.

---

## File Map

### Locale ownership

- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\vi.ts`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\en.ts`

Responsibility:

- Thêm key `tourDetail.*`, `booking.*`, `payment.*`, `paymentMethod.*`, `paymentResult.*`
- Chỉ một task sở hữu hai file này để tránh conflict

### Tour detail cluster

- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetail.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetailTabs\OverviewTab.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetailTabs\ItineraryTab.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetailTabs\ReviewTab.tsx`

Responsibility:

- Chuyển text hardcode của tour detail sang `tourDetail.*`
- Dùng runtime theme cho hero, tabs, bottom CTA, section content
- Chuẩn hóa `StatusBar`

### Booking cluster

- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Booking\BookingScreen.tsx`

Responsibility:

- Chuyển toàn bộ text form/summary/validation/CTA sang `booking.*`
- Dùng runtime theme cho form, section card, chips, footer CTA
- Giữ nguyên submit logic

### Payment cluster

- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\PaymentMethodScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\MoMoScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\VNPayScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\ZaloPayScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\BankTransferScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\CashPaymentScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\PaymentResults\PaymentSuccessScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\PaymentResults\PaymentFailedScreen.tsx`

Responsibility:

- `PaymentMethodScreen` dùng `payment.*`
- Các màn method riêng dùng `paymentMethod.*`
- Kết quả thanh toán dùng `paymentResult.*`
- Đồng bộ `StatusBar`, card, button, instruction text, error text

### Verification

- Test/Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tsconfig.test.json`
- Test/Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tests\tour-detail.test.cjs`
- Test/Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tests\booking-status.test.cjs`

Responsibility:

- Giữ compile sạch
- Chạy focused tests gần nhất với flow đang sửa
- Kiểm tra locale switch, overflow, và dark mode
## Task 1: Migrate Tour Detail Root Screen

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetail.tsx`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tsconfig.test.json`

- [ ] **Step 1: Identify visible text and theme leaks**

List all root-screen strings and static color blocks:
- header title
- tab labels if declared in root
- booking CTA
- favorite messages
- date/price/label text
- hardcoded light backgrounds

- [ ] **Step 2: Replace root-screen text with `t("tourDetail.*")`**

Implement:
- `const { t } = useI18n()`
- map all root labels to locale keys
- replace generic system errors with locale keys instead of raw fallback strings
- record every new locale key in a temporary checklist comment or task note for the locale-owner task

- [ ] **Step 3: Audit error handling on the root screen**

Classify every message into one of:
- locale-owned system error
- backend domain-specific text that should stay raw
- user/business data that is not translated

Expected result:
- no raw backend/system fallback leaks for common failures
- `MessageBoxService` behavior unchanged

- [ ] **Step 4: Replace static theme usage with runtime theme**

Implement:
- `const theme = useAppTheme()`
- `const { themeName } = useThemeMode()`
- `StatusBar` based on `themeName`
- background/text/divider/CTA use runtime tokens

- [ ] **Step 5: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add screens/Main/Home/Details/TourDetail.tsx
git commit -m "feat: localize and theme tour detail root screen"
```

## Task 2: Migrate Tour Detail Tabs

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetailTabs\OverviewTab.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetailTabs\ItineraryTab.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetailTabs\ReviewTab.tsx`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tsconfig.test.json`

- [ ] **Step 1: Migrate `OverviewTab.tsx`**

Change:
- overview section labels
- policy/highlight text
- static surfaces/chips/dividers

- [ ] **Step 2: Migrate `ItineraryTab.tsx`**

Change:
- day labels
- empty/fallback text
- timeline/surface colors

- [ ] **Step 3: Migrate `ReviewTab.tsx`**

Change:
- rating labels
- review empty text
- CTA/review stat labels
- static card/background colors

- [ ] **Step 4: Record all new locale keys for the locale-owner task**

Expected output:
- a flat list of every `tourDetail.*` key introduced by the three tabs
- note any raw backend/domain text intentionally preserved

- [ ] **Step 5: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add screens/Main/Home/Details/TourDetailTabs/OverviewTab.tsx screens/Main/Home/Details/TourDetailTabs/ItineraryTab.tsx screens/Main/Home/Details/TourDetailTabs/ReviewTab.tsx
git commit -m "feat: localize and theme tour detail tabs"
```

## Task 3: Migrate Booking Screen

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Booking\BookingScreen.tsx`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tsconfig.test.json`

- [ ] **Step 1: Write down every booking-domain UI string before editing**

Include:
- title/subtitle
- participant labels
- form placeholders
- validation text
- summary labels
- price breakdown
- CTA and generic booking failures

- [ ] **Step 2: Replace text with `booking.*` keys**

Rules:
- validation and submit errors use locale keys
- dynamic values use interpolation
- leave backend domain-specific IDs or booking codes untouched

- [ ] **Step 3: Audit booking error handling explicitly**

Check:
- network failure
- timeout
- booking-create failure
- auth/session failure

Expected result:
- all common system failures map to locale keys
- only domain-specific backend text remains raw when intentional
- newly needed keys are recorded for locale integration

- [ ] **Step 4: Apply runtime theme**

Replace:
- static background/sheet colors
- text colors
- chip colors
- CTA/footer surface
- status bar

- [ ] **Step 5: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add screens/Main/Home/Booking/BookingScreen.tsx
git commit -m "feat: localize and theme booking screen"
```

## Task 4: Migrate Payment Selection Screen

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\PaymentMethodScreen.tsx`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tsconfig.test.json`

- [ ] **Step 1: Convert screen text to `payment.*`**

Include:
- title/subtitle
- order summary labels
- total amount labels
- method selection copy
- generic failure/retry text

- [ ] **Step 2: Audit payment-selection error handling**

Check:
- load failure
- create-payment failure
- invalid-session/auth failure

Expected result:
- common system failures use locale keys
- raw backend text is preserved only when domain-specific and intentional
- all required `payment.*` keys are recorded for locale integration

- [ ] **Step 3: Convert visual shell to runtime theme**

Replace:
- page background
- section cards
- summary surface
- selected method states
- primary CTA
- status bar

- [ ] **Step 4: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add screens/Main/Home/Payment/PaymentMethodScreen.tsx
git commit -m "feat: localize and theme payment selection screen"
```

## Task 5: Migrate Payment Method Screens

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\MoMoScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\VNPayScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\ZaloPayScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\BankTransferScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\CashPaymentScreen.tsx`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tsconfig.test.json`

- [ ] **Step 1: Migrate wallet/bank/cash labels to `paymentMethod.*`**

Cover:
- instruction text
- copy/share labels
- processing/loading text
- confirm/cancel buttons
- generic payment failures

- [ ] **Step 2: Audit error handling across all method screens**

Check:
- payment init failure
- polling/verification failure
- network failure
- timeout

Expected result:
- common system failures map to locale keys
- only domain-specific backend text stays raw
- all new `paymentMethod.*` keys are recorded for locale integration

- [ ] **Step 3: Normalize theme across all method screens**

Replace:
- method-specific hardcoded light cards
- borders/dividers
- instruction blocks
- primary and secondary buttons
- status bar

- [ ] **Step 4: Smoke-check consistency across the five method files**

Checklist:
- same runtime theme hooks present
- same raw-error policy
- no static `theme` import left for runtime colors

- [ ] **Step 5: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add screens/Main/Home/Payment/Method/MoMoScreen.tsx screens/Main/Home/Payment/Method/VNPayScreen.tsx screens/Main/Home/Payment/Method/ZaloPayScreen.tsx screens/Main/Home/Payment/Method/BankTransferScreen.tsx screens/Main/Home/Payment/Method/CashPaymentScreen.tsx
git commit -m "feat: localize and theme payment method screens"
```

## Task 6: Migrate Payment Result Screens

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\PaymentResults\PaymentSuccessScreen.tsx`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\PaymentResults\PaymentFailedScreen.tsx`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tsconfig.test.json`

- [ ] **Step 1: Replace text with `paymentResult.*`**

Include:
- success/fail titles
- descriptions
- primary CTA
- secondary CTA
- retry/back/home labels

- [ ] **Step 2: Audit result-screen error and fallback policy**

Check:
- failure descriptions
- retry messages
- fallback navigation labels

Expected result:
- result screens do not leak untranslated system text
- all required `paymentResult.*` keys are recorded for locale integration

- [ ] **Step 3: Replace static color shell with runtime theme**

Replace:
- full-screen background
- icon container surfaces
- result card colors
- CTA/button colors
- status bar

- [ ] **Step 4: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add screens/Main/Home/Payment/Method/PaymentResults/PaymentSuccessScreen.tsx screens/Main/Home/Payment/Method/PaymentResults/PaymentFailedScreen.tsx
git commit -m "feat: localize and theme payment result screens"
```

## Task 7: Integrate Locale Files

**Files:**
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\vi.ts`
- Modify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\en.ts`
- Reference: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\docs\superpowers\specs\2026-03-28-tour-detail-booking-payment-i18n-theme-design.md`

- [ ] **Step 1: Collect recorded keys from Tasks 1-6**

Flatten and de-duplicate:
- `tourDetail.*`
- `booking.*`
- `payment.*`
- `paymentMethod.*`
- `paymentResult.*`

- [ ] **Step 2: Add Vietnamese keys**

Rules:
- include all system-error mappings required by the spec
- keep placeholders aligned with call sites
- do not add unused speculative keys

- [ ] **Step 3: Add English keys**

Rules:
- same shape as Vietnamese
- natural UI wording
- verify long labels likely to appear in CTA and instruction blocks

- [ ] **Step 4: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add i18n/locales/vi.ts i18n/locales/en.ts
git commit -m "feat: integrate locale keys for tour booking payment flow"
```

## Task 8: Integration Verification

**Files:**
- Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\vi.ts`
- Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\i18n\locales\en.ts`
- Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Details\TourDetail.tsx`
- Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Booking\BookingScreen.tsx`
- Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\PaymentMethodScreen.tsx`
- Verify: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\screens\Main\Home\Payment\Method\PaymentResults\PaymentSuccessScreen.tsx`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tests\tour-detail.test.cjs`
- Test: `C:\Users\Admin\Desktop\HV-Travel\react-native hv-travel\tests\booking-status.test.cjs`

- [ ] **Step 1: Run compile**

Run: `.\node_modules\.bin\tsc.cmd -p tsconfig.test.json`
Expected: PASS

- [ ] **Step 2: Run focused Jest suites**

Run: `npm.cmd test -- tour-detail.test.cjs booking-status.test.cjs`
Expected: PASS

- [ ] **Step 3: Manual smoke test in `vi`**

Checklist:
- Tour detail main text correct
- Booking form labels and CTA correct
- Payment method labels correct
- One method screen instructions correct
- Success/failed screens correct

- [ ] **Step 4: Manual smoke test in `en`**

Checklist:
- switch app language to English
- repeat the same flow
- verify no Vietnamese system labels leak in these screens
- verify long English section titles, CTA labels, and payment instructions do not overflow badly

- [ ] **Step 5: Manual dark-mode check**

Checklist:
- iPhone status bar readable
- header background correct
- CTA contrast correct
- cards/sheets not stuck in light mode
- no bright divider mismatch

- [ ] **Step 6: Commit**

```bash
git add screens/Main/Home/Details/TourDetail.tsx screens/Main/Home/Details/TourDetailTabs/OverviewTab.tsx screens/Main/Home/Details/TourDetailTabs/ItineraryTab.tsx screens/Main/Home/Details/TourDetailTabs/ReviewTab.tsx screens/Main/Home/Booking/BookingScreen.tsx screens/Main/Home/Payment/PaymentMethodScreen.tsx screens/Main/Home/Payment/Method/MoMoScreen.tsx screens/Main/Home/Payment/Method/VNPayScreen.tsx screens/Main/Home/Payment/Method/ZaloPayScreen.tsx screens/Main/Home/Payment/Method/BankTransferScreen.tsx screens/Main/Home/Payment/Method/CashPaymentScreen.tsx screens/Main/Home/Payment/Method/PaymentResults/PaymentSuccessScreen.tsx screens/Main/Home/Payment/Method/PaymentResults/PaymentFailedScreen.tsx i18n/locales/vi.ts i18n/locales/en.ts
git commit -m "test: verify localized themed booking payment flow"
```
