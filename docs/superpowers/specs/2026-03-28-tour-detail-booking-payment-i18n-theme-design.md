# Tour Detail, Booking, Payment I18n And Theme Design

## Goal

Đồng bộ `i18n` và `runtime theme` cho toàn bộ flow:

- `TourDetail`
- `TourDetailTabs/OverviewTab`
- `TourDetailTabs/ItineraryTab`
- `TourDetailTabs/ReviewTab`
- `BookingScreen`
- `PaymentMethodScreen`
- `Payment/Method/*`
- `PaymentResults/*`

Mục tiêu là mọi text nhìn thấy được đều đổi theo `vi/en`, mọi màu nền/chữ/chip/card bám `useAppTheme()`, và status bar trên iPhone đổi đúng theo dark/light.

## Scope

Trong phạm vi:

- Chuẩn hóa text hardcode sang `t(...)`
- Chuẩn hóa màu tĩnh sang `theme.semantic.*`, `theme.colors.*`
- Chuẩn hóa `StatusBar` theo `themeName`
- Giữ nguyên logic nghiệp vụ booking/payment hiện tại
- Chỉ chỉnh layout khi cần để theme/i18n hiển thị đúng

Ngoài phạm vi:

- Đổi API/backend contract
- Viết lại flow thanh toán
- Refactor lớn navigation
- Redesign toàn bộ UI vượt quá visual language hiện có

## Approach Options

### 1. Recommended

Migrate theo domain, giữ layout hiện tại, thay text và theme tại chỗ.

Ưu điểm:

- Rủi ro thấp
- Phù hợp codebase hiện tại
- Dễ kiểm thử từng màn

Nhược điểm:

- Một số file lớn vẫn còn kỹ thuật cũ sau pass này

### 2. Text-first

Chỉ thay `i18n`, dark mode chỉ vá các điểm lệch lớn.

Ưu điểm:

- Nhanh

Nhược điểm:

- Không đạt yêu cầu đồng bộ giao diện

### 3. Shared-shell refactor first

Tách shared header/card/form shell trước rồi mới migrate.

Ưu điểm:

- Kiến trúc sạch hơn

Nhược điểm:

- Phạm vi lớn, hồi quy cao

Chọn: phương án 1.

## Design

### I18n Structure

Thêm key theo domain trong:

- `i18n/locales/vi.ts`
- `i18n/locales/en.ts`

Nhóm key mới:

- `tourDetail.*`
- `booking.*`
- `payment.*`
- `paymentMethod.*`
- `paymentResult.*`

Quy ước namespace:

- `payment.*`: chỉ dùng cho màn chọn phương thức thanh toán tổng (`PaymentMethodScreen`), gồm tiêu đề, mô tả, tổng tiền, CTA quay lại/chọn phương thức
- `paymentMethod.*`: dùng cho từng màn phương thức cụ thể như MoMo, VNPay, ZaloPay, chuyển khoản, tiền mặt
- `paymentResult.*`: dùng cho success/failed

Quy ước:

- Text tĩnh dùng `t("domain.key")`
- Text có biến dùng `t("domain.key", { value })`
- Không thêm alias cũ mới; key mới bám đúng domain để dễ bảo trì

### Theme Structure

Mỗi màn lấy:

```ts
const theme = useAppTheme();
const { themeName } = useThemeMode();
```

Quy ước dùng màu:

- nền màn: `theme.semantic.screenBackground`
- card/sheet: `theme.semantic.screenSurface` hoặc `screenMutedSurface`
- text chính: `theme.semantic.textPrimary`
- text phụ: `theme.semantic.textSecondary`
- line/divider: `theme.semantic.divider`
- CTA: `theme.colors.primary`

Không dùng trực tiếp `theme` default import cho màu runtime ở các màn thuộc scope này.

### Screen Changes

#### Tour Detail

- Header, tab label, CTA booking, favorite feedback, section labels, date/price/status text dùng `i18n`
- Background hero/content/bottom action area bám runtime theme
- Các tab `Overview`, `Itinerary`, `Review` bỏ text hardcode và màu sáng cố định

#### Booking

- Tất cả label form, placeholder, helper text, validation text, summary text, participant labels, CTA sang `booking.*`
- Loading và empty/error blocks bám theme runtime
- Nếu có status chip hoặc section card thì dùng cùng token với các màn settings/search đã chuẩn hóa

#### Payment Method

- `PaymentMethodScreen` dùng `payment.*`
- Các màn method riêng dùng `paymentMethod.*`
- Các hướng dẫn chuyển khoản, tiền mặt, ví điện tử, lỗi và trạng thái chờ xử lý đều dịch được
- Background/card/button/status bar đổi đúng dark/light

#### Payment Result

- Success/Failed screen dùng `paymentResult.*`
- CTA quay lại, xem booking, thử lại, mô tả lỗi đều qua locale
- Icon/surface/primary action bám runtime theme

## Data Flow

Data flow không đổi:

1. Screen lấy data từ service/redux/context hiện có
2. UI chỉ đổi lớp presentation:
   - `t(...)` cho text
   - `useAppTheme()` cho màu
3. Navigation params và payload submit giữ nguyên

## Error Handling

- Mọi message đang hardcode ở UI sẽ được map sang locale key
- Không đổi cơ chế `MessageBoxService`, chỉ đổi nội dung truyền vào
- Không hiển thị trực tiếp raw backend error cho booking/payment nếu đó là lỗi hệ thống chung như:
  - thất bại mạng
  - timeout
  - không tải được dữ liệu
  - tạo booking thất bại
  - tạo thanh toán thất bại
  - xác thực thất bại
- Các lỗi hệ thống chung trên phải map sang key locale cố định ở UI
- Chỉ giữ nguyên text backend khi đó là dữ liệu nghiệp vụ cụ thể cần thấy nguyên văn, ví dụ mã giao dịch, mã booking, hoặc thông điệp domain rất cụ thể mà backend chủ động trả để hiển thị cho người dùng
- Nếu không phân loại được chắc chắn, mặc định dùng thông điệp locale an toàn thay vì để lọt tiếng Việt/Anh lẫn lộn từ backend

## Testing

Kiểm tra bắt buộc:

- `tsc -p tsconfig.test.json`
- Focused Jest suites liên quan nếu có
- Smoke test các màn sau:
  - Tour detail
  - Booking
  - Payment method
  - Một payment method screen
  - Payment success/failed
- Smoke test đổi locale:
  - mở flow ở `vi`
  - chuyển sang `en`
  - kiểm tra text chính đổi đúng ở từng màn trong scope
- Smoke test dark/light:
  - header
  - card
  - bottom CTA
  - status bar iPhone
- Kiểm tra nhanh overflow/truncation ở các text dài hơn khi locale là `en`, đặc biệt:
  - tiêu đề section
  - nút CTA
  - subtitle/payment instructions

Tiêu chí pass:

- Không còn lỗi TypeScript
- Không còn key `i18n` sai namespace trong flow
- Dark mode không giữ nền sáng hoặc text đen sai ở iPhone status bar/header/card chính
- Locale `vi` và `en` đều render được text chính trong toàn flow
- Không có text dài bị vỡ layout nghiêm trọng ở CTA hoặc header chính

## Implementation Notes

- Ưu tiên sửa các file root screen trước, rồi đến tab con
- Với file quá lớn, chỉ refactor nhỏ đủ để tránh lặp `ui` mapping và giảm rủi ro
- Có thể chạy song song theo 3 cụm độc lập:
  - `TourDetail + tabs`
  - `Booking`
  - `Payment + results`
- Rule song song cho locale:
  - chỉ một agent sở hữu chỉnh `vi.ts` và `en.ts`
  - các agent còn lại liệt kê key cần thêm trong kết quả trả về
  - agent tích hợp cuối cùng cập nhật locale files để tránh conflict
