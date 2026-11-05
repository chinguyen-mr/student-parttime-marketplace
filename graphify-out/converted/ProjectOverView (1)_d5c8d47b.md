<!-- converted from ProjectOverView (1).docx -->



TRƯỜNG ĐẠI HỌC VĂN LANG
KHOA CÔNG NGHỆ THÔNG TIN










Project OverView
NGÀNH: CÔNG NGHỆ THÔNG TIN





Đề tài:
Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên







SVTH1: Nguyễn Tấn Hoàng Thông – 2374802010485
SVTH2: Lê Quang Anh Tuấn  - 2374802010538
SVTH3: Nguyễn Văn Chí - 2374802010056
GVHD: ThS. Nguyễn Văn Trung






TP. Hồ Chí Minh – Năm 2026



# TỔNG QUAN DỰ ÁN
## 1.1. Tên đề tài
Nền tảng quản lý freelance / marketplace việc làm part-time cho sinh viên.
## 1.2. Lý do chọn đề tài
Về phía sinh viên: Nhu cầu tìm kiếm việc làm thêm (part-time) để trang trải chi phí học tập và tích lũy kinh nghiệm thực tế là rất lớn. Tuy nhiên, sinh viên thường gặp khó khăn trong việc tiếp cận các nguồn tuyển dụng uy tín, dễ đối mặt với rủi ro lừa đảo từ các hội nhóm không được kiểm chứng trên mạng xã hội.
Về phía nhà tuyển dụng: Các cá nhân, hộ kinh doanh hoặc doanh nghiệp vừa và nhỏ (SME) thường xuyên phát sinh nhu cầu thuê mướn nhân sự thời vụ ngắn hạn. Việc đăng tin trên các nền tảng tuyển dụng lớn thường tốn kém và không nhắm đúng mục tiêu là sinh viên, dẫn đến quy trình tuyển dụng kéo dài và thiếu hiệu quả.
Sự thiếu hụt của thị trường: Hiện tại, thiếu vắng một nền tảng chuyên biệt kết nối trực tiếp hai đối tượng này với một cơ chế đánh giá (review) minh bạch để bảo vệ quyền lợi đôi bên.
Từ những vấn đề thực tiễn trên, nhóm quyết định xây dựng một nền tảng marketplace hai chiều nhằm giải quyết bài toán cung - cầu lao động part-time một cách tối ưu.
1.3. Mục tiêu của đề tài
Xây dựng một nền tảng web hai chiều (two-sided marketplace) kết nối sinh viên tìm việc làm thêm với nhà tuyển dụng/cá nhân có nhu cầu thuê nhân sự ngắn hạn, cho phép đăng tin, tìm kiếm, ứng tuyển, quản lý trạng thái công việc và đánh giá sau khi hoàn thành.
## 1.4. Đối tượng sử dụng (Actor)
Hệ thống được thiết kế hướng tới 3 đối tượng người dùng cốt lõi:
Sinh viên (Student): Người dùng có nhu cầu tìm kiếm việc làm, quản lý hồ sơ, ứng tuyển và theo dõi kết quả.
Nhà tuyển dụng (Employer): Người dùng có nhu cầu thuê nhân sự, thực hiện việc đăng tin, quản lý ứng viên và cập nhật trạng thái tiến độ công việc.
Quản trị viên (Admin): Người điều hành nền tảng, quản lý người dùng và duy trì hoạt động ổn định của hệ thống.

## 1.5. Phạm vi của đề tài
### 1.5.1. Các chức năng trong phạm vi (In-Scope)
Đề tài tập trung giải quyết trọn vẹn luồng nghiệp vụ sau:
Đăng ký/đăng nhập, phân quyền 3 vai trò: Sinh viên, Nhà tuyển dụng, Quản trị viên.
Nhà tuyển dụng đăng tin việc làm part-time với các thông tin: mô tả, thời gian, mức lương, địa điểm.
Sinh viên tìm kiếm, lọc tin theo ngành nghề, địa điểm, mức lương; ứng tuyển kèm hồ sơ (CV/giới thiệu bản thân).
Nhà tuyển dụng xem danh sách ứng viên, duyệt/từ chối ứng tuyển.
Theo dõi trạng thái công việc (đang tuyển, đã nhận người, hoàn thành).
Đánh giá hai chiều sau khi công việc hoàn thành (Sinh viên đánh giá Nhà tuyển dụng và ngược lại).
Thông báo cơ bản khi có cập nhật trạng thái ứng tuyển.
### 1.5.2. Các chức năng ngoài phạm vi (Out-of-Scope)
Để đảm bảo tính khả thi cho đồ án, các tính năng sau không nằm trong phạm vi phát triển:
Thanh toán/giao dịch tiền thật qua cổng thanh toán trực tuyến.
Ứng dụng di động native riêng biệt (chỉ ưu tiên phát triển web responsive).
Chat real-time nâng cao giữa Sinh viên và Nhà tuyển dụng (được đưa vào mục Hướng phát triển).
## 1.6. Công nghệ đề xuất áp dụng
Dự án sẽ áp dụng các công nghệ hiện đại, bám sát yêu cầu thực tiễn của doanh nghiệp:
Backend: Khung làm việc Spring Boot (cung cấp REST API), bảo mật bằng Spring Security kết hợp JWT.
Frontend: Thư viện ReactJS, thiết kế giao diện Web Responsive. (Anh Tuấn phụ trách chính).
Cơ sở dữ liệu: Hệ quản trị cơ sở dữ liệu quan hệ MySQL.
Kiểm thử & Quản lý: Sử dụng Postman để kiểm thử API, Git/GitHub để quản lý mã nguồn phân tán
