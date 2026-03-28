# Cấu Trúc Database (Dự kiến dựa trên Frontend Models) & Data Mapping

Dựa vào việc phân tích các mã nguồn trong ứng dụng React Native (các thư mục `models`, `types`, `screens` và `services`), dưới đây là tài liệu tổng hợp và đánh giá chi tiết về cấu trúc cơ sở dữ liệu (Database Schema) cùng với sơ đồ các màn hình có thực hiện map dữ liệu từ API.

---

## 1. Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)

Dưới đây là các Entity (Bảng/Collection) chính được sử dụng và map trong Frontend:

### 1.1. Bảng `User` (Người dùng)
Lưu trữ thông tin chi tiết của người dùng, đăng nhập, và xác thực.
- `_id` (String): ID duy nhất của người dùng.
- `fullName` (String): Họ và tên.
- `email` (String): Địa chỉ email.
- `phone` (String, tuỳ chọn): Số điện thoại.
- `gender` (String, tuỳ chọn): Giới tính.
- `birthday` (String / Date, tuỳ chọn): Ngày sinh.
- `address` (String, tuỳ chọn): Địa chỉ.
- `favourite_tours` (Array of Strings): Danh sách ID các Tour yêu thích.
- `avatar` (String): URL ảnh đại diện.
- `emailVerified` (Boolean): Trạng thái xác thực email.
- `phoneVerified` (Boolean): Trạng thái xác thực SĐT.
- `tokenVersion` (Number): Quản lý phiên bản token để đăng xuất diện rộng.

### 1.2. Bảng `Category` (Danh mục Tour)
Phân loại các tour du lịch.
- `_id` (String): ID danh mục.
- `name` (String): Tên danh mục (Ví dụ: "Khám phá", "Biển đảo").

### 1.3. Bảng `City` (Thành phố / Điểm đến)
Lưu trữ thông tin các điểm đến nổi bật.
- `_id` (String): ID thành phố.
- `name` (String): Tên thành phố / điểm đến.
- `image` (String): URL ảnh thu nhỏ của khu vực.

### 1.4. Bảng `Tour` (Sản phẩm Du lịch)
Entity trung tâm của hệ thống, chứa nhiều thông tin chi tiết để hiển thị trên app.
- `_id` (String): ID Tour.
- `name` (String): Tên Tour.
- `description` (String): Mô tả chi tiết.
- `information` (String): Thông tin bổ sung.
- `category` (String): ID tham chiếu tới bảng Category.
- `city` (String): ID tham chiếu tới bảng City.
- `time` (String): Thời gian hành trình (VD: "3 Ngày 2 Đêm").
- `vehicle` (String): Phương tiện di chuyển.
- `startDate` (Date / IsoString): Ngày khởi hành dự kiến.
- `thumbnail_url` (String): URL ảnh đại diện của tour.
- `gallery` (Array of Objects): Danh sách ảnh bổ sung. Thường map dạng `[{ picture: string }]`.
- `accomodations` (Array of Objects): Danh sách khách sạn/resort. Dạng `[{ place: string }]`.
- **Pricing & Stock**:
  - `stock` (Object): Số chỗ còn trống `{ adult: number, children: number, baby: number }`.
  - `price` (Object): Giá gốc `{ adult: number, children: number, baby: number }`.
  - `newPrice` (Object): Giá khuyến mãi hiện tại.
  - `discount` (Number): % giảm giá.
- **Ratings & Reviews**:
  - `rating` (Number): Điểm đánh giá trung bình.
  - `ratingCount` (Number): Tổng số lượng đánh giá.
  - `reviews` (Array of Objects): Danh sách các review (có thể nạp sẵn từ populate hoặc lưu trực tiếp).
- **Itinerary / Schedules** (Lịch trình): Dữ liệu này có thể có 2 định dạng từ API:
  - Mới: `[{ day: number, title: string, description: string }]`
  - Cũ: `[{ title: string, description: string, day: number, activities: [{ time: string, desc: string }] }]`

### 1.5. Bảng `Review` (Nhận xét / Đánh giá)
(Thường nằm lồng trong Tour hoặc là bảng con trỏ tới Tour)
- `_id` (String): ID đánh giá.
- `tourId` (String): Tham chiếu tới Tour.
- `name` / `userName` (String): Tên người đánh giá.
- `rating` (Number): Điểm số (1-5 sao).
- `comment` (String): Nội dung đánh giá.
- `createdAt` (Date): Ngày tạo đánh giá.

### 1.6. Bảng `Favourite` (Tour yêu thích)
Lưu lại ánh xạ 1 người dùng với 1 Tour mà họ yêu thích.
- `_id` (String): ID bản ghi.
- `userId` (String): Tham chiếu User.
- `tour` (String): Tham chiếu ID của Tour.

### 1.7. Bảng `Booking / Order` (Đơn đặt Tour)
Chứa thông tin giao dịch của khách hàng.
- `_id` / `orderId` (String): Mã đơn đặt.
- `tourId` (String): Tham chiếu đến Tour đặt.
- `userId` (String): Tham chiếu User đã đặt.
- `adults` (Number): Số vé người lớn.
- `children` (Number): Số vé trẻ em.
- `infants` (Number): Số vé em bé.
- `selectedHotel` (String): Khách sạn đã được chọn để lưu trú.
- `total` (Number): Tổng giá trị đơn hàng thanh toán.
- `status` (String): Trạng thái chuyến đi (Ví dụ: "Chưa Đi", "Đã Đi", hoặc "Pending", "Cancelled").
- `paymentMethod` (String): Phương thức thanh toán ("zalopay", "vnpay", "momo", "bank", "cash").
- `createdAt` (Date): Ngày tạo đơn đặt/giao dịch.

---

## 2. Các Màn Hình Có Thực Hiện Mapping Dữ Liệu

Quá trình map dữ liệu (Data Mapping) giữa dữ liệu Database/API và giao diện trên các trang (screens) chính:

### 2.1. Màn hình `HomeScreen` (`screens/Main/Home/HomeScreen.tsx`)
- **Map Dữ Liệu**:
  - `Category`: Render thành danh sách các nút bộ lọc ngang.
  - `City`: Lấy ngẫu nhiên vài địa điểm để hiển thị trên danh sách "Khám phá thêm".
  - `Tour`: Trích xuất thành dạng thẻ thu gọn (`TourCard`) bao gồm `_id`, `name`, `thumbnail_url`, `price`, `newPrice`, `discount`, `time`, `vehicle`, `rating`.
  - `User`: Hiển thị tên hiển thị (`user.fullName`).
  - `Favourite`: Fetch danh sách ID tour yêu thích từ API để gán class hiển thị tim đỏ (`heart` / `heart-outline`).

### 2.2. Nhóm Màn hình Chi tiết Tour (`screens/Main/Home/Details/...`)
- **OverviewTab**: Map chi tiết của `Tour` bao gồm mô tả, điểm nổi bật (thời gian, di chuyển, ngày khởi hành), danh sách ảnh thư viện (`gallery`), danh sách lưu trú (`accomodations`), số chỗ trống (`stock`) và giá (`price`/`newPrice`).
- **ItineraryTab**: Map danh sách `itinerary` hoặc `schedules` của `Tour` để hiển thị Timeline các ngày của tour (bao gồm hoạt động và mốc thời gian chi tiết).
- **ReviewTab**: Map danh sách `reviews` bên trong đối tượng `Tour`, tính toán phân bố sao (Tỷ lệ %, tổng quan, số lượng sao) và hiển thị thẻ Review (tên, ngày tháng, nội dung).

### 2.3. Màn hình `BookingScreen` (`screens/Main/Home/Booking/BookingScreen.tsx`)
- **Map Dữ Liệu**:
  - `Tour`: Fetch và map lại các trường cơ bản (tên, thời gian, hình ảnh).
  - Kết hợp với số lượng `stock` của API để giới hạn hành khách tăng giảm (ví dụ `maxAdult`, `maxChildren`).
  - Map `accomodations` để người dùng trải nghiệm flow dropdown chọn khách sạn.
  - Tính tổng thanh toán (`total`) dựa theo công thức: (người lớn * giá người lớn) + (giá trẻ em) + (giá em bé).

### 2.4. Màn hình `PaymentMethodScreen` (`screens/Main/Home/Payment/PaymentMethodScreen.tsx`)
- **Map Dữ Liệu**:
  - Sử dụng lại `orderId`, `tourId`, và `total` từ lúc người dùng xác nhận ở `BookingScreen`.
  - Phân luồng Payment Gateway. Các Modal thanh toán tiền mặt (Cash) và chuyển khoản (Bank Transfer) map dữ liệu giá và mã đơn lên màn hình hướng dẫn.

### 2.5. Màn hình `FavouriteScreen` (`screens/Main/Favourites/FavouriteScreen.tsx`)
- Lấy Collection/Bảng `Favourite` trả về qua API.
- Map danh sách Favourite thành Card hiển thị giống với layout thẻ `Tour`.

### 2.6. Màn hình `MyBookingScreen` (`screens/Main/Setting/MyBooking/MyBookingScreen.tsx`)
- (Lưu ý: Màn hình này hiện đang dùng Hard-coded DATA).
- Khi có API thật, sẽ map danh sách bảng `Booking / Order` để trả ra các thuộc tính như: tên Tour, thời hạn (duration), Ngày đi, trạng thái ("Đã Đi", "Chưa Đi") và Hình ảnh đại diện Tour.

### 2.7. Nhóm Màn hình `Setting` / `Profile`
- **Map Dữ Liệu**:
  - Map toàn bộ cấu trúc bảng `User` để hiển thị trong các form Setting (tên, avatar, ngày sinh, giới tính, số điện thoại, email) trên View và thao tác Update.
