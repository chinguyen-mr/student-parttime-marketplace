<!-- converted from Dac_ta.docx -->

TRƯỜNG ĐẠI HỌC VĂN LANG
KHOA CÔNG NGHỆ THÔNG TIN

CHUYÊN ĐỀ TỐT NGHIỆP 2

ĐẶC TẢ USE CASE NGHIỆP VỤ

Nền tảng quản lý Freelance / Marketplace
việc làm Part-time cho sinh viên

Môn học: Chuyên đề tốt nghiệp 2
Chuyên ngành: Công nghệ phần mềm
GVHD: ThS. Nguyễn Văn Trung
Sinh viên phụ trách: Nguyễn Văn Chí
# 1. MỤC ĐÍCH VÀ CĂN CỨ ĐẶC TẢ
Tài liệu này đặc tả các Use Case nghiệp vụ chính của đề tài, tập trung vào Actor, điều kiện trước/sau, luồng sự kiện chính, luồng thay thế/ngoại lệ và quy tắc nghiệp vụ. Tài liệu được dùng để thống nhất với SRS rút gọn và làm cơ sở cho Use Case Diagram, thiết kế giao diện, API và kiểm thử.
Căn cứ nội dung nhóm đã cung cấp: danh sách Functional Requirements (FR-01 đến FR-08) và danh sách Use Case của đề tài. Các mã FR được giữ nguyên theo tài liệu nguồn, không tự đánh lại.
# 2. PHẠM VI NGHIỆP VỤ
- Đăng ký/đăng nhập và phân quyền 3 vai trò: Sinh viên, Nhà tuyển dụng, Quản trị viên.
- Nhà tuyển dụng đăng tin việc làm part-time với mô tả, thời gian, mức lương và địa điểm.
- Sinh viên tìm kiếm, lọc tin theo ngành nghề/địa điểm/mức lương và ứng tuyển kèm hồ sơ.
- Nhà tuyển dụng xem danh sách ứng viên, duyệt hoặc từ chối ứng tuyển.
- Theo dõi trạng thái công việc: đang tuyển, đã nhận người, hoàn thành.
- Đánh giá hai chiều sau khi công việc hoàn thành.
- Thông báo cơ bản khi có cập nhật trạng thái ứng tuyển.
- Không đặc tả thành chức năng bắt buộc: thanh toán tiền thật, mobile native riêng biệt và chat real-time nâng cao.
# 3. ACTOR
| Actor | Vai trò nghiệp vụ | Chức năng liên quan |
| --- | --- | --- |
| Sinh viên | Tìm kiếm và ứng tuyển việc làm part-time/freelance; theo dõi kết quả; đánh giá sau công việc. | Đăng ký, đăng nhập, hồ sơ, tìm kiếm/lọc, ứng tuyển, đánh giá. |
| Nhà tuyển dụng | Đăng và quản lý nhu cầu tuyển dụng; xem và xử lý ứng viên; quản lý trạng thái công việc; đánh giá. | Đăng ký, đăng nhập, hồ sơ, đăng tin, quản lý ứng viên, trạng thái công việc, đánh giá. |
| Quản trị viên | Quản lý và kiểm soát tài khoản/tin đăng trong phạm vi quản trị hệ thống. | Đăng nhập, kiểm duyệt tin đăng/tài khoản. |

# 4. DANH SÁCH USE CASE
Quy ước ID được chốt trong tài liệu này: UC-06 là “Ứng tuyển việc làm”; không tách “Xem chi tiết tin tuyển dụng” thành một Use Case độc lập. Bước xem chi tiết được mô tả trong Main Flow của UC-05/UC-06. Quy ước này cần được dùng thống nhất khi vẽ Use Case Diagram.
| ID | Use Case | Actor chính | FR liên quan |
| --- | --- | --- | --- |
| UC-01 | Đăng ký tài khoản | Sinh viên, Nhà tuyển dụng | FR-01 |
| UC-02 | Đăng nhập / Đăng xuất | Sinh viên, Nhà tuyển dụng, Quản trị viên | FR-01 |
| UC-03 | Quản lý hồ sơ cá nhân | Sinh viên, Nhà tuyển dụng | — (không có FR riêng) |
| UC-04 | Đăng tin tuyển dụng | Nhà tuyển dụng | FR-02 |
| UC-05 | Tìm kiếm & Lọc tin tuyển dụng | Sinh viên | FR-03 |
| UC-06 | Ứng tuyển việc làm | Sinh viên | FR-04 |
| UC-07 | Quản lý ứng viên (xem/duyệt/từ chối) | Nhà tuyển dụng | FR-05 |
| UC-08 | Cập nhật trạng thái công việc | Nhà tuyển dụng | FR-06 |
| UC-09 | Đánh giá sau công việc | Sinh viên, Nhà tuyển dụng | FR-07 |
| UC-10 | Kiểm duyệt tin đăng & tài khoản | Quản trị viên | — (Use Case quản trị trong phạm vi đề tài) |

# 5. ĐẶC TẢ USE CASE
Mỗi Use Case được mô tả theo cấu trúc: mục tiêu, trigger, pre-condition, post-condition, Main Flow, Alternative/Exception Flow và Business Rules. Không thêm FR mới ngoài FR-01 đến FR-08 của tài liệu nguồn.
## UC-01 – Đăng ký tài khoản
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-01 |
| Tên Use Case | Đăng ký tài khoản |
| Actor chính | Sinh viên / Nhà tuyển dụng |
| Mục tiêu nghiệp vụ | Cho phép người dùng tạo tài khoản để sử dụng các chức năng phù hợp với vai trò đã chọn. |
| Trigger | Người dùng chọn chức năng “Đăng ký”. |
| Điều kiện tiên quyết (Pre-condition) | • Người dùng chưa có tài khoản với thông tin đăng ký tương ứng. • Người dùng có thông tin cần thiết để tạo tài khoản. |
| Điều kiện kết thúc (Post-condition) | • Tài khoản được tạo thành công với vai trò đã chọn. • Người dùng có thể sử dụng chức năng đăng nhập. • Thông tin đăng ký hợp lệ được lưu vào hệ thống. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Người dùng | Chọn “Đăng ký tài khoản”. |
| 2 | Hệ thống | Hiển thị biểu mẫu đăng ký và các thông tin cần nhập. |
| 3 | Người dùng | Chọn vai trò phù hợp và nhập thông tin đăng ký. |
| 4 | Người dùng | Gửi biểu mẫu đăng ký. |
| 5 | Hệ thống | Kiểm tra các trường bắt buộc và tính hợp lệ của thông tin. |
| 6 | Hệ thống | Kiểm tra thông tin tài khoản đã tồn tại hay chưa. |
| 7 | Hệ thống | Nếu hợp lệ, tạo tài khoản và lưu thông tin người dùng. |
| 8 | Hệ thống | Thông báo đăng ký thành công và hướng dẫn người dùng đăng nhập. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 4a | Thiếu hoặc sai dữ liệu | Hệ thống thông báo trường cần bổ sung/chỉnh sửa; người dùng cập nhật và gửi lại. |
| 6a | Thông tin tài khoản đã tồn tại | Hệ thống từ chối tạo tài khoản và thông báo người dùng sử dụng thông tin khác hoặc đăng nhập tài khoản hiện có. |

### Quy tắc nghiệp vụ (Business Rules)
- Mỗi tài khoản phải gắn với một vai trò trong phạm vi hệ thống.
- Thông tin bắt buộc phải hợp lệ trước khi tạo tài khoản.
- Không tạo tài khoản mới nếu thông tin tài khoản đã tồn tại.
## UC-02 – Đăng nhập / Đăng xuất
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-02 |
| Tên Use Case | Đăng nhập / Đăng xuất |
| Actor chính | Sinh viên / Nhà tuyển dụng / Quản trị viên |
| Mục tiêu nghiệp vụ | Xác thực người dùng và cho phép truy cập chức năng theo vai trò; đồng thời kết thúc phiên sử dụng khi người dùng đăng xuất. |
| Trigger | Người dùng chọn “Đăng nhập” hoặc “Đăng xuất”. |
| Điều kiện tiên quyết (Pre-condition) | • Đăng nhập: người dùng đã có tài khoản hợp lệ. • Đăng xuất: người dùng đang có phiên đăng nhập hợp lệ. |
| Điều kiện kết thúc (Post-condition) | • Đăng nhập thành công: hệ thống tạo phiên/xác thực và chuyển người dùng vào khu vực phù hợp với vai trò. • Đăng xuất thành công: phiên xác thực hiện tại được kết thúc và người dùng trở về trạng thái chưa đăng nhập. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Người dùng | Mở chức năng đăng nhập. |
| 2 | Hệ thống | Hiển thị biểu mẫu đăng nhập. |
| 3 | Người dùng | Nhập thông tin tài khoản và gửi yêu cầu. |
| 4 | Hệ thống | Kiểm tra thông tin xác thực. |
| 5 | Hệ thống | Xác định vai trò và quyền truy cập của tài khoản. |
| 6 | Hệ thống | Cho phép truy cập các chức năng tương ứng với vai trò. |
| 7 | Người dùng | Khi không còn sử dụng, chọn “Đăng xuất”. |
| 8 | Hệ thống | Kết thúc phiên/xác thực và đưa người dùng về trạng thái chưa đăng nhập. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 4a | Thông tin đăng nhập không hợp lệ | Hệ thống thông báo đăng nhập thất bại và yêu cầu người dùng kiểm tra lại thông tin. |
| 5a | Tài khoản bị khóa/không được phép truy cập | Hệ thống từ chối đăng nhập và thông báo trạng thái tài khoản. |

### Quy tắc nghiệp vụ (Business Rules)
- Chỉ tài khoản hợp lệ mới được đăng nhập.
- Quyền truy cập phải được kiểm soát theo vai trò.
- Người dùng phải đăng nhập trước khi thực hiện các nghiệp vụ yêu cầu quyền truy cập.
## UC-03 – Quản lý hồ sơ cá nhân
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-03 |
| Tên Use Case | Quản lý hồ sơ cá nhân |
| Actor chính | Sinh viên / Nhà tuyển dụng |
| Mục tiêu nghiệp vụ | Cho phép người dùng duy trì thông tin hồ sơ phục vụ tìm việc hoặc tuyển dụng. |
| Trigger | Người dùng mở chức năng “Hồ sơ cá nhân”. |
| Điều kiện tiên quyết (Pre-condition) | • Người dùng đã đăng nhập. • Người dùng có quyền truy cập hồ sơ của chính mình. |
| Điều kiện kết thúc (Post-condition) | • Thông tin hồ sơ được hiển thị. • Các thay đổi hợp lệ được lưu thành công. • Hồ sơ mới có thể được sử dụng trong các nghiệp vụ liên quan. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Người dùng | Mở chức năng hồ sơ cá nhân. |
| 2 | Hệ thống | Hiển thị thông tin hồ sơ hiện tại. |
| 3 | Người dùng | Chọn chỉnh sửa và cập nhật thông tin cần thay đổi. |
| 4 | Người dùng | Lưu thông tin hồ sơ. |
| 5 | Hệ thống | Kiểm tra các trường bắt buộc và định dạng dữ liệu. |
| 6 | Hệ thống | Lưu thông tin hợp lệ. |
| 7 | Hệ thống | Thông báo cập nhật thành công và hiển thị hồ sơ mới. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 5a | Thiếu/sai thông tin | Hệ thống đánh dấu thông tin không hợp lệ, không lưu thay đổi và yêu cầu người dùng chỉnh sửa. |

### Quy tắc nghiệp vụ (Business Rules)
- Người dùng chỉ được chỉnh sửa hồ sơ của chính mình.
- Thông tin bắt buộc phải hợp lệ trước khi lưu.
- Đối với Sinh viên, hồ sơ phải đủ thông tin cần thiết trước khi ứng tuyển theo quy định của hệ thống.
## UC-04 – Đăng tin tuyển dụng
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-04 |
| Tên Use Case | Đăng tin tuyển dụng |
| Actor chính | Nhà tuyển dụng |
| Mục tiêu nghiệp vụ | Cho phép Nhà tuyển dụng tạo tin việc làm part-time với thông tin đầy đủ để Sinh viên có thể tìm kiếm và ứng tuyển. |
| Trigger | Nhà tuyển dụng chọn “Đăng tin tuyển dụng”. |
| Điều kiện tiên quyết (Pre-condition) | • Nhà tuyển dụng đã đăng nhập. • Tài khoản có quyền đăng tin. |
| Điều kiện kết thúc (Post-condition) | • Tin tuyển dụng hợp lệ được lưu vào hệ thống. • Tin được đưa vào trạng thái xử lý/hiển thị theo cơ chế kiểm duyệt của hệ thống. • Sinh viên có thể nhìn thấy tin khi tin đủ điều kiện hiển thị. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Nhà tuyển dụng | Chọn chức năng “Đăng tin tuyển dụng”. |
| 2 | Hệ thống | Hiển thị biểu mẫu đăng tin. |
| 3 | Nhà tuyển dụng | Nhập tên công việc, mô tả, thời gian, mức lương, địa điểm và thông tin liên quan. |
| 4 | Nhà tuyển dụng | Chọn “Đăng tin”. |
| 5 | Hệ thống | Kiểm tra dữ liệu bắt buộc và tính hợp lệ của tin. |
| 6 | Hệ thống | Lưu tin tuyển dụng. |
| 7 | Hệ thống | Gán trạng thái tin phù hợp theo quy trình của hệ thống. |
| 8 | Hệ thống | Thông báo thao tác thành công. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 5a | Thiếu thông tin bắt buộc | Hệ thống không lưu tin và yêu cầu Nhà tuyển dụng bổ sung thông tin. |
| 5b | Dữ liệu không hợp lệ | Hệ thống hiển thị lỗi tại trường tương ứng để Nhà tuyển dụng chỉnh sửa. |
| 6a | Tin cần kiểm duyệt | Tin được lưu ở trạng thái chờ kiểm duyệt và chưa được hiển thị công khai cho đến khi đủ điều kiện. |

### Quy tắc nghiệp vụ (Business Rules)
- Tin phải có tối thiểu mô tả công việc, thời gian, mức lương và địa điểm theo phạm vi đề tài.
- Chỉ Nhà tuyển dụng có quyền mới được đăng tin.
- Tin phải tuân thủ trạng thái hiển thị/kiểm duyệt của hệ thống.
## UC-05 – Tìm kiếm & Lọc tin tuyển dụng
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-05 |
| Tên Use Case | Tìm kiếm & Lọc tin tuyển dụng |
| Actor chính | Sinh viên |
| Mục tiêu nghiệp vụ | Giúp Sinh viên nhanh chóng tìm được các tin việc làm phù hợp với nhu cầu. |
| Trigger | Sinh viên mở chức năng tìm kiếm việc làm hoặc nhập điều kiện tìm kiếm/lọc. |
| Điều kiện tiên quyết (Pre-condition) | • Sinh viên có thể truy cập hệ thống; không bắt buộc đăng nhập để tìm kiếm. • Hệ thống có thể trả về danh sách tin hoặc kết quả rỗng. |
| Điều kiện kết thúc (Post-condition) | • Danh sách tin phù hợp với từ khóa/bộ lọc được hiển thị. • Nếu không có kết quả, hệ thống thông báo rõ trạng thái kết quả. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Sinh viên | Mở danh sách việc làm. |
| 2 | Hệ thống | Hiển thị các tin tuyển dụng đang đủ điều kiện hiển thị. |
| 3 | Sinh viên | Nhập từ khóa và/hoặc chọn bộ lọc ngành nghề, địa điểm, mức lương. |
| 4 | Sinh viên | Thực hiện tìm kiếm/lọc. |
| 5 | Hệ thống | Tiếp nhận và kiểm tra điều kiện tìm kiếm. |
| 6 | Hệ thống | Trả về danh sách tin phù hợp. |
| 7 | Sinh viên | Xem kết quả và chọn tin quan tâm nếu muốn xem thêm thông tin. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 3a | Không nhập điều kiện | Hệ thống hiển thị danh sách tin hiện có theo điều kiện mặc định. |
| 6a | Không có kết quả | Hệ thống hiển thị thông báo không tìm thấy tin phù hợp và cho phép Sinh viên thay đổi điều kiện tìm kiếm. |

### Quy tắc nghiệp vụ (Business Rules)
- Chỉ hiển thị các tin đủ điều kiện công khai.
- Các bộ lọc chính gồm ngành nghề, địa điểm và mức lương.
- Kết quả phải phản ánh đúng điều kiện tìm kiếm/lọc mà Sinh viên đã chọn.
## UC-06 – Ứng tuyển việc làm
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-06 |
| Tên Use Case | Ứng tuyển việc làm |
| Actor chính | Sinh viên |
| Mục tiêu nghiệp vụ | Cho phép Sinh viên gửi hồ sơ ứng tuyển vào một tin tuyển dụng phù hợp. |
| Trigger | Sinh viên chọn thao tác “Ứng tuyển” trên tin tuyển dụng. |
| Điều kiện tiên quyết (Pre-condition) | • Sinh viên đã đăng nhập. • Sinh viên có hồ sơ/CV cần thiết theo yêu cầu ứng tuyển. • Tin tuyển dụng còn hiệu lực và cho phép ứng tuyển. |
| Điều kiện kết thúc (Post-condition) | • Hồ sơ ứng tuyển được lưu với trạng thái chờ xử lý/duyệt. • Nhà tuyển dụng có thể xem hồ sơ ứng viên. • Hệ thống thông báo kết quả gửi ứng tuyển cho Sinh viên và thông báo cho Nhà tuyển dụng theo cơ chế thông báo cơ bản. |
### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Sinh viên | Tìm kiếm và chọn một tin tuyển dụng. |
| 2 | Hệ thống | Hiển thị thông tin chi tiết tin tuyển dụng. |
| 3 | Sinh viên | Chọn “Ứng tuyển”. |
| 4 | Hệ thống | Kiểm tra đăng nhập, trạng thái tin và điều kiện ứng tuyển. |
| 5 | Hệ thống | Hiển thị thông tin hồ sơ/CV dùng để ứng tuyển. |
| 6 | Sinh viên | Chọn CV/điền thông tin giới thiệu và xác nhận gửi. |
| 7 | Hệ thống | Kiểm tra tính đầy đủ và hợp lệ của hồ sơ. |
| 8 | Hệ thống | Lưu hồ sơ ứng tuyển và trạng thái chờ xử lý. |
| 9 | Hệ thống | Ghi nhận thông báo cho Nhà tuyển dụng. |
| 10 | Hệ thống | Thông báo ứng tuyển thành công cho Sinh viên. |
### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 4a | Chưa đăng nhập | Hệ thống yêu cầu Sinh viên đăng nhập trước khi tiếp tục. |
| 4b | Tin đã đóng/hết hiệu lực | Hệ thống không cho phép ứng tuyển và thông báo trạng thái tin. |
| 4c | Đã ứng tuyển trước đó | Hệ thống không tạo hồ sơ ứng tuyển trùng cho cùng Sinh viên và cùng tin. |
| 7a | Hồ sơ thiếu thông tin/CV | Hệ thống yêu cầu Sinh viên cập nhật hồ sơ rồi thực hiện lại thao tác. |
### Quy tắc nghiệp vụ (Business Rules)
- Mỗi Sinh viên chỉ được ứng tuyển một lần cho một tin tuyển dụng.
- Không cho phép ứng tuyển vào tin đã đóng hoặc hết hiệu lực.
- Hồ sơ ứng tuyển phải đáp ứng thông tin bắt buộc và có CV theo quy định của nghiệp vụ hiện tại.
- Trạng thái ban đầu của hồ sơ ứng tuyển là chờ xử lý/duyệt.
## UC-07 – Quản lý ứng viên (xem/duyệt/từ chối)
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-07 |
| Tên Use Case | Quản lý ứng viên (xem/duyệt/từ chối) |
| Actor chính | Nhà tuyển dụng |
| Mục tiêu nghiệp vụ | Cho phép Nhà tuyển dụng xem và xử lý các hồ sơ ứng tuyển vào tin do mình đăng. |
| Trigger | Nhà tuyển dụng mở danh sách ứng viên của một tin tuyển dụng. |
| Điều kiện tiên quyết (Pre-condition) | • Nhà tuyển dụng đã đăng nhập. • Tin tuyển dụng thuộc quyền quản lý của Nhà tuyển dụng. • Có thể có hoặc không có hồ sơ ứng tuyển. |
| Điều kiện kết thúc (Post-condition) | • Ứng viên được duyệt hoặc từ chối theo quyết định của Nhà tuyển dụng. • Trạng thái hồ sơ ứng tuyển được cập nhật. • Sinh viên nhận được thông báo trạng thái theo cơ chế thông báo cơ bản. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Nhà tuyển dụng | Mở danh sách tin tuyển dụng của mình. |
| 2 | Nhà tuyển dụng | Chọn một tin và mở danh sách ứng viên. |
| 3 | Hệ thống | Hiển thị các hồ sơ ứng tuyển của tin. |
| 4 | Nhà tuyển dụng | Chọn một ứng viên để xem thông tin/CV. |
| 5 | Nhà tuyển dụng | Đánh giá hồ sơ dựa trên yêu cầu công việc. |
| 6 | Nhà tuyển dụng | Chọn “Duyệt” hoặc “Từ chối”. |
| 7 | Hệ thống | Kiểm tra quyền và trạng thái hồ sơ. |
| 8 | Hệ thống | Cập nhật trạng thái ứng tuyển theo lựa chọn. |
| 9 | Hệ thống | Ghi nhận và thông báo kết quả cho Sinh viên. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 3a | Không có ứng viên | Hệ thống hiển thị danh sách rỗng và thông báo chưa có hồ sơ ứng tuyển. |
| 7a | Hồ sơ đã được xử lý | Hệ thống không cho thực hiện quyết định mới nếu trạng thái hiện tại không cho phép thay đổi. |
| 7b | Tin không thuộc quyền quản lý | Hệ thống từ chối truy cập danh sách ứng viên. |

### Quy tắc nghiệp vụ (Business Rules)
- Nhà tuyển dụng chỉ được quản lý ứng viên của các tin do mình đăng. Mỗi hồ sơ ứng tuyển phải có trạng thái rõ ràng.
## UC-08 – Cập nhật trạng thái công việc
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-08 |
| Tên Use Case | Cập nhật trạng thái công việc |
| Actor chính | Nhà tuyển dụng |
| Mục tiêu nghiệp vụ | Cho phép Nhà tuyển dụng cập nhật trạng thái của công việc theo tiến trình tuyển dụng và thực hiện công việc. |
| Trigger | Nhà tuyển dụng chọn thao tác cập nhật trạng thái của một tin/công việc. |
| Điều kiện tiên quyết (Pre-condition) | • Nhà tuyển dụng đã đăng nhập. • Công việc/tin thuộc quyền quản lý của Nhà tuyển dụng. • Công việc có trạng thái hiện tại hợp lệ. |
| Điều kiện kết thúc (Post-condition) | • Trạng thái công việc được cập nhật. • Trạng thái mới được lưu và phản ánh cho các bên liên quan. • Khi công việc chuyển sang hoàn thành, nghiệp vụ đánh giá có thể được thực hiện. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Nhà tuyển dụng | Mở công việc/tin cần quản lý. |
| 2 | Hệ thống | Hiển thị trạng thái hiện tại. |
| 3 | Nhà tuyển dụng | Chọn trạng thái mới. |
| 4 | Hệ thống | Kiểm tra trạng thái hiện tại và điều kiện chuyển trạng thái. |
| 5 | Hệ thống | Cập nhật trạng thái công việc. |
| 6 | Hệ thống | Lưu trạng thái mới. |
| 7 | Hệ thống | Thông báo/cập nhật trạng thái cho người liên quan theo cơ chế hệ thống. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 4a | Chuyển trạng thái không hợp lệ | Hệ thống từ chối cập nhật và giữ nguyên trạng thái hiện tại. |
| 4b | Công việc chưa đủ điều kiện hoàn thành | Hệ thống không cho chuyển sang “Hoàn thành” nếu điều kiện nghiệp vụ chưa được đáp ứng. |

### Quy tắc nghiệp vụ (Business Rules)
- Các trạng thái nghiệp vụ chính: Đang tuyển → Đã nhận người → Hoàn thành.
- Chỉ Nhà tuyển dụng có quyền quản lý công việc của mình mới được cập nhật trạng thái.
- Không cho phép chuyển sang trạng thái không phù hợp với tiến trình nghiệp vụ.
- Trạng thái “Hoàn thành” là điều kiện để phát sinh nghiệp vụ đánh giá sau công việc.
- Không thể chuyển từ “Đang tuyển” sang “Hoàn thành” mà bỏ qua bước “Đã nhận người”.
## UC-09 – Đánh giá sau công việc
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-09 |
| Tên Use Case | Đánh giá sau công việc |
| Actor chính | Sinh viên / Nhà tuyển dụng |
| Mục tiêu nghiệp vụ | Cho phép hai bên ghi nhận đánh giá sau khi công việc đã hoàn thành. |
| Trigger | Công việc chuyển sang trạng thái “Hoàn thành” và người dùng mở chức năng đánh giá. |
| Điều kiện tiên quyết (Pre-condition) | • Công việc đã hoàn thành. • Người đánh giá là Sinh viên đã tham gia công việc hoặc Nhà tuyển dụng của công việc đó. • Người đánh giá chưa thực hiện đánh giá cho cùng lượt đánh giá, nếu hệ thống áp dụng nguyên tắc một lần. |
| Điều kiện kết thúc (Post-condition) | • Đánh giá được lưu thành công. • Đánh giá gắn với đúng công việc và đúng cặp người đánh giá/người được đánh giá. • Thông tin đánh giá có thể được sử dụng trong hồ sơ/hiển thị theo quy định của hệ thống. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Người dùng | Mở công việc đã hoàn thành. |
| 2 | Hệ thống | Kiểm tra trạng thái công việc và quyền đánh giá. |
| 3 | Hệ thống | Hiển thị biểu mẫu đánh giá. |
| 4 | Người dùng | Nhập mức đánh giá và nội dung nhận xét nếu có. |
| 5 | Người dùng | Gửi đánh giá. |
| 6 | Hệ thống | Kiểm tra tính hợp lệ của dữ liệu. |
| 7 | Hệ thống | Lưu đánh giá vào đúng công việc và đối tượng. |
| 8 | Hệ thống | Thông báo đánh giá thành công. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 2a | Công việc chưa hoàn thành | Hệ thống không cho phép đánh giá và thông báo chỉ có thể đánh giá sau khi hoàn thành. |
| 2b | Không có quyền đánh giá | Hệ thống từ chối thao tác nếu người dùng không thuộc quan hệ công việc tương ứng. |
| 6a | Dữ liệu đánh giá không hợp lệ | Hệ thống yêu cầu người dùng chỉnh sửa trước khi lưu. |

### Quy tắc nghiệp vụ (Business Rules)
- Chỉ đánh giá sau khi công việc hoàn thành.
- Sinh viên đánh giá Nhà tuyển dụng và Nhà tuyển dụng đánh giá Sinh viên.
- Đánh giá phải gắn với đúng công việc đã hoàn thành.
- Không cho phép đánh giá sai đối tượng hoặc ngoài quan hệ công việc.
## UC-10 – Kiểm duyệt tin đăng & tài khoản
| Thành phần | Mô tả |
| --- | --- |
| Use Case ID | UC-10 |
| Tên Use Case | Kiểm duyệt tin đăng & tài khoản |
| Actor chính | Quản trị viên |
| Mục tiêu nghiệp vụ | Cho phép Quản trị viên kiểm soát các tin đăng và tài khoản trong phạm vi quản trị để duy trì hoạt động của nền tảng. |
| Trigger | Quản trị viên mở khu vực quản trị và chọn danh sách tin đăng/tài khoản cần kiểm tra. |
| Điều kiện tiên quyết (Pre-condition) | • Quản trị viên đã đăng nhập. • Tài khoản có quyền quản trị. • Có đối tượng cần kiểm duyệt hoặc quản lý. |
| Điều kiện kết thúc (Post-condition) | • Tin đăng/tài khoản được cập nhật trạng thái theo quyết định quản trị. • Kết quả kiểm duyệt được lưu lại. • Đối tượng bị từ chối/không hợp lệ không được sử dụng theo trạng thái mới của hệ thống. |

### Luồng sự kiện chính (Main Flow)
| Bước | Tác nhân / Người thực hiện | Mô tả xử lý |
| --- | --- | --- |
| 1 | Quản trị viên | Đăng nhập vào khu vực quản trị. |
| 2 | Quản trị viên | Chọn quản lý tin đăng hoặc tài khoản. |
| 3 | Hệ thống | Hiển thị danh sách đối tượng cần kiểm duyệt. |
| 4 | Quản trị viên | Chọn một tin/tài khoản để xem thông tin. |
| 5 | Quản trị viên | Kiểm tra nội dung và trạng thái. |
| 6 | Quản trị viên | Chọn quyết định kiểm duyệt phù hợp. |
| 7 | Hệ thống | Cập nhật trạng thái đối tượng. |
| 8 | Hệ thống | Lưu kết quả kiểm duyệt và thông báo kết quả theo cơ chế của hệ thống. |

### Luồng thay thế / Ngoại lệ (Alternative / Exception Flow)
| Mã | Điều kiện | Xử lý |
| --- | --- | --- |
| 3a | Không có đối tượng cần kiểm duyệt | Hệ thống hiển thị danh sách rỗng. |
| 5a | Thông tin chưa đủ để quyết định | Quản trị viên giữ đối tượng ở trạng thái chờ xử lý và tiếp tục kiểm tra. |
| 6a | Đối tượng không đạt điều kiện | Hệ thống cập nhật trạng thái không được chấp thuận/không hoạt động theo quy định. |

### Quy tắc nghiệp vụ (Business Rules)
- Chỉ Quản trị viên có quyền thực hiện kiểm duyệt.
- Quản trị viên chỉ được thay đổi trạng thái đối tượng trong phạm vi quyền hạn.
- Kết quả kiểm duyệt phải được lưu để có thể truy vết trạng thái.
# 6. MA TRẬN TRUY VẾT FR – USE CASE
Ma trận dưới đây chỉ dùng các FR có trong tài liệu nguồn. Không tạo FR mới cho các Use Case hỗ trợ chưa có FR riêng.
| FR | Mô tả yêu cầu chức năng | Use Case trực tiếp |
| --- | --- | --- |
| FR-01 | Hệ thống cho phép người dùng đăng ký/đăng nhập và phân quyền 3 vai trò (Sinh viên, Nhà tuyển dụng, Quản trị viên). | UC-01, UC-02 |
| FR-02 | Nhà tuyển dụng có thể đăng tin việc làm part-time (bao gồm mô tả, thời gian, mức lương, địa điểm). | UC-04 |
| FR-03 | Sinh viên có thể tìm kiếm và lọc tin tuyển dụng theo ngành nghề, địa điểm, mức lương. | UC-05 |
| FR-04 | Sinh viên có thể ứng tuyển vào tin tuyển dụng kèm hồ sơ (CV/giới thiệu bản thân). | UC-06 |
| FR-05 | Nhà tuyển dụng có thể xem danh sách ứng viên và thực hiện duyệt/từ chối ứng tuyển. | UC-07 |
| FR-06 | Hệ thống cho phép theo dõi trạng thái công việc (đang tuyển, đã nhận người, hoàn thành). | UC-08 |
| FR-07 | Hệ thống hỗ trợ đánh giá hai chiều (Sinh viên đánh giá Nhà tuyển dụng và ngược lại) sau khi công việc hoàn thành. | UC-09 |
| FR-08 | Hệ thống gửi thông báo cơ bản khi có cập nhật trạng thái ứng tuyển. | UC-06, UC-07 |

Ghi chú: UC-03 (Quản lý hồ sơ cá nhân) và UC-10 (Kiểm duyệt tin đăng & tài khoản) vẫn thuộc danh sách Use Case của đề tài nhưng chưa có FR riêng trong danh sách FR-01–FR-08 của tài liệu nguồn.
# 7. LUỒNG NGHIỆP VỤ ĐẦU-CUỐI
Luồng nghiệp vụ cốt lõi: Đăng tin → Tìm kiếm/Lọc → Xem tin → Ứng tuyển → Xem/Duyệt/Từ chối → Đã nhận người → Hoàn thành → Đánh giá.
Ý nghĩa: Nhà tuyển dụng tạo nhu cầu tuyển dụng; Sinh viên tìm kiếm và gửi hồ sơ; Nhà tuyển dụng xử lý hồ sơ; công việc được theo dõi đến khi hoàn thành; sau đó hai bên có thể đánh giá. Thông báo là hành vi hỗ trợ phát sinh khi trạng thái ứng tuyển thay đổi.
# 8. GHI CHÚ ĐỂ KHỚP USE CASE DIAGRAM
- Tên Use Case trên Diagram phải trùng với tên trong tài liệu đặc tả.
- Quy ước ID chốt: UC-06 = Ứng tuyển việc làm; không tách “Xem chi tiết tin tuyển dụng” thành Oval độc lập.
- Không cần biến “Đăng nhập” thành <<include>> của mọi Use Case; trong đặc tả, đăng nhập được thể hiện bằng Pre-condition khi nghiệp vụ yêu cầu xác thực.
- Không xem “Tìm kiếm & Lọc” là bắt buộc phải “Xem chi tiết”; người dùng có thể tìm kiếm/lọc và thay đổi điều kiện.
- UC-07 là một Oval duy nhất, bao gồm xem, duyệt và từ chối ứng viên.
- UC-09 chỉ phát sinh sau khi công việc hoàn thành.
- UC-10 là một Use Case duy nhất cho kiểm duyệt tin đăng & tài khoản.
- Thanh toán tiền thật, mobile native riêng biệt và chat real-time nâng cao không thuộc phạm vi bắt buộc của đặc tả hiện tại.

# 9. KẾT LUẬN
Tài liệu đặc tả Use Case đã được chuẩn hóa theo danh sách Use Case hiện tại của nhóm, bổ sung các luồng nghiệp vụ và Business Rules cần thiết, đồng thời sửa các lỗi format và lỗi đánh số. Đặc biệt, mã FR-01 đến FR-08 được giữ đúng theo tài liệu nguồn và không tự tạo thêm FR.
Trước khi nộp, cần đối chiếu lần cuối với Use Case Diagram của Tuấn để bảo đảm ID, tên Use Case và phạm vi Oval trên Diagram trùng khớp hoàn toàn.