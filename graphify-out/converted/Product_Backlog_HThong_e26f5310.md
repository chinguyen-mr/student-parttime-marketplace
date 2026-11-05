<!-- converted from Product_Backlog_HThong.xlsx -->

## Sheet: Product Backlog
| Backlog ID | Category | Actor | Epics | Backlog item | User story | Story Point | Priority | Sprint # | Acceptance Criteria | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PB-01 | Function | Sinh viên | Xác thực và phân quyền | Đăng ký tài khoản Sinh viên | Là Sinh viên, tôi muốn đăng ký tài khoản để có thể sử dụng các chức năng tìm kiếm, ứng tuyển và quản lý hồ sơ. | 18 | High | 2 | AC1: Sinh viên có thể mở biểu mẫu đăng ký tài khoản.
AC2: Hệ thống kiểm tra các trường bắt buộc và tính hợp lệ của dữ liệu trước khi tạo tài khoản.
AC3: Nếu thông tin tài khoản đã tồn tại, hệ thống từ chối tạo trùng và thông báo phù hợp.
AC4: Khi dữ liệu hợp lệ, hệ thống tạo tài khoản và thông báo kết quả thành công.
AC5: Tài khoản được gán vai trò Sinh viên theo quy tắc phân quyền.
AC6: Mật khẩu được băm khi lưu theo NFR-02. | Chưa thực hiện |
| PB-02 | Function |  |  | Đăng nhập hệ thống – Sinh viên | Là Sinh viên có tài khoản, tôi muốn đăng nhập để truy cập các chức năng được cấp cho vai trò Sinh viên. | 18 | High | 2 | AC1: Sinh viên có thể mở biểu mẫu đăng nhập.
AC2: Khi thông tin xác thực hợp lệ, hệ thống cho phép Sinh viên đăng nhập.
AC3: Khi thông tin xác thực không hợp lệ, hệ thống từ chối đăng nhập và hiển thị thông báo phù hợp.
AC4: Sau khi đăng nhập, Sinh viên chỉ truy cập được chức năng được cấp cho vai trò Sinh viên.
AC5: API đăng nhập đáp ứng giới hạn hiệu năng theo NFR-01 và cơ chế bảo mật theo NFR-02. | Chưa thực hiện |
| PB-03 | Function |  |  | Đăng xuất hệ thống – Sinh viên | Là Sinh viên đang đăng nhập, tôi muốn đăng xuất để kết thúc phiên sử dụng của mình. | 12 | High | 2 | AC1: Sinh viên đã đăng nhập có thể chọn chức năng Đăng xuất.
AC2: Hệ thống kết thúc phiên hoặc trạng thái xác thực hiện tại theo cơ chế được triển khai.
AC3: Sau khi đăng xuất, tác nhân trở về trạng thái chưa đăng nhập.
AC4: Chức năng yêu cầu xác thực không thể tiếp tục được truy cập bằng phiên đã kết thúc. | Chưa thực hiện |
| PB-04 | Function |  |  | Đổi mật khẩu | Là Sinh viên quên mật khẩu, tôi muốn lấy lại mật khẩu thông qua Email để khôi phục quyền truy cập vào tài khoản. |  | High | 2 | AC1: Hiển thị form yêu cầu nhập Email khôi phục.
AC2: Báo lỗi rõ ràng nếu Email chưa từng được đăng ký trong hệ thống.
AC3: Hệ thống gửi Email chứa mã OTP hoặc link đặt lại mật khẩu (có thời hạn sử dụng).
AC4: Cho phép đặt lại mật khẩu thành công nếu mã/link hợp lệ và mật khẩu mới đạt chuẩn bảo mật (tối thiểu 8 ký tự).
AC5: Mật khẩu mới bắt buộc phải được băm (hash) trước khi lưu. | Chưa thực hiện |
| PB-05 | Function |  |  | Phân quyền truy cập – Sinh viên | Là Sinh viên, tôi muốn hệ thống chỉ cho phép truy cập các chức năng phù hợp với vai trò của mình để bảo vệ dữ liệu và thao tác nghiệp vụ. | 30 | High | 2 | AC1: Hệ thống chỉ cho phép Sinh viên truy cập chức năng được cấp cho vai trò Sinh viên.
AC2: Sinh viên không thể thực hiện thao tác chỉ dành cho Nhà tuyển dụng hoặc Quản trị viên.
AC3: Yêu cầu không đủ quyền bị từ chối và không làm thay đổi dữ liệu nghiệp vụ.
AC4: API được bảo vệ bằng cơ chế xác thực theo NFR-02. | Chưa thực hiện |
| PB-06 | Function | Nhà tuyển dụng |  | Đăng ký tài khoản Nhà tuyển dụng | Là Nhà tuyển dụng, tôi muốn đăng ký tài khoản để đăng tin tuyển dụng và quản lý ứng viên. | 18 | High | 2 | AC1: Nhà tuyển dụng có thể mở biểu mẫu đăng ký tài khoản.
AC2: Hệ thống kiểm tra các trường bắt buộc và tính hợp lệ của dữ liệu trước khi tạo tài khoản.
AC3: Nếu thông tin tài khoản đã tồn tại, hệ thống từ chối tạo trùng và thông báo phù hợp.
AC4: Khi dữ liệu hợp lệ, hệ thống tạo tài khoản với vai trò Nhà tuyển dụng và thông báo kết quả.
AC5: Tài khoản không được tự gán vai trò Quản trị viên qua biểu mẫu đăng ký thông thường.
AC6: Mật khẩu được băm khi lưu theo NFR-02. | Chưa thực hiện |
| PB-07 | Function |  |  | Phân quyền truy cập – Nhà tuyển dụng | Là Nhà tuyển dụng, tôi muốn hệ thống chỉ cho phép truy cập các chức năng phù hợp với vai trò của mình để bảo vệ dữ liệu và thao tác nghiệp vụ. | 30 | High | 2 | AC1: Hệ thống chỉ cho phép Nhà tuyển dụng truy cập chức năng được cấp cho vai trò Nhà tuyển dụng.
AC2: Nhà tuyển dụng chỉ quản lý tin tuyển dụng và ứng viên thuộc phạm vi tài khoản được cấp quyền.
AC3: Nhà tuyển dụng không thể thực hiện thao tác chỉ dành cho Sinh viên hoặc Quản trị viên.
AC4: Yêu cầu không đủ quyền bị từ chối và không làm thay đổi dữ liệu nghiệp vụ.
AC5: API được bảo vệ bằng cơ chế xác thực theo NFR-02. | Chưa thực hiện |
| PB-08 | Function |  |  | Đăng nhập hệ thống – Nhà tuyển dụng | Là Nhà tuyển dụng có tài khoản, tôi muốn đăng nhập để truy cập các chức năng được cấp cho vai trò Nhà tuyển dụng. | 18 | High | 2 | AC1: Nhà tuyển dụng có thể mở biểu mẫu đăng nhập.
AC2: Khi thông tin xác thực hợp lệ, hệ thống cho phép Nhà tuyển dụng đăng nhập.
AC3: Khi thông tin xác thực không hợp lệ, hệ thống từ chối đăng nhập và hiển thị thông báo phù hợp.
AC4: Sau khi đăng nhập, Nhà tuyển dụng chỉ truy cập được chức năng được cấp cho vai trò Nhà tuyển dụng.
AC5: API đăng nhập đáp ứng giới hạn hiệu năng theo NFR-01 và cơ chế bảo mật theo NFR-02. | Chưa thực hiện |
| PB-09 | Function |  |  | Đăng xuất hệ thống – Nhà tuyển dụng | Là Nhà tuyển dụng đang đăng nhập, tôi muốn đăng xuất để kết thúc phiên sử dụng của mình. | 12 | High | 2 | AC1: Nhà tuyển dụng đã đăng nhập có thể chọn chức năng Đăng xuất.
AC2: Hệ thống kết thúc phiên hoặc trạng thái xác thực hiện tại theo cơ chế được triển khai.
AC3: Sau khi đăng xuất, tác nhân trở về trạng thái chưa đăng nhập.
AC4: Chức năng yêu cầu xác thực không thể tiếp tục được truy cập bằng phiên đã kết thúc. | Chưa thực hiện |
| PB-10 | Function |  |  | Đổi mật khẩu | Là Nhà tuyển dụng quên mật khẩu, tôi muốn lấy lại mật khẩu thông qua Email để khôi phục quyền truy cập vào tài khoản. |  | High | 2 | AC1: Hiển thị form yêu cầu nhập Email khôi phục.
AC2: Báo lỗi rõ ràng nếu Email chưa từng được đăng ký trong hệ thống.
AC3: Hệ thống gửi Email chứa mã OTP hoặc link đặt lại mật khẩu (có thời hạn sử dụng).
AC4: Cho phép đặt lại mật khẩu thành công nếu mã/link hợp lệ và mật khẩu mới đạt chuẩn bảo mật (tối thiểu 8 ký tự).
AC6: Mật khẩu mới bắt buộc phải được băm (hash) trước khi lưu. | Chưa thực hiện |
| PB-11 | Function | Quản trị viên |  | Đăng nhập hệ thống – Quản trị viên | Là Quản trị viên có tài khoản, tôi muốn đăng nhập để truy cập các chức năng được cấp cho vai trò Quản trị viên. | 18 | High | 2 | AC1: Quản trị viên có thể mở biểu mẫu đăng nhập bằng tài khoản quản trị được cấp.
AC2: Khi thông tin xác thực hợp lệ, hệ thống cho phép Quản trị viên đăng nhập.
AC3: Khi thông tin xác thực không hợp lệ, hệ thống từ chối đăng nhập và hiển thị thông báo phù hợp.
AC4: Sau khi đăng nhập, Quản trị viên chỉ truy cập chức năng quản trị được cấp.
AC5: API đăng nhập đáp ứng giới hạn hiệu năng theo NFR-01 và cơ chế bảo mật theo NFR-02. | Chưa thực hiện |
| PB-12 | Function |  |  | Đăng xuất hệ thống – Quản trị viên | Là Quản trị viên đang đăng nhập, tôi muốn đăng xuất để kết thúc phiên sử dụng của mình. | 12 | High | 2 | AC1: Quản trị viên đã đăng nhập có thể chọn chức năng Đăng xuất.
AC2: Hệ thống kết thúc phiên hoặc trạng thái xác thực hiện tại theo cơ chế được triển khai.
AC3: Sau khi đăng xuất, tác nhân trở về trạng thái chưa đăng nhập.
AC4: Chức năng yêu cầu xác thực không thể tiếp tục được truy cập bằng phiên đã kết thúc. | Chưa thực hiện |
| PB-13 | Function | Nhà tuyển dụng | Quản lý tin tuyển dụng | Đăng tin tuyển dụng part-time | Là Nhà tuyển dụng, tôi muốn đăng tin có mô tả, thời gian, mức lương và địa điểm để tìm ứng viên phù hợp. | 30 | High | 3 | AC1: Chỉ Nhà tuyển dụng đã đăng nhập và có quyền phù hợp mới được đăng tin.
AC2: Biểu mẫu bao gồm các trường theo FR-02: mô tả công việc, thời gian, mức lương và địa điểm.
AC3: Hệ thống kiểm tra dữ liệu bắt buộc và tính hợp lệ trước khi lưu.
AC4: Khi dữ liệu hợp lệ, hệ thống lưu tin và thông báo kết quả.
AC5: Khi dữ liệu thiếu/sai, hệ thống không lưu tin và chỉ rõ thông tin cần sửa.
AC6: Tin được hiển thị theo cơ chế kiểm duyệt/điều kiện hiển thị của hệ thống. | Chưa thực hiện |
| PB-14 | Function |  |  |  Đóng/Chỉnh sửa tin tuyển dụng | Là Nhà tuyển dụng, tôi muốn chỉnh sửa thông tin hoặc đóng tin tuyển dụng sớm để quản lý chính xác nhu cầu nhân sự. |  | High | 3 | AC1: Chỉ Nhà tuyển dụng tạo ra tin đó mới thấy nút Sửa/Đóng.
AC2: Form chỉnh sửa validate dữ liệu y hệt lúc đăng tin mới (Không được để trống, thời gian không ở quá khứ).
AC3: Bấm nút "Đóng tin" → trạng thái Job đổi thành "Đã đóng".
AC4: Job "Đã đóng" lập tức biến mất khỏi trang tìm kiếm của Sinh viên.
AC5: Khóa chức năng chỉnh sửa nếu Job đã ở trạng thái "Đã nhận người" hoặc "Hoàn thành". | Chưa thực hiện |
| PB-15 | Function | Sinh viên | Tìm kiếm việc làm | Tìm kiếm tin tuyển dụng | Là Sinh viên, tôi muốn tìm kiếm tin tuyển dụng để tìm công việc part-time phù hợp. | 18 | High | 3 | AC1: Hệ thống hiển thị các tin tuyển dụng đủ điều kiện hiển thị.
AC2: Sinh viên có thể yêu cầu tìm kiếm tin tuyển dụng theo các tiêu chí được hệ thống hỗ trợ.
AC3: Các tiêu chí tìm kiếm/lọc được hỗ trợ phải nhất quán với FR-03: ngành nghề, địa điểm và mức lương.
AC4: Hệ thống trả về danh sách phù hợp với tiêu chí đã chọn.
AC5: Khi không có kết quả, hệ thống hiển thị trạng thái rỗng rõ ràng.
AC6: Không bắt buộc đăng nhập để tìm kiếm theo UC-05.
AC7: API tìm kiếm phản hồi không quá 1,5 giây khi tải bình thường theo NFR-01. | Chưa thực hiện |
| PB-16 | Function |  |  | Lọc tin theo ngành nghề, địa điểm và mức lương | Là Sinh viên, tôi muốn lọc tin theo ngành nghề, địa điểm và mức lương để thu hẹp danh sách công việc phù hợp. | 30 | High | 3 | AC1: Hệ thống cung cấp bộ lọc ngành nghề, địa điểm và mức lương.
AC2: Kết quả chỉ hiển thị các tin đáp ứng các điều kiện lọc đã chọn.
AC3: Khi kết hợp nhiều điều kiện, kết quả đáp ứng đồng thời các điều kiện đã chọn.
AC4: Khi không có tin phù hợp, hệ thống hiển thị trạng thái không có kết quả.
AC5: API tìm kiếm/lọc phản hồi không quá 1,5 giây khi tải bình thường theo NFR-01. | Chưa thực hiện |
| PB-17 | Function |  |  | Hiển thị chi tiết tin tuyển dụng (bước trong tìm kiếm/ứng tuyển) | Là Sinh viên, tôi muốn xem chi tiết tin tuyển dụng để đánh giá công việc có phù hợp trước khi ứng tuyển. | 12 | High | 3 | AC1: Sinh viên có thể mở trang chi tiết của tin tuyển dụng đủ điều kiện hiển thị.
AC2: Trang chi tiết hiển thị các thông tin được quy định trong FR-02: mô tả công việc, thời gian, mức lương và địa điểm.
AC3: Nếu tin không tồn tại hoặc không còn được phép hiển thị, hệ thống thông báo phù hợp.
AC4: Từ trang chi tiết, Sinh viên có thể tiếp tục luồng ứng tuyển nếu tin còn nhận hồ sơ.
AC5: Đây là bước trong UC-05/UC-06, không phải Use Case độc lập. | Chưa thực hiện |
| PB-18 | Function |  | Ứng tuyển việc làm | Nộp đơn ứng tuyển kèm CV hoặc giới thiệu bản thân | Là Sinh viên, tôi muốn ứng tuyển kèm CV hoặc đoạn giới thiệu bản thân để Nhà tuyển dụng xem xét hồ sơ. | 30 | High | 3 | AC1: Sinh viên phải đăng nhập trước khi ứng tuyển.
AC2: Chỉ cho phép ứng tuyển vào tin còn hiệu lực và đang cho phép ứng tuyển.
AC3: Hồ sơ ứng tuyển có CV hoặc đoạn giới thiệu bản thân theo FR-04.
AC4: Hệ thống kiểm tra dữ liệu trước khi tiếp nhận đơn.
AC5: Khi hợp lệ, hệ thống lưu đơn với trạng thái chờ xử lý/duyệt theo UC-06.
AC6: Nếu Sinh viên đã ứng tuyển vào cùng tin trước đó, hệ thống không tạo đơn trùng theo quy tắc UC-06.
AC7: API Ứng tuyển phản hồi không quá 1,5 giây khi tải bình thường theo NFR-01. | Chưa thực hiện |
| PB-19 | Function | Nhà tuyển dụng | Quản lý ứng viên | Xem danh sách ứng viên | Là Nhà tuyển dụng, tôi muốn xem các hồ sơ ứng tuyển vào tin của mình để đánh giá và đưa ra quyết định. | 18 | High | 3 | AC1: Nhà tuyển dụng xem được danh sách đơn ứng tuyển của tin thuộc quyền quản lý của mình.
AC2: Nhà tuyển dụng có thể mở thông tin/CV/giới thiệu mà ứng viên đã gửi để xem xét.
AC3: Nhà tuyển dụng không thể xem danh sách ứng viên của tin không thuộc quyền quản lý.
AC4: Nếu chưa có ứng viên, hệ thống hiển thị trạng thái danh sách rỗng.
AC5: Dữ liệu hiển thị phải phản ánh các đơn ứng tuyển đã lưu. | Chưa thực hiện |
| PB-20 | Function |  |  | Duyệt đơn ứng tuyển | Là Nhà tuyển dụng, tôi muốn duyệt đơn ứng tuyển để cập nhật kết quả xét duyệt cho Sinh viên. | 18 | High | 3 | AC1: Nhà tuyển dụng có thể duyệt đơn thuộc tin mình quản lý.
AC2: Hệ thống kiểm tra quyền và trạng thái đơn trước khi cập nhật.
AC3: Khi hợp lệ, hệ thống lưu trạng thái đơn đã được duyệt.
AC4: Hệ thống ghi nhận và thông báo thay đổi trạng thái cho Sinh viên theo FR-08.
AC5: Người không có quyền quản lý tin không thể duyệt đơn của tin đó. | Chưa thực hiện |
| PB-21 | Function |  |  | Từ chối đơn ứng tuyển | Là Nhà tuyển dụng, tôi muốn từ chối đơn ứng tuyển không phù hợp để cập nhật kết quả xét duyệt. | 18 | High | 3 | AC1: Nhà tuyển dụng có thể từ chối đơn thuộc tin mình quản lý.
AC2: Hệ thống kiểm tra quyền và trạng thái đơn trước khi cập nhật.
AC3: Khi hợp lệ, hệ thống lưu trạng thái đơn bị từ chối.
AC4: Hệ thống ghi nhận và thông báo thay đổi trạng thái cho Sinh viên theo FR-08.
AC5: Người không có quyền quản lý tin không thể từ chối đơn của tin đó. | Chưa thực hiện |
| PB-22 | Function |  | Quản lý trạng thái công việc | Cập nhật trạng thái công việc | Là Nhà tuyển dụng, tôi muốn cập nhật trạng thái công việc để phản ánh tiến trình tuyển dụng và hoàn thành. | 30 | High | 3 | AC1: Hệ thống hỗ trợ ba trạng thái: Đang tuyển, Đã nhận người, Hoàn thành.
AC2: Luồng trạng thái hợp lệ là Đang tuyển → Đã nhận người → Hoàn thành.
AC3: Hệ thống từ chối chuyển trực tiếp từ Đang tuyển sang Hoàn thành.
AC4: Chỉ Nhà tuyển dụng có quyền quản lý công việc tương ứng mới được cập nhật trạng thái.
AC5: Khi cập nhật hợp lệ, trạng thái mới được lưu và hiển thị. | Chưa thực hiện |
| PB-23 | Function | Sinh viên | Đánh giá sau công việc | Sinh viên đánh giá Nhà tuyển dụng | Là Sinh viên đã tham gia công việc, tôi muốn đánh giá sao và bình luận về Nhà tuyển dụng sau khi công việc hoàn thành. | 18 | Medium | 3 | AC1: Chỉ cho phép đánh giá khi công việc đạt trạng thái Hoàn thành.
AC2: Người đánh giá phải là Sinh viên tham gia công việc tương ứng.
AC3: Hệ thống cung cấp đánh giá sao và nội dung bình luận theo FR-07.
AC4: Hệ thống lưu đánh giá gắn với đúng công việc và Nhà tuyển dụng.
AC5: Nếu công việc chưa Hoàn thành hoặc người dùng không có quyền đánh giá, hệ thống từ chối thao tác. | Chưa thực hiện |
| PB-24 | Function | Nhà tuyển dụng |  | Nhà tuyển dụng đánh giá Sinh viên | Là Nhà tuyển dụng, tôi muốn đánh giá sao và bình luận về Sinh viên sau khi công việc hoàn thành. | 18 | High | 3 | AC1: Chỉ cho phép đánh giá khi công việc đạt trạng thái Hoàn thành.
AC2: Người đánh giá phải là Nhà tuyển dụng của công việc tương ứng.
AC3: Hệ thống cung cấp đánh giá sao và nội dung bình luận theo FR-07.
AC4: Hệ thống lưu đánh giá gắn với đúng công việc và Sinh viên.
AC5: Nếu công việc chưa Hoàn thành hoặc người dùng không có quyền đánh giá, hệ thống từ chối thao tác. | Chưa thực hiện |
| PB-25 | Function | Sinh viên | Thông báo ứng tuyển | Thông báo khi trạng thái ứng tuyển thay đổi | Là Sinh viên đã ứng tuyển, tôi muốn nhận thông báo khi đơn được duyệt hoặc bị từ chối để biết kết quả. | 18 | Medium | 3 | AC1: Khi đơn được duyệt, hệ thống ghi nhận/gửi thông báo tương ứng cho Sinh viên.
AC2: Khi đơn bị từ chối, hệ thống ghi nhận/gửi thông báo tương ứng cho Sinh viên.
AC3: Nội dung thông báo phản ánh trạng thái đã được lưu.
AC4: Thông báo chỉ phát sinh sau khi cập nhật trạng thái thành công. | Chưa thực hiện |
| PB-26 | Function | Nhà tuyển dụng |  | Nhận thông tin ứng tuyển mới | Là Nhà tuyển dụng, tôi muốn hệ thống ghi nhận thông tin khi có đơn ứng tuyển mới để biết có hồ sơ cần xem xét. | 12 | Medium | 3 | AC1: Khi Sinh viên nộp đơn hợp lệ, hệ thống ghi nhận đơn ứng tuyển.
AC2: Theo luồng UC-06, hệ thống ghi nhận thông báo cho Nhà tuyển dụng theo cơ chế thông báo cơ bản.
AC3: Thông tin thông báo gắn với đúng tin tuyển dụng/đơn ứng tuyển.
AC4: Không tạo thông báo ứng tuyển mới nếu đơn không được lưu thành công. | Chưa thực hiện |
| PB-27 | Function | Sinh viên | Quản lý hồ sơ cá nhân | Xem hồ sơ cá nhân – Sinh viên | Là Sinh viên, tôi muốn xem hồ sơ cá nhân của mình để kiểm tra thông tin đang được lưu trên hệ thống. | 12 | Medium | 2 | AC1: Sinh viên đã đăng nhập có thể mở hồ sơ cá nhân của chính mình.
AC2: Hệ thống hiển thị thông tin hồ sơ đã lưu của Sinh viên.
AC3: Sinh viên không thể xem hồ sơ riêng tư của tài khoản khác nếu không có quyền.
AC4: Nếu hồ sơ chưa có dữ liệu, hệ thống hiển thị trạng thái phù hợp. | Chưa thực hiện |
| PB-28 | Function |  |  | Cập nhật hồ sơ cá nhân – Sinh viên | Là Sinh viên, tôi muốn cập nhật hồ sơ cá nhân của mình để thông tin trên hệ thống được chính xác. | 18 | Medium | 2 | AC1: Sinh viên đã đăng nhập có thể cập nhật hồ sơ cá nhân của chính mình.
AC2: Hệ thống kiểm tra tính hợp lệ của dữ liệu trước khi lưu.
AC3: Khi dữ liệu hợp lệ, hệ thống lưu thay đổi và thông báo kết quả.
AC4: Khi dữ liệu thiếu hoặc không hợp lệ, hệ thống không lưu thay đổi không hợp lệ và yêu cầu Sinh viên chỉnh sửa.
AC5: Sinh viên không thể cập nhật hồ sơ của tài khoản khác nếu không có quyền. | Chưa thực hiện |
| PB-29 | Function | Nhà tuyển dụng |  | Xem hồ sơ cá nhân – Nhà tuyển dụng | Là Nhà tuyển dụng, tôi muốn xem hồ sơ cá nhân của mình để kiểm tra thông tin đang được lưu trên hệ thống. | 12 | Medium | 2 | AC1: Nhà tuyển dụng đã đăng nhập có thể mở hồ sơ cá nhân của chính mình.
AC2: Hệ thống hiển thị thông tin hồ sơ đã lưu của Nhà tuyển dụng.
AC3: Nhà tuyển dụng không thể xem hồ sơ riêng tư của tài khoản khác nếu không có quyền.
AC4: Nếu hồ sơ chưa có dữ liệu, hệ thống hiển thị trạng thái phù hợp. | Chưa thực hiện |
| PB-30 | Function |  |  | Cập nhật hồ sơ cá nhân – Nhà tuyển dụng | Là Nhà tuyển dụng, tôi muốn cập nhật hồ sơ cá nhân của mình để thông tin trên hệ thống được chính xác. | 18 | Medium | 2 | AC1: Nhà tuyển dụng đã đăng nhập có thể cập nhật hồ sơ cá nhân của chính mình.
AC2: Hệ thống kiểm tra tính hợp lệ của dữ liệu trước khi lưu.
AC3: Khi dữ liệu hợp lệ, hệ thống lưu thay đổi và thông báo kết quả.
AC4: Khi dữ liệu thiếu hoặc không hợp lệ, hệ thống không lưu thay đổi không hợp lệ và yêu cầu Nhà tuyển dụng chỉnh sửa.
AC5: Nhà tuyển dụng không thể cập nhật hồ sơ của tài khoản khác nếu không có quyền. | Chưa thực hiện |
| PB-31 | Function | Quản trị viên | Quản trị hệ thống | Kiểm duyệt tin đăng | Là Quản trị viên, tôi muốn kiểm duyệt tin đăng để kiểm soát tin được hiển thị trên nền tảng. | 18 | Low | 3 | AC1: Chỉ Quản trị viên có quyền truy cập chức năng kiểm duyệt tin.
AC2: Hệ thống hiển thị danh sách tin cần kiểm duyệt trong phạm vi quyền quản trị.
AC3: Quản trị viên có thể xem thông tin tin đăng trước khi đưa ra quyết định.
AC4: Tin chưa đủ điều kiện hiển thị không được công khai cho đến khi đạt điều kiện. | Chưa thực hiện |
| PB-32 | Function |  |  | Quản lý tài khoản người dùng | Là Quản trị viên, tôi muốn quản lý tài khoản người dùng để duy trì hoạt động của nền tảng. | 18 | Low | 3 | AC1: Chỉ Quản trị viên có quyền truy cập chức năng quản lý tài khoản.
AC2: Hệ thống hiển thị danh sách tài khoản trong phạm vi quản trị.
AC3: Quản trị viên chỉ thực hiện các thao tác quản lý tài khoản đã được nhóm thống nhất.
AC4: Kết quả thao tác quản trị được lưu.
AC5: Người không có quyền Quản trị viên không thể thực hiện thao tác quản trị tài khoản. | Chưa thực hiện |
| DB-01 | Document backlog | Nhóm phát triển | Theo dõi và kiểm soát dự án
Theo dõi và kiểm soát dự án, cập nhật nhật ký dự án |  |  |  | High | 1 |  |  |
| DB-02 |  |  | Thu thập và phân tích yêu cầu |  |  |  | High | 1 |  |  |
| DB-03 |  |  | Thiết kế bản mẫu giao diện |  |  |  | High | 1 |  |  |
| DB-04 |  |  | Quản lý yêu cầu và bối cảnh |  |  |  | High | 1 |  |  |
| DB-05 |  |  | Thiết kế cơ sở dữ liệu |  |  |  | High | 1 |  |  |
| DB-06 |  |  | Chuẩn bị kỹ thuật |  |  |  | High | 1 |  |  |
| DB-07 |  |  | Tài liệu kiến trúc và thiết kế phần mềm |  |  |  | High | 1 |  |  |
| DB-08 |  |  | Quản lý chất lượng |  |  |  | High | 1 |  |  |
| DB-09 |  |  | Triển khai và đưa hệ thống vào vận hành |  |  |  | High | 1 |  |  |
| DB-10 |  |  | Chuẩn bị báo cáo mốc 1 |  |  |  | High | 1 |  |  |
| DB-11 |  |  | Chuẩn bị báo cáo mốc 2 |  |  |  | High | 2 |  |  |
| DB-12 |  |  | Chuẩn bị báo cáo bảo vệ đồ án |  |  |  | High | 5 |  |  |