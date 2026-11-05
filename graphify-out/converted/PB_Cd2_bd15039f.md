<!-- converted from PB_Cd2.xlsx -->

## Sheet: Product Backlog
| BẢNG KẾ HOẠCH CHI TIẾT   |  |  |  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Giai đoạn # | Buổi # | Tên công việc | Người đảm nhận | Giờ UT | Giờ TT | Trạng thái | Độ ưu tiên | Mô tả chi tiết / Hướng dẫn thực hiện | Tóm tắt nội dung / Steps | Deliverable (Đầu ra kỳ vọng) | Ghi chú / Tham khảo |  |  |
| GIAI ĐOẠN 0: KHỞI ĐỘNG & KẾ HOẠCH |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 0 |  | Phân tích yêu cầu hệ thống |  |  |  |  | HIGH | Đọc kỹ đề bài để hiểu rõ nền tảng web hai chiều (two-sided marketplace). Xác định rõ các tính năng nào bắt buộc phải làm (đăng nhập/đăng ký, đăng tin, tìm kiếm, ứng tuyển, đánh giá) và tính năng nào là tùy chọn (thanh toán thật, app mobile, chat real-time) | Bước 1: Liệt kê các yêu cầu chức năng (Functional Requirements) dựa trên phạm vi đề tài.
Bước 2: Liệt kê các yêu cầu phi chức năng (Non-functional Requirements) như công nghệ sử dụng (Spring Boot, React/Vue, MySQL).
 Bước 3: Thống nhất giới hạn của dự án với giảng viên/nhóm.    | Danh sách thô các yêu cầu chức năng và phi chức năng.    |  |  |  |
| 0 |  | Xác định Actor và Use Case |  |  |  |  | HIGH | Định nghĩa các nhóm người dùng sẽ tương tác với hệ thống và các hành động họ có thể thực hiện | Bước 1: Chốt 3 Actor chính: Sinh viên, Nhà tuyển dụng, Quản trị viên.   
PNG
Bước 2: Vẽ Use Case cho Sinh viên (tìm kiếm, lọc tin, nộp CV, theo dõi trạng thái, đánh giá).   
PNG
Bước 3: Vẽ Use Case cho Nhà tuyển dụng (đăng tin, xem ứng viên, duyệt/từ chối, đánh giá).   
PNG
Bước 4: Tổng hợp thành Biểu đồ Use Case tổng thể. | Danh sách Actor, danh sách Use Case, Biểu đồ Use Case. |  |  |  |
| 0 |  | Xây dựng tài liệu Đặc tả Use Case |  |  |  |  | HIGH | Viết đặc tả chi tiết (Spec) cho 10 luồng nghiệp vụ từ UC-01 đến UC-10 | Bước 1: Lập danh sách 10 UC.
Bước 2: Viết Main flow, Exception flow, Business rules cho từng UC | Bộ tài liệu Use Case Spec 10 UC |  |  |  |
| 0 |  | Thiết lập Ma trận phân quyền |  |  |  |  | HIGH | Định nghĩa quyền truy cập (Xem/Thêm/Sửa/Xóa) của từng Actor trên từng tính năng. | Bước 1: Lập bảng Excel các Role.
Bước 2: Gắn quyền hạn cho từng Role. | Bảng Ma trận phân quyền (RBAC) |  |  |  |
| 0 |  | Lập Product Backlog |  |  |  |  | HIGH | Chuyển đổi các Use Case đã xác định thành các User Story (câu chuyện người dùng) hoặc Task nhỏ gọn để có thể code được | Bước 1: Viết User Story (VD: "Là sinh viên, tôi muốn tìm kiếm việc làm theo mức lương để chọn việc phù hợp").
Bước 2: Đánh giá độ khó/thời gian (Story points/Giờ dự kiến) cho từng hạng mục
Bước 3: Sắp xếp mức độ ưu tiên (Must have, Should have...).    | Bảng Product Backlog |  |  |  |
| 0 |  | Lập kế hoạch Sprint (Sprint Planning) |  |  |  |  | HIGH | Phân bổ các Task từ Product Backlog vào các Sprint tương ứng (từ Sprint 1 đến Sprint 5) sao cho phù hợp với tiến độ số buổi (từ buổi 4 đến buổi 10). | Bước 1: Chọn các Task cốt lõi cho Sprint 1 & 2 (Thiết kế, Database, Auth).
Bước 2: Nhóm các Task tính năng cho Sprint 3 & 4 (Đăng tin, Ứng tuyển, Đánh giá).   Bước 3: Gán người đảm nhận (Assignee) cho từng Task.    | Kế hoạch chi tiết từng Sprint (Sprint Backlog). |  |  |  |
| 0 |  | Hoàn thiện Bản đặc tả yêu cầu (SRS rút gọn) |  |  |  |  | MEDIUM | Gom tất cả các tài liệu đã phân tích ở trên (Yêu cầu, Use Case, Product Backlog) vào một tài liệu chuẩn. | Bước 1: Viết phần Giới thiệu và Phạm vi dự án
Bước 2: Chèn các biểu đồ Use Case và mô tả chi tiết.   Bước 3: Chèn bảng Product Backlog.
Bước 4: Review lại với nhóm và chốt file. | Tài liệu SRS rút gọn hoàn chỉnh (định dạng Word/PDF) để nộp.    |  |  |  |
| GIAI ĐOẠN 1: THIẾT KẾ |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 1 |  | Thiết kế kiến trúc hệ thống |  |  |  |  | HIGH | Dựa vào công nghệ đã đề xuất, xác định kiến trúc tổng thể cho nền tảng web. | Bước 1: Xác định cách thức kết nối giữa Frontend (ReactJS/Vue.js) và Backend (Spring Boot REST API).
Bước 2: Vẽ sơ đồ kiến trúc hệ thống. | Tài liệu thiết kế kiến trúc. |  |  |  |
| 1 |  | Thiết kế Cơ sở dữ liệu (ERD) |  |  |  |  | HIGH | Xây dựng mô hình dữ liệu quan hệ cho toàn bộ hệ thống dựa trên MySQL hoặc PostgreSQL. | Bước 1: Liệt kê các thực thể chính (User, Job, Application, Review...).
Bước 2: Xác định thuộc tính cho từng thực thể và mối quan hệ giữa chúng.
Bước 3: Vẽ biểu đồ ERD.  | Biểu đồ cơ sở dữ liệu (ERD). |  |  |  |
| 1 |  | Xây dựng Từ điển dữ liệu & Mock Data |  |  |  |  | HIGH | Đặc tả chi tiết từng thuộc tính trong CSDL và tạo dữ liệu test. | Bước 1: Mô tả kiểu dữ liệu, ràng buộc.


Bước 2: Tạo bộ dữ liệu mẫu JSON. | Data Dictionary & Mock Data JSON |  |  |  |
| 1 |  | Thiết kế Sơ đồ luồng nghiệp vụ |  |  |  |  | MEDIUM | Làm rõ luồng Đăng tin → Ứng tuyển → Duyệt → Hoàn thành → Đánh giá. | Vẽ Activity Diagram / Flowchart cho các luồng cốt lõi. | Sơ đồ luồng nghiệp vụ |  |  |  |
| 1 |  | Thiết kế API contract |  |  |  |  | HIGH | Chuẩn hóa các giao tiếp giữa Frontend và Backend bằng cách định nghĩa trước các API. | Bước 1: Lên danh sách các REST API cần thiết cho các chức năng (đăng nhập, tạo tin, ứng tuyển...).
Bước 2: Viết đặc tả cho từng API (Endpoint, Method, Request Body, Response).    | Tài liệu API contract |  |  |  |
| 1 |  | Thiết kế Wireframe UI |  |  |  |  | LOW | Phác thảo giao diện người dùng cơ bản, đảm bảo tính responsive cho nền tảng web. | Bước 1: Vẽ layout cho trang chủ, trang đăng nhập/đăng ký.
Bước 2: Vẽ layout cho các trang của Sinh viên (tìm việc, nộp hồ sơ, đánh giá) và Nhà tuyển dụng (đăng tin, duyệt ứng viên).    | Bản thiết kế wireframe cho các màn hình chính. |  |  |  |
| 1 |  | Thiết kế Prototype (Bản mẫu tương tác) |  |  |  |  | LOW | Chuyển đổi Wireframe tĩnh thành mô hình có thể click/tương tác được. | Bước 1: Liên kết các màn hình Wireframe lại với nhau.
Bước 2: Cài đặt các hiệu ứng chuyển trang cơ bản. | Prototype tương tác (Link Figma) |  |  |  |
| GIAI ĐOẠN 2: PHÁT TRIỂN MODULE CƠ BẢN |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 2 |  | Xây dựng chức năng đăng ký/đăng nhập & Phân quyền |  |  |  |  | HIGH | Hiện thực hóa tính năng xác thực và phân quyền cho 3 vai trò (Sinh viên, Nhà tuyển dụng, Quản trị viên) | Bước 1: Code Backend sử dụng Spring Security + JWT cho chức năng Auth.
Bước 2: Code UI đăng nhập, đăng ký cho Frontend.
Bước 3: Tích hợp và xử lý phân quyền hiển thị giao diện theo vai trò.  | Module Auth hoàn chỉnh. |  |  |  |
| 2 |  | Xây dựng chức năng quản lý hồ sơ SV/NTD |  |  |  |  | HIGH | Xây dựng trang thông tin cá nhân để người dùng cập nhật dữ liệu của mình (SV cập nhật CV, NTD cập nhật thông tin doanh nghiệp). | Bước 1: Xây dựng API và UI cho Sinh viên cập nhật CV/giới thiệu bản thân.
Bước 2: Xây dựng API và UI cho Nhà tuyển dụng cập nhật thông tin doanh nghiệp/cá nhân. | Module quản lý hồ sơ hoạt động. |  |  |  |
| 2 |  | Xây dựng chức năng quản lý tài khoản cho Quản trị viên |  |  |  |  | MEDIUM | Chức năng dành cho Quản trị viên để xem danh sách và kiểm soát tài khoản người dùng trên nền tảng (Khóa/Mở khóa các tài khoản vi phạm). | Bước 1: Code API lấy danh sách toàn bộ người dùng (SV và NTD).
Bước 2: Xây dựng giao diện danh sách User trên trang Admin.
Bước 3: Code chức năng "Change Status" (Khóa/Mở khóa) tài khoản và xử lý logic chặn đăng nhập đối với tài khoản bị khóa. | Module quản trị tài khoản cơ bản hoạt động. |  |  |  |
| GIAI ĐOẠN 3: PHÁT TRIỂN MODULE CỐT LÕI |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 3 |  | Xây dựng chức năng đăng tin |  |  |  |  | HIGH | Chức năng dành riêng cho Nhà tuyển dụng để đưa thông tin việc làm part-time lên nền tảng. | Bước 1: Code form nhập liệu bao gồm: mô tả, thời gian, mức lương, địa điểm.
Bước 2: Xử lý lưu dữ liệu xuống database. | Chức năng đăng tin hoạt động. |  |  |  |
| 3 |  | Xây dựng chức năng tìm kiếm/lọc tin và ứng tuyển |  |  |  |  | HIGH | Các tính năng cốt lõi giúp Sinh viên tiếp cận và nộp hồ sơ vào công việc. | Bước 1: Xây dựng bộ lọc công việc theo ngành nghề, địa điểm, mức lương.
Bước 2: Code UI và luồng API cho phép Sinh viên bấm ứng tuyển, đính kèm CV.    | Module tìm kiếm, lọc tin và ứng tuyển hoạt động. |  |  |  |
| 3 |  | Xây dựng chức năng kiểm duyệt tin & danh mục |  |  |  |  | MEDIUM | Chức năng cho Quản trị viên kiểm soát tin đăng để duy trì chất lượng nền tảng và quản lý danh mục hệ thống. | Bước 1: Xây dựng UI và API cho Admin xem danh sách tin, thực hiện duyệt hoặc ẩn tin rác/không hợp lệ.
Bước 2: Code chức năng (CRUD) thêm/sửa/xóa danh mục ngành nghề, địa điểm. | Hệ thống kiểm duyệt nội dung hoạt động. |  |  |  |
| GIAI ĐOẠN 4: HOÀN THIỆN & KIỂM THỬ |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 4 |  | Hoàn thiện quản lý trạng thái ứng tuyển |  |  |  |  | HIGH | Xây dựng quy trình theo dõi và xử lý hồ sơ sau khi sinh viên đã nộp.    | Bước 1: Xây dựng giao diện cho NTD xem danh sách ứng viên, thao tác duyệt/từ chối.   Bước 2: Code hệ thống theo dõi trạng thái công việc (đang tuyển, đã nhận người, hoàn thành).
Bước 3: Thêm tính năng thông báo cơ bản khi có cập nhật trạng thái. | Luồng quản lý trạng thái ứng tuyển hoàn chỉnh. |  |  |  |
| 4 |  | Xây dựng chức năng đánh giá sau công việc |  |  |  |  | MEDIUM | Chức năng đánh giá hai chiều giúp tăng độ uy tín cho nền tảng. | Bước 1: Code UI và API cho Sinh viên đánh giá NTD sau khi xong việc.
Bước 2: Code UI và API cho NTD đánh giá lại Sinh viên. | Module đánh giá hoàn chỉnh. |  |  |  |
| 4 |  | Viết Kịch bản kiểm thử |  |  |  |  | HIGH | Xây dựng bộ kịch bản test chi tiết để đảm bảo hệ thống phủ kín các luồng nghiệp vụ cốt lõi trước khi nghiệm thu. | Bước 1: Viết kịch bản test cho các luồng chính và luồng ngoại lệ (Auth, Đăng tin, Ứng tuyển).
Bước 2: Tổng hợp thành file Excel Test Cases. | File Excel Kịch bản kiểm thử. |  |  |  |
| 4 |  | Kiểm thử (unit/integration test) và Sửa lỗi |  |  |  |  | MEDIUM | Test lại toàn bộ các chức năng đã code từ đầu dự án và fix bugs.    | Bước 1: Chạy Unit/Integration test cho Backend.
Bước 2: Dùng Postman để kiểm thử các API.
Bước 3: Phát hiện và sửa các lỗi (bugs).    | Kết quả kiểm thử & Hệ thống sạch lỗi. |  |  |  |
| GIAI ĐOẠN 5: TRIỂN KHAI & BÁO CÁO |  |  |  |  |  |  |  |  |  |  |  |  |  |
| 5 |  | Triển khai sản phẩm (deploy) |  |  |  |  | HIGH | Đưa ứng dụng web lên môi trường server/cloud để người dùng thật có thể truy cập. | Bước 1: Setup database, backend và frontend trên server.
Bước 2: Chạy thử luồng sản phẩm trên môi trường live. | Sản phẩm chạy được trên môi trường thực tế. |  |  |  |
| 5 |  | Soạn Tài liệu hướng dẫn sử dụng (User Manual) |  |  |  |  | MEDIUM | Viết tài liệu hướng dẫn thao tác cụ thể trên hệ thống cho người dùng cuối (Sinh viên, Nhà tuyển dụng, Quản trị viên). | Bước 1: Chụp ảnh màn hình thực tế các luồng chức năng.
Bước 2: Viết tài liệu hướng dẫn chi tiết từng bước sử dụng ra file Word. | Tài liệu Hướng dẫn sử dụng (User Manual). |  |  |  |
| 5 |  | Hoàn thiện báo cáo và Tập dượt bảo vệ |  |  |  |  | HIGH | Hoàn thiện hồ sơ dự án và chuẩn bị cho buổi bảo vệ cuối kỳ.    | Bước 1: Viết tài liệu báo cáo tổng kết hoàn chỉnh.
Bước 2: Chuẩn bị slide thuyết trình
Bước 3: Cả nhóm tập dượt bảo vệ và demo sản phẩm. | Báo cáo hoàn thiện & Slide thuyết trình. |  |  |  |
## Sheet: P0
| Feature (Giai đoạn) | PBI / User Story (5 công việc chính) | Task (Tác vụ chi tiết) | Deliverable (Đầu ra) | Độ ưu tiên |
| --- | --- | --- | --- | --- |
| Khởi động & Kế hoạch (Sprint 0) | PBI 1: Là một Thành viên nhóm, tôi muốn phân tích yêu cầu hệ thống để chốt được phạm vi các tính năng bắt buộc và mở rộng. | Task 1.1: Liệt kê các yêu cầu chức năng (trong và ngoài phạm vi). | Danh sách yêu cầu hệ thống | Cao |
|  |  | Task 1.2: Liệt kê các yêu cầu công nghệ (Backend, Frontend, DB). |  |  |
|  | PBI 2: Là một Thành viên nhóm, tôi muốn xác định Actor và Use Case để làm rõ luồng tương tác của từng đối tượng. | Task 2.1: Xác định quyền hạn của 3 Actor: Sinh viên, NTD, Admin. | Biểu đồ Use Case | Cao |
|  |  | Task 2.2: Liệt kê Use Case cho từng Actor và tổng hợp thành biểu đồ. |  |  |
|  | PBI 3: Là một Quản lý dự án, tôi muốn lập Product Backlog để chia nhỏ Use Case thành các task có thể code được. | Task 3.1: Chuyển đổi Use Case thành các User Story chi tiết. | Bảng Product Backlog | Cao |
|  |  | Task 3.2: Đánh giá độ khó và sắp xếp mức độ ưu tiên cho các task. |  |  |
|  | PBI 4: Là một Quản lý dự án, tôi muốn lập kế hoạch Sprint để phân bổ chính xác tiến độ từ buổi 4 đến buổi 10. | Task 4.1: Phân bổ các Task từ Backlog vào Sprint 1 đến Sprint 5. | Kế hoạch chi tiết từng Sprint | Cao |
|  |  | Task 4.2: Khởi tạo project trên Azure DevOps và gán người đảm nhận (Assignee). |  |  |
|  | PBI 5: Là một Thành viên nhóm, tôi muốn viết Bản đặc tả yêu cầu (SRS rút gọn) để có tài liệu chuẩn bị cho bước Thiết kế. | Task 5.1: Tổng hợp phạm vi, Use Case, Backlog vào tài liệu chuẩn. | Bản đặc tả yêu cầu (SRS rút gọn) | Trung bình |
|  |  | Task 5.2: Review tài liệu cùng nhóm và xuất file PDF. |  |  |
## Sheet: P1
| Feature (Giai đoạn) | PBI / User Story (Công việc chính theo đề bài) | Task (Tác vụ chi tiết) | Deliverable (Đầu ra kỳ vọng) | Độ ưu tiên |
| --- | --- | --- | --- | --- |
| THIẾT KẾ (Sprint 1 - Buổi 4–5) | PBI 1: Là một Tech Lead, tôi muốn thiết kế kiến trúc hệ thống để định hình luồng kết nối giữa Frontend và Backend. | Task 1.1: Lên sơ đồ kiến trúc tổng thể (Spring Boot, React/Vue). | Tài liệu thiết kế kiến trúc | Cao |
|  | PBI 2: Là một Backend Developer, tôi muốn thiết kế CSDL (ERD) để tổ chức lưu trữ dữ liệu an toàn và tối ưu. | Task 2.1: Liệt kê thực thể (User, Job, App...) và vẽ quan hệ (ERD). | Bản vẽ ERD hoàn chỉnh | Cao |
|  |  | Task 2.2: Viết script khởi tạo bảng trên MySQL/PostgreSQL. |  | Cao |
|  | PBI 3: Là một Developer, tôi muốn thiết kế API contract để đội Frontend và Backend có thể làm việc độc lập. | Task 3.1: Đặc tả các API (Endpoint, Method, Request, Response). | Tài liệu API contract (Postman/Swagger) | Cao |
|  | PBI 4: Là một UI/UX Designer, tôi muốn thiết kế wireframe UI để làm bản mẫu cho việc lập trình giao diện. | Task 4.1: Vẽ layout các trang cơ bản: Login, Trang chủ, Quản lý. | Các bản vẽ Wireframe | Trung bình |
## Sheet: P2
| Feature (Giai đoạn) | PBI / User Story (Công việc chính theo đề bài) | Task (Tác vụ chi tiết) | Deliverable (Đầu ra kỳ vọng) | Độ ưu tiên |
| --- | --- | --- | --- | --- |
| XÂY DỰNG MODULE CƠ BẢN (Sprint 2 - Buổi 6) | PBI 5: Là một Người dùng, tôi muốn đăng ký/đăng nhập và được phân quyền để sử dụng hệ thống an toàn theo đúng vai trò. | Task 5.1: Code API Auth (Spring Security, JWT). | Module Auth hoạt động | Cao |
|  | PBI 5: Là một Người dùng, tôi muốn đăng ký/đăng nhập và được phân quyền để sử dụng hệ thống an toàn theo đúng vai trò. | Task 5.2: Code form UI Login/Register. |  | Cao |
|  | PBI 5: Là một Người dùng, tôi muốn đăng ký/đăng nhập và được phân quyền để sử dụng hệ thống an toàn theo đúng vai trò. | Task 5.3: Cấu hình Route Guard bảo vệ các trang theo Role. |  | Cao |
|  | PBI 6: Là một Người dùng (SV/NTD), tôi muốn quản lý hồ sơ cá nhân/doanh nghiệp để cung cấp thông tin uy tín khi ứng tuyển/tuyển dụng. | Task 6.1: Code UI/API cho SV cập nhật CV, giới thiệu bản thân. | Module quản lý hồ sơ hoạt động | Cao |
|  | PBI 6: Là một Người dùng (SV/NTD), tôi muốn quản lý hồ sơ cá nhân/doanh nghiệp để cung cấp thông tin uy tín khi ứng tuyển/tuyển dụng. | Task 6.2: Code UI/API cho NTD cập nhật thông tin. |  | Cao |
## Sheet: P3
| Feature (Giai đoạn) | PBI / User Story (Công việc chính theo đề bài) | Task (Tác vụ chi tiết) | Deliverable (Đầu ra kỳ vọng) | Độ ưu tiên |
| --- | --- | --- | --- | --- |
| XÂY DỰNG MODULE CỐT LÕI (Sprint 3 - Buổi 7) | PBI 7: Là một Nhà tuyển dụng, tôi muốn đăng tin việc làm để tìm kiếm sinh viên phù hợp. | Task 7.1: Code giao diện nhập liệu (Mô tả, lương, thời gian...). | Tính năng đăng tin hoạt động | Cao |
|  | PBI 7: Là một Nhà tuyển dụng, tôi muốn đăng tin việc làm để tìm kiếm sinh viên phù hợp. | Task 7.2: Code API lưu tin vào cơ sở dữ liệu. |  | Cao |
|  | PBI 8: Là một Sinh viên, tôi muốn tìm kiếm/lọc tin việc làm để chọn công việc đúng nhu cầu. | Task 8.1: Viết câu truy vấn (Query) lọc theo ngành nghề, địa điểm. | Tính năng tìm kiếm/lọc tin hoạt động | Cao |
|  | PBI 8: Là một Sinh viên, tôi muốn tìm kiếm/lọc tin việc làm để chọn công việc đúng nhu cầu. | Task 8.2: Code thanh tìm kiếm và hiển thị danh sách trên UI. |  | Cao |
|  | PBI 9: Là một Sinh viên, tôi muốn ứng tuyển vào công việc để có cơ hội nhận việc làm thêm. | Task 9.1: Code nút "Ứng tuyển" và API ghi nhận hồ sơ ứng tuyển. | Chức năng ứng tuyển hoạt động | Cao |
## Sheet: P4
| Feature (Giai đoạn) | PBI / User Story (Công việc chính theo đề bài) | Task (Tác vụ chi tiết) | Deliverable (Đầu ra kỳ vọng) | Độ ưu tiên |
| --- | --- | --- | --- | --- |
| HOÀN THIỆN & KIỂM THỬ (Sprint 4 - Buổi 8) | PBI 10: Là một Tester/Developer, tôi muốn kiểm thử (unit/integration test) để đảm bảo code không có lỗi logic. | Task 10.1: Viết kịch bản test và chạy test trên Backend. | Kết quả test report | Cao |
|  | PBI 10: Là một Tester/Developer, tôi muốn kiểm thử (unit/integration test) để đảm bảo code không có lỗi logic. | Task 10.2: Kiểm thử các API bằng Postman. |  | Cao |
|  | PBI 11: Là một Nhà tuyển dụng, tôi muốn quản lý trạng thái ứng tuyển để duyệt/từ chối sinh viên và báo kết quả. | Task 11.1: Code UI danh sách ứng viên và tính năng Duyệt/Từ chối. | Luồng quản lý trạng thái hoàn chỉnh | Cao |
|  | PBI 11: Là một Nhà tuyển dụng, tôi muốn quản lý trạng thái ứng tuyển để duyệt/từ chối sinh viên và báo kết quả. | Task 11.2: Code logic cập nhật trạng thái (Đang tuyển/Hoàn thành). |  | Cao |
|  | PBI 11: Là một Nhà tuyển dụng, tôi muốn quản lý trạng thái ứng tuyển để duyệt/từ chối sinh viên và báo kết quả. | Task 11.3: Setup thông báo cơ bản khi cập nhật trạng thái. |  | Cao |
|  | PBI 12: Là một Người dùng, tôi muốn đánh giá đối tác sau công việc để xây dựng độ uy tín hai chiều trên hệ thống. | Task 12.1: Code UI/API cho tính năng chấm điểm, nhận xét. | Module đánh giá hoàn chỉnh | Thấp |
|  | PBI 13: Là một Developer, tôi muốn sửa lỗi (Fix bug) để hoàn thiện sản phẩm trước khi đưa lên mạng. | Task 13.1: Fix các bug phát sinh sau khi chạy Test. | Hệ thống sạch lỗi | Cao |
## Sheet: P5
| Feature (Giai đoạn) | PBI / User Story (Công việc chính theo đề bài) | Task (Tác vụ chi tiết) | Deliverable (Đầu ra kỳ vọng) | Độ ưu tiên |
| --- | --- | --- | --- | --- |
| TRIỂN KHAI & BÁO CÁO (Sprint 5 - Buổi 9–10) | PBI 14: Là một Thành viên nhóm, tôi muốn triển khai sản phẩm (deploy) để mọi người có thể truy cập qua Internet. | Task 14.1: Cấu hình và đưa Database, Backend, Frontend lên Server. | Sản phẩm chạy được (Live URL) | Cao |
|  | PBI 15: Là một Thành viên nhóm, tôi muốn hoàn thiện báo cáo để có tài liệu nộp cho hội đồng. | Task 15.1: Đóng cuốn báo cáo chi tiết các phần đã làm. | Báo cáo hoàn thiện | Cao |
|  | PBI 16: Là một Thành viên nhóm, tôi muốn tập dượt bảo vệ để trình bày trôi chảy trong ngày bảo vệ thật. | Task 16.1: Làm slide thuyết trình và chuẩn bị kịch bản demo. | Sẵn sàng bảo vệ | Trung bình |
|  | PBI 16: Là một Thành viên nhóm, tôi muốn tập dượt bảo vệ để trình bày trôi chảy trong ngày bảo vệ thật. | Task 16.2: Demo nháp với nhóm. |  | Trung bình |