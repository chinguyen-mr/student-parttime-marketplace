<!-- converted from CDTN2_SRS (1).docx -->



TRƯỜNG ĐẠI HỌC VĂN LANG
KHOA CÔNG NGHỆ THÔNG TIN










Software Requirements Specification
NGÀNH: CÔNG NGHỆ THÔNG TIN





Đề tài:
Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên







SVTH1: Nguyễn Tấn Hoàng Thông – 2374802010485
SVTH2: Lê Quang Anh Tuấn  - 2374802010538
SVTH3: Nguyễn Văn Chí - 2374802010056
GVHD: ThS. Nguyễn Văn Trung







TP. Hồ Chí Minh – Năm 2026

# MỤC LỤC


# INTRODUCTION
## 1. Mục tiêu tài liệu

### 1.1. Reader
| Reader | Content |
| --- | --- |
| ThS. Nguyễn Văn Trung |  |
|  |  |
|  |  |


# MÔ TẢ BÀI TOÁN VÀ MỤC TIÊU SẢN PHẨM
## 1.1. Mô tả bài toán (Dựa trên 5W1H)
Hiện nay, sinh viên (Who) thường gặp khó khăn khi tìm kiếm các công việc làm thêm ngắn hạn (What) do các nền tảng lớn chỉ tập trung vào việc làm full-time, dẫn đến rủi ro lừa đảo trên các hội nhóm không kiểm chứng (Why). Ở chiều ngược lại, các cá nhân/doanh nghiệp vừa và nhỏ (Who) cần thuê nhân sự thời vụ (What) nhưng thiếu một kênh tiếp cận tối ưu chi phí và nhắm đúng đối tượng sinh viên.
## 1.2. Mục tiêu sản phẩm
Xây dựng một nền tảng web hai chiều (two-sided marketplace) kết nối sinh viên tìm việc làm thêm với nhà tuyển dụng/cá nhân có nhu cầu thuê nhân sự ngắn hạn, cho phép đăng tin, tìm kiếm, ứng tuyển, quản lý trạng thái công việc và đánh giá sau khi hoàn thành.


# XÁC ĐỊNH ACTOR VÀ LUỒNG NGHIỆP VỤ CHÍNH
## 2.1. Danh sách Actor (Người dùng hệ thống)
Sinh viên: Người tìm việc, sử dụng hệ thống để tìm kiếm, ứng tuyển và đánh giá.
Nhà tuyển dụng: Người có nhu cầu thuê nhân sự, sử dụng hệ thống để đăng tin, duyệt ứng viên và quản lý tiến độ.
Quản trị viên: Người vận hành, quản lý tài khoản người dùng và duy trì nền tảng.
## 2.2. Luồng nghiệp vụ đầu-cuối (End-to-End Flow)
Quy trình cốt lõi của hệ thống diễn ra theo trình tự: Nhà tuyển dụng đăng tin → Sinh viên tìm kiếm và ứng tuyển → Nhà tuyển dụng duyệt hồ sơ → Công việc thực thi và chuyển trạng thái hoàn thành → Hai bên thực hiện đánh giá lẫn nhau.

# YÊU CẦU HỆ THỐNG
## 3.1. Yêu cầu chức năng (Functional Requirements)
Các yêu cầu dưới đây được đánh số thứ tự (FR) để phục vụ cho việc theo dõi tiến độ và thiết kế kịch bản kiểm thử.
| Mã Yêu cầu | Thuộc Module | Nội dung đặc tả yêu cầu hệ thống phải làm được |
| --- | --- | --- |
| FR-01 | Xác thực | Hệ thống cho phép người dùng đăng ký, đăng nhập và phân quyền 3 vai trò: Sinh viên, Nhà tuyển dụng, Quản trị viên. |
| FR-02 | Việc làm | Hệ thống cho phép Nhà tuyển dụng đăng tin tuyển dụng part-time với các trường thông tin: mô tả, thời gian, mức lương, địa điểm. |
| FR-03 | Việc làm | Hệ thống cung cấp công cụ cho Sinh viên tìm kiếm và lọc tin theo ngành nghề, địa điểm, mức lương. |
| FR-04 | Ứng tuyển | Hệ thống cho phép Sinh viên nộp đơn ứng tuyển vào tin tuyển dụng kèm theo CV hoặc đoạn giới thiệu bản thân. |
| FR-05 | Ứng tuyển | Hệ thống hiển thị danh sách ứng viên cho Nhà tuyển dụng và cung cấp chức năng duyệt (Accept) hoặc từ chối (Reject). |
| FR-06 | Trạng thái | Hệ thống cho phép Nhà tuyển dụng cập nhật trạng thái công việc theo vòng đời: Đang tuyển → Đã nhận người → Hoàn thành. |
| FR-07 | Đánh giá | Hệ thống mở khóa chức năng đánh giá sao và bình luận hai chiều (Sinh viên đánh giá Nhà tuyển dụng và ngược lại) khi công việc đạt trạng thái "Hoàn thành". |
| FR-08 | Thông báo | Hệ thống gửi thông báo cho người dùng khi có sự thay đổi về trạng thái ứng tuyển (được duyệt/bị từ chối). |

## 3.2. Yêu cầu phi chức năng (Non-Functional Requirements)
Các yêu cầu phi chức năng được định lượng cụ thể để đo lường trong quá trình nghiệm thu.
NFR-01 (Hiệu năng): Thời gian phản hồi của các API cốt lõi (Đăng nhập, Tìm kiếm tin, Ứng tuyển) không vượt quá 1.5 giây khi tải bình thường.
NFR-02 (Bảo mật): 100% mật khẩu của người dùng phải được băm (hash) trong cơ sở dữ liệu. Mọi API nghiệp vụ phải được bảo vệ bằng JWT.
NFR-03 (Tương thích): Giao diện Web Responsive, hiển thị ổn định trên Desktop (16:9) .


# MÔ HÌNH HÓA CHỨC NĂNG (USE CASE MODEL)
## 4.1. Danh sách Use Case

## 4.2. Sơ đồ Use Case (Use Case Diagram)

## 4.3. Đặc tả Use Case chi tiết