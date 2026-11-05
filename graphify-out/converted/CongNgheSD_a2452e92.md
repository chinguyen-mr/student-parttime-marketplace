<!-- converted from CongNgheSD.xlsx -->

## Sheet: Công nghệ sử dụng
| LỰA CHỌN CÔNG NGHỆ CHO WEBSITE MARKETPLACE VIỆC LÀM PART-TIME |
| --- |
| Thành phần | Công nghệ / Công cụ sử dụng | Lý do lựa chọn |
| Frontend | React.js + JavaScript + Tailwind CSS | React.js hỗ trợ xây dựng giao diện theo các thành phần có thể tái sử dụng, thuận tiện phát triển các màn hình dành cho Sinh viên, Nhà tuyển dụng và Admin. JavaScript xử lý tương tác trên trình duyệt và gửi yêu cầu đến backend. Tailwind CSS giúp xây dựng giao diện nhất quán, responsive trên máy tính và điện thoại, đồng thời giảm lượng CSS phải viết thủ công. |
| Backend | Node.js + Express.js + JavaScript | Node.js cho phép chạy JavaScript ở phía máy chủ, giúp nhóm sử dụng cùng một ngôn ngữ lập trình chính ở cả frontend và backend. Express.js hỗ trợ xây dựng RESTful API, định tuyến yêu cầu và xử lý nghiệp vụ như đăng nhập, đăng tin tuyển dụng, tìm kiếm việc làm, tiếp nhận hồ sơ ứng tuyển và cập nhật trạng thái công việc. Cách tiếp cận này phù hợp với ứng dụng web có quy mô dự án sinh viên và giúp nhóm dễ thống nhất kỹ năng phát triển. |
| Database | PostgreSQL | PostgreSQL là hệ quản trị cơ sở dữ liệu quan hệ, phù hợp lưu trữ dữ liệu có liên kết như tài khoản, hồ sơ, tin tuyển dụng, đơn ứng tuyển, trạng thái công việc và đánh giá. Khóa chính, khóa ngoại và các ràng buộc giúp duy trì tính nhất quán của dữ liệu. |
| Quản lý dữ liệu | pgAdmin 4 | pgAdmin 4 cung cấp giao diện đồ họa để kết nối và quản lý PostgreSQL. Nhóm có thể tạo và xem cơ sở dữ liệu, quản lý bảng, kiểm tra dữ liệu và thực thi câu lệnh SQL trong quá trình phát triển. |
| Quản lý mã nguồn | Git + GitHub | Git theo dõi lịch sử thay đổi của mã nguồn và hỗ trợ làm việc với các nhánh. GitHub lưu trữ repository trực tuyến, giúp ba thành viên chia sẻ mã nguồn, xem xét thay đổi, hợp nhất nhánh và phối hợp phát triển dự án. |
## Sheet: Ghi chú
| GHI CHÚ TRIỂN KHAI |
| --- |
| Kiến trúc | React.js gửi yêu cầu HTTP đến RESTful API của Spring Boot; backend xử lý nghiệp vụ và truy cập PostgreSQL. |
| Xác thực | JWT là lựa chọn xác thực; Spring Security cần được cấu hình để kiểm tra danh tính và quyền truy cập ở backend. |
| Maven | Maven quản lý thư viện và build dự án; không phải công cụ kiểm thử tự động. |
| Phạm vi | Bảng mô tả bộ công nghệ nhóm đã chốt; chi tiết triển khai có thể điều chỉnh theo yêu cầu giảng viên. |