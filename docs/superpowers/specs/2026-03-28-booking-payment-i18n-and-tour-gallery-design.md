# Booking/Payment I18n And Tour Gallery Design

## Goal

Hoàn tất i18n cho toàn bộ flow đặt tour và thanh toán trong app React Native, đồng thời sửa viewer ảnh ở màn chi tiết tour để cả ảnh hero và ảnh trong gallery dùng chung một full-screen viewer hoạt động đúng.

## Scope

Bao gồm các màn:

- `screens/Main/Home/Booking/BookingScreen.tsx`
- `screens/Main/Home/Payment/PaymentMethodScreen.tsx`
- `screens/Main/Home/Payment/Method/MoMoScreen.tsx`
- `screens/Main/Home/Payment/Method/VNPayScreen.tsx`
- `screens/Main/Home/Payment/Method/ZaloPayScreen.tsx`
- `screens/Main/Home/Payment/Method/BankTransferScreen.tsx`
- `screens/Main/Home/Payment/Method/CashPaymentScreen.tsx`
- `screens/Main/Home/Payment/Method/PaymentResults/PaymentSuccessScreen.tsx`
- `screens/Main/Home/Payment/Method/PaymentResults/PaymentFailedScreen.tsx`
- `screens/Main/Home/Details/TourDetail.tsx`
- `screens/Main/Home/Details/TourDetailTabs/OverviewTab.tsx`

## Requirements

### 1. Booking/payment i18n

- Toàn bộ label, tiêu đề, note, warning, placeholder, CTA, timer text, trạng thái xử lý, thông báo lỗi người dùng nhìn thấy trong flow booking/payment phải đi qua `t(...)`.
- Không để lại text hardcode cho `vi/en` trong flow này.
- Giá tiền, ngày giờ, timer label phải format theo `locale` hiện tại.
  - Tiền tệ: dùng `Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", { style: "currency", currency: "VND" })`
  - Ngày/giờ: dùng `toLocaleDateString` hoặc `toLocaleString` theo `locale === "vi" ? "vi-VN" : "en-US"`
  - Timer `mm:ss` giữ định dạng số, nhưng mọi label xung quanh timer phải đi qua i18n
- Không đổi business flow hiện có trừ khi cần để hỗ trợ i18n hoặc sửa bug rõ ràng.

### 2. Tour gallery behavior

- Ảnh hero và ảnh ở phần `Overview > Gallery` phải mở cùng một viewer full-screen.
- Khi bấm vào ảnh nào trong grid, viewer phải mở đúng index đó.
- Viewer phải swipe ngang qua toàn bộ danh sách ảnh dùng chung.
- Nút đóng viewer phải nằm cùng hàng/inset với nút back của màn detail, không bị dính quá sát mép trên.
- Chỉ cần giữ đúng `activeImageIndex` trong một lần mở viewer:
  - bấm hero mở index `0`
  - bấm ảnh grid mở đúng index tương ứng
  - swipe trong viewer cập nhật `activeImageIndex`
  - đóng viewer rồi mở lại từ entry point mới thì dùng index mới của lần mở đó, không cần nhớ index cũ giữa các lần mở
- Edge cases:
  - nếu `galleryImages` rỗng, không mở viewer
  - nếu chỉ có 1 ảnh, viewer vẫn mở nhưng không nổ lỗi khi swipe
  - nếu có URL trùng nhau, index phải bám theo vị trí phần tử trong mảng
  - hero image và grid gallery cùng dùng mảng `galleryImages` đã normalize từ `buildTourGalleryImages(...)`

## Approach

### Booking/payment

- Giữ nguyên cấu trúc từng màn, chỉ thay text tĩnh bằng key i18n và format locale runtime.
- Bổ sung key theo domain để dễ bảo trì:
  - `booking.*`
  - `paymentMethod.*`: màn chọn phương thức thanh toán và modal phụ trong `PaymentMethodScreen`
  - `paymentFlow.*`: các màn xử lý thanh toán theo phương thức như `MoMo`, `VNPay`, `ZaloPay`, `BankTransfer`, `Cash`
  - `paymentResult.*`: `PaymentSuccessScreen` và `PaymentFailedScreen`
- Các màn đã partial-migrate vẫn được rà lại để bỏ key thiếu, text hardcode và chuỗi lỗi mã hóa.

### Tour gallery

- `TourDetail` tiếp tục giữ `galleryImages` là source duy nhất cho viewer full-screen.
- `OverviewTab` nhận callback `onOpenGallery(index)` từ `TourDetail`.
- Grid ảnh overview đổi sang `Pressable` và truyền đúng index vào callback.
- Header viewer dùng cùng offset/spacing với header icon của detail screen để đồng bộ visual.

## Files Expected To Change

- `i18n/locales/vi.ts`
- `i18n/locales/en.ts`
- `screens/Main/Home/Booking/BookingScreen.tsx`
- `screens/Main/Home/Payment/PaymentMethodScreen.tsx`
- `screens/Main/Home/Payment/Method/MoMoScreen.tsx`
- `screens/Main/Home/Payment/Method/VNPayScreen.tsx`
- `screens/Main/Home/Payment/Method/ZaloPayScreen.tsx`
- `screens/Main/Home/Payment/Method/BankTransferScreen.tsx`
- `screens/Main/Home/Payment/Method/CashPaymentScreen.tsx`
- `screens/Main/Home/Payment/Method/PaymentResults/PaymentSuccessScreen.tsx`
- `screens/Main/Home/Payment/Method/PaymentResults/PaymentFailedScreen.tsx`
- `screens/Main/Home/Details/TourDetail.tsx`
- `screens/Main/Home/Details/TourDetailTabs/OverviewTab.tsx`

## Verification

- Targeted TypeScript compile cho cụm `TourDetail + Booking + Payment`.
- Focused locale/helper tests nếu cần cho key mới hoặc helper gallery.
- Manual smoke path:
  - mở chi tiết tour
  - bấm hero image và xác nhận mở index `0`
  - bấm ảnh trong overview gallery và xác nhận mở đúng ảnh được chạm
  - swipe viewer, đóng viewer, rồi mở lại từ entry point khác để xác nhận index không bị lệch
  - kiểm tra case `0 ảnh` và `1 ảnh` không nổ lỗi viewer
  - kiểm tra case URL ảnh trùng nhau vẫn mở đúng theo vị trí ảnh được chạm
  - kiểm tra nút đóng viewer nằm cùng hàng/inset với nút back của detail screen
  - đi qua `Booking -> PaymentMethod -> từng payment screen -> result`
  - đổi app sang English để kiểm tra text
  - kiểm tra format tiền/ngày/giờ ở cả `vi/en`.
