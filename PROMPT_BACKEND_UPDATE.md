# PROMPT HƯỚNG DẪN CẬP NHẬT BACKEND ASP.NET DỰA TRÊN MOBILE APP REFACTORING

**Ngữ cảnh:** 
Chúng tôi vừa thực hiện một đợt refactor toàn diện cấu trúc dữ liệu trên React Native Mobile App để đồng bộ với định hướng mới của ASP.NET Backend (sử dụng MongoDB). 
Bạn hãy đóng vai trò là một Backend Engineer (hoặc AI Backend Specialist). Sử dụng toàn bộ thông tin dưới đây để cập nhật Models, Service Layer, API Controllers và MongoDB Seed Data trên project ASP.NET.

---

## MỤC TIÊU CHÍNH

1. **Phân tách User & Customer**: Bảng `Users` hiện tại chỉ dùng cho Admin/Staff. Cần tạo collection `Customers` dành riêng cho Mobile App.
2. **Gộp dữ liệu Tour**: Loại bỏ collection `Categories` và `Cities`. Lưu trực tiếp thông tin này thành các field/object bên trong document của `Tours`.
3. **Tách Collection**: Tách `Payments` và `Reviews` ra khỏi `Bookings` và `Tours` thành các collection độc lập.
4. **Chuẩn hóa trường dữ liệu (CamelCase JSON)**: Mọi field trả về từ API đều phải ánh xạ chính xác với Data Models bên dưới.

---

## CHI TIẾT CÁC SCHEMA MỚI CẦN CẬP NHẬT (NGÔN NGỮ: C# / BSON)

### 1. Customer (Mới hoàn toàn - Thay thế User cho Mobile)
*Collection: `Customers`*
- `_id` (ObjectId) -> Serialize: `id`
- `CustomerCode` (string)
- `FullName` (string)
- `Email` (string)
- `PhoneNumber` (string)
- `AvatarUrl` (string)
- `Address` (object: `Street`, `City`, `Country`)
- `Segment` (enum/string: `VIP`, `New`, `Standard`, `ChurnRisk`, `Inactive`)
- `Status` (enum/string: `Active`, `Banned`)
- `Stats` (object: `LoyaltyPoints`, `LastActivity`)
- `CreatedAt`, `UpdatedAt`

### 2. Tour (Cấu trúc lại, loại bỏ các trường thừa)
*Collection: `Tours`*
- **Xóa các collection phụ:** `Categories` và `Cities`.
- **Trường cần XÓA:** `ThumbnailUrl`, `Gallery`, `Time`, `Vehicle`, `Accomodations`, `Stock`, `NewPrice`.
- **Trường cần cập nhật/thêm mới:**
  - `Images` (List<string>): Thay cho ThumbnailUrl/Gallery.
  - `Category` (string): Lưu tên Category trực tiếp.
  - `Destination` (object: `City`, `Country`, `Region`): Thay vì ObjectID trỏ tới Cities.
  - `Duration` (object: `Days`, `Nights`, `Text`): Thay cho Time. VD: `{ Days: 3, Nights: 2, Text: "3 Ngày 2 Đêm" }`.
  - `Price` (object: `Adult`, `Child`, `Infant`, `Discount` - tính bằng %). Cập nhật giá gốc vào đây.
  - `Schedule` (List<object>: `Day`, `Title`, `Description`, `Activities` (List<string>)). Dùng thống nhất cấu trúc list chuỗi cho các hoạt động.
  - `MaxParticipants`, `CurrentParticipants` (int): Thay cho `Stock`.
  - `GeneratedInclusions`, `GeneratedExclusions` (List<string>): Thay cho `Vehicle`, `Accomodations`.
  - `ReviewCount` (int), `Rating` (double): Cache từ collection Reviews.

### 3. Booking (Chi tiết hơn)
*Collection: `Bookings`*
- `CustomerId` (ObjectId trỏ tới `Customers` - **Không dùng UserId nữa**).
- `TourId` (ObjectId trỏ tới `Tours`).
- `TourSnapshot` (object): Lưu lại dữ liệu lúc đặt (Date, Name, Duration) để tránh mất khi Tour update.
- `Passengers` (List<object>: `Type` (Adult/Child), `FullName`, `Gender`, `Birthday`). Khách hàng chi tiết trên chuyến.
- `ContactInfo` (object: `FullName`, `Email`, `PhoneNumber`, `Address`).
- `TotalAmount` (decimal).
- `PaymentStatus` (enum: `Pending`, `Paid`, `Failed`, `Refunded`).
- `HistoryLog` (List<object>: `Status`, `Timestamp`, `Note`).
- `IsDeleted` (bool): Hỗ trợ **Soft Delete**.

### 4. Payment (Tách thành collection riêng)
*Collection: `Payments`*
- `BookingId` (ObjectId).
- `Amount` (decimal).
- `TransactionId` (string).
- `PaymentMethod` (enum: `CreditCard`, `BankTransfer`, `Cash`). (Không dùng VNPay/Momo/ZaloPay cứng trong model nữa).
- `Status` (enum: `Pending`, `Success`, `Failed`).
- `PaymentDate` (DateTime).

### 5. Review (Tách thành collection riêng)
*Collection: `Reviews`*
- Dữ liệu Review cũ nhúng trong Tour cần chạy script migration để tách ra.
- `TourId` (ObjectId).
- `CustomerId` (ObjectId).
- `Rating` (double - 1.0 đến 5.0).
- `Comment` (string).
- `IsApproved` (bool).
- `CreatedAt`, `UpdatedAt`.

### 6. Favourite (Tính năng mới)
*Collection: `Favourites`*
- Cần tạo mới entity này và expose API CRUD cho mobile.
- `CustomerId` (ObjectId).
- `TourId` (ObjectId).
- `CreatedAt` (DateTime).

---

## YÊU CẦU VỀ API CONTROLLERS

1. **Auth & Identity**: Các endpoint login/register cho User cũ trên app phải route qua `CustomerController` hoặc `Auth/CustomerContext`. Mobile sử dụng `Customer`.
2. **Loại bỏ endpoints**: Xóa `GET /api/categories` và `GET /api/cities`. App sẽ lấy danh mục từ `Tours` trả về hoặc hardcode.
3. **Thêm mới endpoints**:
   - `GET, POST, DELETE /api/favourites`
   - `GET, POST /api/reviews` (Lấy review của một tour, tạo review)
   - `GET, POST, PUT /api/bookings`
   - `GET, POST /api/payments`
4. **Chuẩn đầu ra JSON**: Sử dụng chuẩn `CamelCase` mặc định của .NET Core. API lỗi sử dụng chuẩn RFC 7807 (`ProblemDetails`).

---

## TASK CỦA BẠN (BACKEND ENGINEER)

1. Cập nhật các class Models/Entities trong thư mục `Domain/Entities` hoặc `Models`.
2. Sinh các script Data Migration (nếu cần) để chuyển dữ liệu cũ (User sang Customer, chuyển Reviews nhúng ra collection riêng, move Cities/Categories vào trong entity Tour).
3. Cập nhật Repository/Service tương ứng cho các model mới.
4. Điều chỉnh API Controllers. Xóa các endpoint thừa và thêm endpoint cho `Payments`, `Reviews`, `Favourites`.
5. Tạo `Notification` và `Promotion` models nếu project chưa có.

**Vui lòng xác nhận bạn hiểu cấu trúc này và hãy bắt đầu bằng việc viết C# Models cho `Tour`, `Customer`, `Booking` và `Payment`.**
