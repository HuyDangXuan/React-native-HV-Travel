# HV-Travel Mobile App

Ứng dụng di động đặt tour du lịch đa nền tảng được xây dựng bằng React Native, tập trung vào trải nghiệm đặt tour, xác thực an toàn, đa ngôn ngữ và giao diện đồng bộ theo light/dark theme.

A cross-platform travel booking mobile application built with React Native, focused on secure authentication, multilingual UX, consistent theming, and an end-to-end booking and payment experience.

## Overview | Tổng quan

HV-Travel Mobile là client app dành cho người dùng cuối trong hệ sinh thái HV-Travel. Ứng dụng cho phép khám phá tour, xem chi tiết hành trình, lưu yêu thích, đặt tour, chọn phương thức thanh toán, quản lý thiết bị đăng nhập và theo dõi các chuyến đi đã đặt.

HV-Travel Mobile is the customer-facing app in the HV-Travel ecosystem. It enables users to explore tours, view itineraries, save favourites, book tours, choose payment methods, manage logged-in devices, and track their booked trips.

## Business Value | Giá trị sản phẩm

- Rút ngắn luồng đặt tour trên mobile từ khám phá đến thanh toán trong một flow thống nhất.
- Tăng khả năng giữ phiên với cơ chế `access token + refresh token` và hỗ trợ nhiều thiết bị.
- Cải thiện khả năng tiếp cận với `vi/en` runtime switching và hỗ trợ light/dark mode.
- Tăng độ tin cậy giao diện bằng cách đồng bộ hóa UI component, empty state, result screen và header style trên toàn app.

- Streamlines the travel booking journey from discovery to payment in a unified mobile flow.
- Improves session continuity with an `access token + refresh token` model and multi-device support.
- Enhances accessibility with runtime `vi/en` language switching and light/dark theme support.
- Increases UI consistency through shared components, standardized empty states, result screens, and header patterns.

## Key Features | Tính năng nổi bật

### Authentication & Session Management

- Đăng nhập, đăng ký, quên mật khẩu, xác thực OTP, tạo mật khẩu mới.
- Refresh token flow với khả năng khôi phục phiên khi mở lại app.
- Quản lý thiết bị đăng nhập và đăng xuất toàn bộ thiết bị từ tab bảo mật.
- Soft logout để quay về màn đăng nhập nhưng vẫn hỗ trợ đăng nhập nhanh cho tài khoản đã nhớ.

- Login, registration, forgot password, OTP verification, and password reset.
- Refresh token flow with session restoration when reopening the app.
- Logged-in device management and sign-out-all-devices from the security tab.
- Soft logout for returning to the login screen while preserving quick sign-in behavior for remembered accounts.

### Tour Discovery & Booking

- Danh sách tour, tìm kiếm tour, filter, yêu thích và chi tiết tour.
- Gallery ảnh toàn màn hình với điều hướng ảnh theo đúng index người dùng chọn.
- Luồng đặt tour có kiểm tra số lượng khách, ngày khởi hành, thông tin liên hệ và trạng thái booking.
- Màn hình “Chuyến đi đã đặt” hiển thị rõ trạng thái chuyến đi và dữ liệu booking đã chuẩn hóa từ backend.

- Tour listing, search, filters, favourites, and detailed tour pages.
- Full-screen gallery viewer that opens at the exact image index selected by the user.
- Booking flow with guest count validation, selected departure date, contact information, and booking state handling.
- “My Bookings” screen backed by normalized booking data returned from the API.

### Payments & Results

- Chọn phương thức thanh toán: ZaloPay, VNPay, MoMo, chuyển khoản ngân hàng và tiền mặt.
- Màn hình hướng dẫn cho từng phương thức thanh toán.
- Màn hình kết quả thanh toán thành công/thất bại đồng bộ giao diện và theme.

- Payment method selection for ZaloPay, VNPay, MoMo, bank transfer, and cash.
- Dedicated guidance screens for each payment method.
- Consistent themed result screens for payment success and failure.

### Experience & UI

- Hỗ trợ đổi ngôn ngữ `Tiếng Việt / English` ngay trong app.
- Hỗ trợ `System / Light / Dark` mode.
- Chatbot modal theo ngữ cảnh tour, có i18n và runtime theme.
- Status bar trên iPhone đồng bộ với theme hiện tại.

- In-app `Vietnamese / English` language switching.
- `System / Light / Dark` appearance modes.
- Tour-aware chatbot modal with i18n and runtime theme support.
- iPhone status bar synced with the active app theme.

## Technical Highlights | Điểm nhấn kỹ thuật

- **React Native + Expo architecture**
  Ứng dụng dùng Expo làm runtime, React Navigation cho Stack + Bottom Tabs, và cấu trúc module theo màn hình/chức năng.

- **Centralized auth state**
  `AuthContext` là nguồn sự thật duy nhất cho session người dùng. Session được phục hồi từ secure storage và đồng bộ với backend auth flow.

- **Runtime i18n system**
  Ứng dụng có `I18nContext` và từ điển riêng cho `vi/en`, cho phép đổi text runtime mà không cần reload lại mã nguồn.

- **Theme abstraction**
  `ThemeModeContext` tách lớp mode (`system`, `light`, `dark`) khỏi semantic tokens, giúp giao diện đổi theme ổn định trên nhiều màn hình.

- **Reusable UI shell**
  Shared components như `AppHeader`, `ResultScreenLayout`, `ScreenContainer`, `EmptyState` giúp giảm lặp UI và giữ visual consistency.

- **Secure multi-device auth flow**
  Mobile app tương thích với backend auth model có refresh token rotation, multi-device sessions, logout current device, logout all devices, và revoke sau khi đổi/quên mật khẩu.

## Technology Stack | Công nghệ sử dụng

- **Framework:** React Native, Expo
- **Language:** TypeScript
- **Navigation:** React Navigation (Native Stack, Bottom Tabs)
- **Storage:** AsyncStorage, Expo Secure Store
- **UI:** Expo Vector Icons, shared design tokens, custom reusable components
- **Utilities:** Joi, CryptoJS, UUID
- **Testing:** TypeScript compile verification, Jest-based unit tests

## Project Structure | Cấu trúc thư mục

```text
react-native hv-travel/
├─ assets/                # Ảnh tĩnh, animation, icon
├─ components/            # Shared UI components, chatbot, inputs, headers
├─ config/                # API config, theme config
├─ context/               # Auth, i18n, theme mode, user state
├─ data/                  # Static app data (onboarding, mock/static sources)
├─ i18n/                  # Locale dictionaries and translation helpers
├─ screens/               # App screens grouped by feature
├─ services/              # API services, session services, data adapters
├─ tests/                 # Unit tests and feature-focused test cases
├─ utils/                 # Domain helpers and shared utility logic
└─ validators/            # Input validation schemas
```

## Implemented Screens | Các màn hình đã triển khai

- Splash, Onboarding
- Login, Register, Forgot Password, OTP Verification, Create New Password
- Home, Search, Notifications, Favourites, Inbox
- Tour Detail, Overview, Itinerary, Reviews, Gallery
- Booking, Payment Method, Payment Success, Payment Failed
- Profile, My Bookings, Security, Language, Appearance, Help, Terms

## API Integration | Tích hợp backend

Ứng dụng hiện đang gọi API thông qua file [config/api.ts](C:\Users\Admin\Desktop\HV-Travel\react-native%20hv-travel\config\api.ts).  
The app currently consumes API endpoints defined in [config/api.ts](C:\Users\Admin\Desktop\HV-Travel\react-native%20hv-travel\config\api.ts).

Một số nhóm endpoint chính:

- `auth/*`: login, refresh, logout, forgot/reset password, device sessions
- `bookings/*`: tạo booking, lấy danh sách booking, xem chi tiết, hủy booking
- `payments/*`: khởi tạo và theo dõi thanh toán
- `tours/*`: danh sách tour và chi tiết tour
- `notifications/*`, `favourites/*`, `chat/*`, `chatbot/*`

## Getting Started | Chạy dự án

### Prerequisites | Yêu cầu môi trường

- Node.js 18+
- npm
- Expo CLI runtime through project scripts
- Android Studio hoặc Xcode/Expo Go để chạy mobile app

### Install dependencies | Cài đặt thư viện

```bash
npm install
```

### Configure API | Cấu hình API

Cập nhật `base_url` trong [config/api.ts](C:\Users\Admin\Desktop\HV-Travel\react-native%20hv-travel\config\api.ts) theo backend đang chạy trên máy hoặc môi trường deploy.

Update the `base_url` in [config/api.ts](C:\Users\Admin\Desktop\HV-Travel\react-native%20hv-travel\config\api.ts) to match your local backend or deployed environment.

### Run the app | Chạy ứng dụng

```bash
npm start
```

Chạy theo nền tảng:

```bash
npm run android
npm run ios
npm run web
```

## Scripts | Lệnh hữu ích

```bash
npm start
npm run android
npm run ios
npm run web
npm run build:test
npm test
```

## Testing | Kiểm thử

Dự án có compile verification và các test tập trung cho những flow quan trọng như:

- auth session
- login flow
- loading state
- inbox/notifications
- chatbot UI
- tour detail i18n

Run:

```bash
npm run build:test
npm test
```

## Engineering Focus | Điểm mạnh phù hợp đưa vào CV

- Thiết kế và triển khai luồng xác thực mobile với refresh token, session restore và multi-device compatibility.
- Xây dựng hệ i18n runtime và theme runtime cho ứng dụng React Native quy mô nhiều màn hình.
- Chuẩn hóa UI/UX cho booking, payment, settings, chatbot và gallery viewer.
- Tăng chất lượng codebase bằng shared components, service layer, data adapters và test coverage cho các flow quan trọng.

- Designed and implemented a mobile authentication flow with refresh tokens, session restoration, and multi-device compatibility.
- Built runtime i18n and runtime theming for a multi-screen React Native application.
- Standardized UI/UX across booking, payments, settings, chatbot, and gallery experiences.
- Improved maintainability through shared components, service-layer abstractions, data adapters, and focused test coverage.

## Roadmap | Hướng phát triển tiếp theo

- Tích hợp thanh toán thực tế với callback xác nhận trạng thái giao dịch.
- Bổ sung analytics và crash reporting.
- Tối ưu thêm test coverage cho search, favourites và payment method flows.
- Thêm CI pipeline cho lint, test và build verification.

- Integrate real payment confirmation callbacks.
- Add analytics and crash reporting.
- Expand test coverage for search, favourites, and payment method flows.
- Add CI pipelines for linting, testing, and build verification.
