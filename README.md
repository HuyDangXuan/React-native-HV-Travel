# HV-Travel (React Native)

Ứng dụng mobile đặt tour/đặt vé du lịch **HV-Travel** xây dựng bằng **React Native + TypeScript**, sử dụng **React Navigation** (Stack + Bottom Tabs) và bộ **theme** để đồng bộ UI.

> Repo: Tổng quan dự án về app bán vé tour du lịch HV-Travel.  

---

## ✨ Tính năng chính

### Authentication
- Splash / Onboarding
- Đăng nhập, đăng ký
- Quên mật khẩu: nhập email → xác thực code → tạo mật khẩu mới
- Validation dữ liệu + hiển thị lỗi bằng MessageBox

### Main (Bottom Tabs)
- **Home**: khám phá tour, gói tour, danh mục, đề xuất
- **Favourite**: tour yêu thích
- **Setting**: cài đặt & các màn hình liên quan

### Booking & Payment flow
- Tour detail
- Booking screen
- Chọn phương thức thanh toán
- Thanh toán theo các phương thức:
  - ZaloPay
  - VNPay
  - MoMo
- Kết quả thanh toán: Success / Failed

### Profile & Setting screens
- Setting screen (UI theo thiết kế)
- My Booking (có segment “Chưa đi/Đã đi” + empty state)
- Profile + Edit profile

---

## 🧱 Tech Stack

- **React Native + Expo**
- **TypeScript**
- **React Navigation**
  - Native Stack Navigator
  - Bottom Tabs Navigator
- **@expo/vector-icons**
- Hệ thống **theme**: spacing / colors / radius / fontSize / assets

---
