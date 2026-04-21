# Support Inbox Mobile UX Design

**Date:** 2026-03-29

## Goal

Nâng cấp tab `Tin nhắn` trên mobile để người dùng thấy rõ điểm vào `Hỗ trợ khách hàng`, lịch sử chat hỗ trợ, và màn chat chi tiết có UX đúng kiểu CSKH, nhưng chưa thay đổi schema hay controller của ASP.NET.

## Constraints

- Không sửa backend ASP.NET trong đợt này.
- Mobile hiện chưa dùng auth/cookie của ASP.NET, nên chưa chốt gửi chat thật sang ASP.NET bằng flow production.
- UX phải bám mô hình hiện có: một cuộc trò chuyện hỗ trợ chính, hiển thị như thread support chính trong inbox.

## Experience

### Inbox

- Thêm card đầu trang `Hỗ trợ khách hàng`.
- Card có title, subtitle, CTA `Bắt đầu chat` hoặc `Tiếp tục cuộc trò chuyện`.
- Bên dưới là section `Lịch sử chat`.
- Nếu đã có conversation, item support sẽ đứng đầu, ưu tiên trạng thái và unread.
- Nếu chưa có conversation, giữ empty state rõ ràng nhưng vẫn để card support nổi bật.

### Chat detail

- Header dùng title support cố định và subtitle trạng thái.
- Có intro card ngắn giải thích đây là kênh hỗ trợ khách hàng.
- Timeline chat dùng bubble, date divider, trạng thái dễ đọc hơn.
- Composer gõ tin được hiển thị trong UI, nhưng nếu chưa có backend mobile-ready thì phải báo rõ là kênh đang ở chế độ lịch sử hoặc chờ tích hợp.

## Architecture

- Giữ `InboxScreen` là entry point cho support UX.
- Giữ `ChatScreen` là màn xem hội thoại, nhưng refactor để có shell support chuẩn.
- Thêm helper/service nhỏ để xác định conversation hỗ trợ chính từ dữ liệu chat hiện có.
- Mọi copy đưa qua i18n.

## Non-goals

- Không đổi ASP.NET auth sang JWT.
- Không thêm schema `topic`, `bookingCode`, hay case management ở ASP.NET.
- Không triển khai queue admin mới ở web admin trong đợt này.
