const vi = {
  common: {
    continue: "Tiếp tục",
    cancel: "Hủy",
    close: "Đóng",
    current: "Hiện tại",
  },
  settings: {
    title: "Cài đặt",
    accountSection: "Tài khoản",
    appSection: "Ứng dụng",
    supportSection: "Hỗ trợ",
    profile: "Tài khoản",
    bookings: "Chuyến đi đã đặt",
    security: "Bảo mật",
    transactions: "Lịch sử giao dịch",
    language: "Ngôn ngữ",
    appearance: "Chuyển chế độ",
    help: "Trợ giúp",
    terms: "Điều khoản",
    softLogout: "Đăng xuất",
    profileFallbackName: "HV Traveler",
    profileFallbackEmail: "Chưa cập nhật email",
    viewProfile: "Xem hồ sơ",
    softLogoutTitle: "Đăng xuất",
    softLogoutMessage:
      "Bạn sẽ quay về màn hình đăng nhập, nhưng vẫn có thể vào lại nhanh trên thiết bị này.",
  },
  language: {
    title: "Ngôn ngữ",
    subtitle: "Đổi ngôn ngữ hiển thị cho toàn bộ ứng dụng.",
    vietnamese: "Tiếng Việt",
    english: "English",
    changedTitle: "Đã cập nhật",
    changedMessage: "Ứng dụng đã chuyển sang {{language}}.",
  },
  appearance: {
    title: "Chuyển chế độ",
    subtitle: "Chọn giao diện sáng, tối hoặc bám theo thiết bị.",
    light: "Sáng",
    dark: "Tối",
    system: "Theo thiết bị",
    currentMode: "Đang dùng",
  },
  help: {
    title: "Trợ giúp",
    subtitle: "Các cách nhận hỗ trợ nhanh khi cần trợ giúp.",
    faqTitle: "Câu hỏi thường gặp",
    faqDescription: "Xem các câu trả lời nhanh cho đăng nhập, thanh toán và booking.",
    hotlineTitle: "Hotline hỗ trợ",
    hotlineDescription: "1900 6868 · 08:00 - 22:00 mỗi ngày.",
    emailTitle: "Email hỗ trợ",
    emailDescription: "support@hvtravel.vn",
    inboxTitle: "Nhắn tin trong ứng dụng",
    inboxDescription: "Vào Hộp thư để trao đổi trực tiếp với đội hỗ trợ.",
  },
  terms: {
    title: "Điều khoản",
    subtitle: "Những nguyên tắc chính khi sử dụng ứng dụng HV Travel.",
    bookingTitle: "1. Đặt tour",
    bookingBody:
      "Thông tin tour, chỗ trống và giá có thể thay đổi cho đến khi đơn được xác nhận thanh toán.",
    paymentTitle: "2. Thanh toán",
    paymentBody:
      "Người dùng cần kiểm tra kỹ số tiền, phương thức và trạng thái thanh toán trước khi rời màn hình.",
    accountTitle: "3. Tài khoản",
    accountBody:
      "Bạn chịu trách nhiệm bảo mật mật khẩu và các phiên đăng nhập trên thiết bị của mình.",
    privacyTitle: "4. Quyền riêng tư",
    privacyBody:
      "Ứng dụng chỉ sử dụng thông tin cần thiết để xử lý booking, hỗ trợ và cải thiện trải nghiệm.",
  },
} as const;

export default vi;
