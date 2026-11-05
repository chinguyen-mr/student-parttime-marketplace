<!-- converted from 04_JOBNEST_Use_Case_Specification.docx -->

JOBNEST — USE CASE SPECIFICATION
| Thuộc tính | Nội dung |
| --- | --- |
| Tên file | 04_JOBNEST_Use_Case_Specification.docx |
| Phiên bản | v1.0 — Consolidated Draft |
| Ngày | 03/11/2026 |
| Trạng thái | DRAFT — 22/22 UC về tài liệu; 20/22 có đặc tả (chưa Approved); 2/22 PROPOSED cần nhóm review |
| Phạm vi | UC-01 → UC-22 |
| Nguồn | SRS v2.1; Use Case Specification Part 1/3, Part 2/3, Part 3/3; Wireframe Specification; API Contract; Database/ERD Specification và các delta đã xác nhận |

# MỤC LỤC
PART 1/3 — Authentication, Profile, Verification & Job Creation
1. UC-01 — Đăng ký tài khoản
2. UC-02 — Đăng nhập/Đăng xuất
3. UC-03 — Quên/đặt lại mật khẩu
4. UC-04 — Quản lý hồ sơ Student
5. UC-05 — Quản lý hồ sơ Employer
6. UC-06 — Xác minh email và số điện thoại
7. UC-07 — Tạo và quản lý Job

PART 2/3 — Moderation, Search, Application, Proposal & Selection
8. UC-08 — Kiểm duyệt Job
9. UC-09 — Tìm kiếm và xem Job
10. UC-10 — Lưu Job
11. UC-11 — Ứng tuyển Part-time/Seasonal
12. UC-12 — Quản lý Application
13. UC-13 — Gửi Freelance Proposal
14. UC-14 — Xét duyệt Freelance Proposal
15. UC-15 — Chọn nhiều ứng viên và tạo Assignment

PART 3/3 — Work Management, Review, Notification & Admin
16. UC-16 — Theo dõi tiến độ Assignment
17. UC-17 — Bàn giao và nghiệm thu Freelance
18. UC-18 — Xác nhận hoàn thành Assignment
19. UC-19 — Đánh giá hai chiều
20. UC-20 — Nhận thông báo
21. UC-21 — Quản lý người dùng và danh mục
22. UC-22 — Xử lý báo cáo
# QUY ƯỚC PHÂN LOẠI
- BASELINE: Nội dung có trong SRS/ERD/Backlog v2.1.
- REVISION: Nội dung bổ sung trong Rev.1 hoặc Rev.2.1, chờ nhóm review.
- PROPOSED: Đặc tả đề xuất dựa trên nguồn đã xác nhận, chưa phải baseline và cần nhóm review.
- TBD: Chưa có quyết định; không tự điền giá trị.
- [MISSING — cần đối chiếu nguồn]: Chưa đủ dữ liệu để đặc tả.
- Không thay đổi UC ID, FR ID, BR ID, PB ID.
- Không tự tạo UC-23/UC-24 cho FR-40.
- Không coi nội dung đã có đặc tả là nội dung đã được Approved.
# PART 1/3 — AUTHENTICATION, PROFILE, VERIFICATION & JOB CREATION
## UC-01 — ĐĂNG KÝ TÀI KHOẢN
Trạng thái: BASELINE — SRS v2.1
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-01 |
| Tên | Đăng ký tài khoản |
| Actor chính | Guest |
| Actor phụ | — |
| Mục tiêu | Tạo tài khoản Student hoặc Individual Employer |
| Trigger | Guest chọn chức năng Đăng ký trên trang chủ |
| Preconditions | Guest chưa đăng nhập; email chưa tồn tại trong hệ thống |
| Postconditions | User được tạo với role phù hợp; password được hash; profile tương ứng được tạo |
| FR mapping | FR-01 |
| PB mapping | PB-01, PB-06 |
| WF mapping | WF-G04 |
| BR mapping | BR-01, BR-02 |
| Entity | users, student_profiles, employer_profiles |

### 2. Main Flow
1. Guest chọn loại tài khoản Student hoặc Individual Employer.
2. Hệ thống hiển thị form đăng ký tương ứng với role.
3. Guest nhập email, password và thông tin cơ bản (full_name cho Student; display_name cho Employer).
4. Backend kiểm tra định dạng email và dữ liệu đầu vào.
5. Backend kiểm tra email chưa tồn tại.
6. Backend hash password bằng bcrypt.
7. Hệ thống tạo bản ghi users và profile tương ứng trong một transaction.
8. Hệ thống trả kết quả đăng ký thành công và userId.
### 3. Alternative Flow
- Guest chọn đăng ký bằng Google: ngoài phạm vi hiện tại, chỉ thực hiện nếu nhóm quyết định triển khai.
### 4. Exception Flow
| Mã | Trường hợp | Xử lý |
| --- | --- | --- |
| 4a | Email sai định dạng | Trả lỗi 400 và lỗi theo trường |
| 4b | Password không đạt yêu cầu | Trả lỗi 400; password strength policy còn TBD |
| 5a | Email đã tồn tại | Trả lỗi 409 |
| 7a | Lỗi database | Rollback transaction và trả lỗi |

### 5. Business Rules
- BR-01: Người dùng phải đăng nhập để thực hiện hành động cần ghi nhận danh tính.
- BR-02: Đăng ký công khai chỉ được chọn Student hoặc Individual Employer; Admin không tự đăng ký.
### 6. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| Password strength policy | TBD |
| Reset token expiry (liên quan UC-03) | TBD |
| Có hỗ trợ đăng ký qua Google không | Ngoài phạm vi baseline |

## UC-02 — ĐĂNG NHẬP / ĐĂNG XUẤT
Trạng thái: BASELINE — SRS v2.1
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-02 |
| Tên | Đăng nhập / Đăng xuất |
| Actor chính | Student / Individual Employer / Admin |
| Mục tiêu | Xác thực danh tính, nhận JWT và kết thúc phiên đăng nhập |
| Trigger | Người dùng chọn Đăng nhập hoặc Đăng xuất |
| Preconditions | Người dùng đã có tài khoản |
| Postconditions | Đăng nhập: JWT được cấp khi thông tin hợp lệ. Đăng xuất: phiên kết thúc theo cơ chế được chọn |
| FR mapping | FR-02 |
| PB mapping | PB-02, PB-03 |
| WF mapping | WF-G05 |
| BR mapping | BR-01 |
| Entity | users |

### 2. Main Flow — Đăng nhập
1. Người dùng nhập email và password.
2. Backend tìm tài khoản theo email.
3. Backend so sánh password với password_hash.
4. Nếu thông tin hợp lệ và tài khoản được phép truy cập, backend tạo JWT chứa thông tin định danh và role.
5. Hệ thống trả kết quả đăng nhập và token.
### 3. Main Flow — Đăng xuất
1. Người dùng chọn Đăng xuất.
2. Frontend thực hiện cơ chế kết thúc phiên theo thiết kế xác thực được chọn.
3. Người dùng được đưa về trạng thái chưa đăng nhập.
### 4. Exception Flow
| Mã | Trường hợp | Xử lý |
| --- | --- | --- |
| 2a | Không tìm thấy email | Trả 401; không tiết lộ email có tồn tại hay không |
| 3a | Password sai | Trả 401 |
| 4a | Tài khoản bị khóa | Từ chối truy cập, trả 403 |
| — | Cơ chế vô hiệu hóa JWT sau logout | Phụ thuộc quyết định kỹ thuật; không mặc định blacklist hoặc stateless logout |

### 5. Business Rules
- BR-01: Người dùng phải đăng nhập để thực hiện hành động cần ghi nhận danh tính.
### 6. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| JWT expiry | TBD — C1 |
| Logout token behavior | TBD — chưa chốt cơ chế vô hiệu hóa token (stateless vs blacklist/rotation) |
| Password strength | TBD — liên quan UC-03 |

## UC-03 — QUÊN / ĐẶT LẠI MẬT KHẨU
Phiên bản: Rev.2.1
Trạng thái: REVISION — bản nháp chờ nhóm review; không thay đổi baseline SRS v2.1.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-03 |
| Tên | Quên/đặt lại mật khẩu |
| Actor chính | Guest |
| Mục tiêu | Khôi phục quyền truy cập khi quên mật khẩu |
| Trigger | Guest chọn Quên mật khẩu tại màn hình đăng nhập |
| Preconditions | Người dùng chưa đăng nhập và truy cập được chức năng quên mật khẩu |
| Postconditions | Mật khẩu mới được lưu dạng hash; người dùng có thể đăng nhập bằng mật khẩu mới |
| FR mapping | FR-04 |
| PB mapping | PB-04 |
| WF mapping | WF-G05 |
| BR mapping | Không có BR đặc thù cho password reset |
| Entity | users, password_reset_tokens |

### 2. Main Flow
1. Guest mở chức năng Quên mật khẩu.
2. Guest nhập email tài khoản.
3. Hệ thống tiếp nhận yêu cầu khôi phục mật khẩu.
4. Backend xử lý yêu cầu reset theo phương thức được nhóm lựa chọn.
5. Người dùng nhận token/OTP theo phương thức triển khai.
6. Người dùng cung cấp token/OTP và mật khẩu mới.
7. Backend kiểm tra token có tồn tại, chưa sử dụng và chưa hết hạn.
8. Backend kiểm tra dữ liệu mật khẩu mới.
9. Backend hash mật khẩu mới.
10. Backend cập nhật mật khẩu và trạng thái sử dụng token theo transaction.
11. Hệ thống trả kết quả thành công.
### 3. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Email không hợp lệ | Từ chối theo validation |
| Token không tồn tại hoặc không hợp lệ | Từ chối yêu cầu |
| Token đã được sử dụng | Từ chối yêu cầu |
| Token hết hạn | Từ chối yêu cầu |
| Mật khẩu mới không đạt policy | Trả lỗi validation |
| Lỗi database trong quá trình cập nhật | Rollback; mật khẩu cũ phải được giữ nguyên |

### 4. Business Rules / NFR
- FR-04: Yêu cầu chức năng quên/đặt lại mật khẩu.
- PB-04: Yêu cầu token/OTP hết hạn, chỉ sử dụng một lần và password mới được hash.
- NFR-02: Không lưu password plaintext.
### 5. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| Reset token expiry | TBD — chưa mã hóa |
| Forgot-password rate limit | TBD — chưa mã hóa |
| Phương thức reset: OTP hay link | TBD — chưa mã hóa |
| Password strength policy | TBD — chưa mã hóa |
| Chi tiết provider gửi email | TBD |

## UC-04 — QUẢN LÝ HỒ SƠ STUDENT
Phiên bản: Rev.1
Trạng thái: REVISION — bản nháp chờ nhóm review; không thay đổi baseline v2.1.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-04 |
| Tên | Quản lý hồ sơ Student |
| Actor chính | Student |
| Mục tiêu | Xem và cập nhật hồ sơ cá nhân, kỹ năng, học vấn, kinh nghiệm và CV |
| Trigger | Student mở WF-S02 (My Profile) hoặc WF-S03 (CV Management) |
| Preconditions | Student đăng nhập bằng JWT hợp lệ; student_profiles đã tồn tại |
| Postconditions | Profile và các bảng dữ liệu liên quan được cập nhật; CV có thể được thêm theo chính sách được duyệt |
| FR mapping | FR-07, FR-08 |
| PB mapping | PB-07, PB-08 |
| WF mapping | WF-S02, WF-S03 |
| BR mapping | BR-01, BR-04 |
| Entity | student_profiles, student_skills, student_educations, student_experiences, student_cvs |

### 2. Main Flow
1. Student mở màn hình My Profile hoặc CV Management.
2. Hệ thống tải dữ liệu hiện tại từ profile và các bảng liên quan.
3. Student chọn section cần cập nhật: thông tin cá nhân, kỹ năng, học vấn, kinh nghiệm hoặc CV.
4. Student thêm, sửa hoặc xóa dữ liệu trong section tương ứng.
5. Student gửi yêu cầu lưu.
6. Backend kiểm tra dữ liệu và quyền sở hữu.
7. Backend cập nhật các bảng liên quan trong transaction.
8. Nếu Student đặt CV làm mặc định, hệ thống xử lý theo cơ chế T2 nếu được nhóm duyệt.
9. Hệ thống trả kết quả cập nhật.
### 3. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Không tải được dữ liệu | Hiển thị lỗi và cho phép thử lại |
| CV sai MIME/extension | Từ chối upload; allowlist TBD |
| CV vượt giới hạn dung lượng | Từ chối upload; size limit TBD |
| Xóa CV đang được applications.cv_id tham chiếu | Chính sách xử lý chưa chốt |
| Dữ liệu ngày tháng không hợp lệ | Trả lỗi validation |
| Lỗi database giữa transaction | Rollback |
| CV được yêu cầu đặt mặc định nhưng không thuộc Student hiện tại | Từ chối |

### 4. NFR / BR áp dụng
- NFR-02: Không trả password_hash.
- NFR-03: JWT và ownership.
- NFR-05: Backend validation.
- NFR-06: Bảo vệ dữ liệu profile/CV.
- NFR-07: Transaction.
- BR-01, BR-04.
### 5. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| S1: FR-08 nhắc chứng chỉ nhưng ERD chưa có bảng student_certificates; cần quyết định thêm bảng hay bỏ phần chứng chỉ | TBD |
| API-D1: Các endpoint quản lý CV chưa được duyệt | Chờ duyệt |
| Storage provider | TBD |
| MIME allowlist | TBD |
| Size limit CV | TBD |
| Chính sách xóa CV đang được Application tham chiếu | TBD |
| T2 — partial unique index cho CV mặc định — chưa migrate | Đề xuất |
| Cần xác minh ownership lấy từ JWT context, không tin dữ liệu client | Verify trước khi code |

## UC-05 — QUẢN LÝ HỒ SƠ EMPLOYER
Phiên bản: Rev.1
Trạng thái: REVISION — bản nháp chờ nhóm review; không thay đổi baseline v2.1.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-05 |
| Tên | Quản lý hồ sơ Employer |
| Actor chính | Individual Employer |
| Mục tiêu | Xem và cập nhật hồ sơ cá nhân; xem trạng thái xác minh email/phone |
| Trigger | Employer mở WF-E02 (Personal Profile) |
| Preconditions | Employer đăng nhập bằng JWT hợp lệ; employer_profiles đã tồn tại |
| Postconditions | Các trường profile được phép cập nhật; trạng thái xác minh không bị sửa qua UC này |
| FR mapping | FR-09, FR-10 |
| PB mapping | PB-09 |
| WF mapping | WF-E02 |
| BR mapping | BR-01, BR-03, BR-04 |
| Entity | employer_profiles, users |

### 2. Main Flow
1. Employer mở màn hình Employer Profile.
2. Hệ thống tải display_name, bio, location, avatar_url và thông tin email/phone cùng trạng thái xác minh.
3. Employer chỉnh sửa các trường profile được phép.
4. Nếu Employer muốn đổi email/phone, hệ thống hướng dẫn sang Verification Center (UC-06).
5. Employer gửi yêu cầu lưu.
6. Backend kiểm tra dữ liệu đầu vào và quyền sở hữu.
7. Backend cập nhật employer_profiles.
8. Hệ thống trả kết quả.
### 3. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Không tải được dữ liệu | Hiển thị lỗi và cho phép thử lại |
| Employer gửi yêu cầu sửa email/phone qua profile | Từ chối; hướng dẫn dùng UC-06 |
| Avatar sai MIME hoặc vượt size limit | Từ chối; giới hạn TBD |
| Dữ liệu profile không hợp lệ | Trả lỗi validation |
| Lỗi database | Không để lại dữ liệu cập nhật dở dang |

### 4. NFR / BR áp dụng
- NFR-02, NFR-03, NFR-05, NFR-06.
- BR-01, BR-03, BR-04.
### 5. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| MIME/extension avatar | TBD |
| Size limit avatar | TBD |
| Chính sách đổi display_name sau khi đã có Assignment | TBD |
| Backend phải chặn cập nhật trực tiếp email, phone, email_verified_at, phone_verified_at qua profile endpoint | Verify trước khi code |

## UC-06 — XÁC MINH EMAIL VÀ SỐ ĐIỆN THOẠI
Trạng thái: BASELINE — SRS v2.1
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-06 |
| Tên | Xác minh email và số điện thoại |
| Actor chính | Individual Employer |
| Mục tiêu | Xác minh email và số điện thoại để đủ điều kiện đăng tin |
| Trigger | Employer mở WF-E03 (Verification Center) |
| Preconditions | Employer đã đăng nhập; còn ít nhất một kênh chưa xác minh |
| Postconditions | email_verified_at và/hoặc phone_verified_at được cập nhật sau xác minh thành công |
| FR mapping | FR-05, FR-06 |
| PB mapping | PB-10 |
| WF mapping | WF-E03 |
| BR mapping | BR-03 |
| Entity | employer_profiles, verification_tokens |

### 2. Main Flow
1. Employer mở Verification Center.
2. Employer chọn xác minh email.
3. Backend tạo và gửi OTP/token qua email.
4. Employer nhập mã xác minh.
5. Backend kiểm tra token tồn tại, chưa sử dụng và chưa hết hạn.
6. Backend cập nhật used_at và email_verified_at.
7. Employer thực hiện quy trình tương tự cho số điện thoại.
8. Khi cả email và phone đã xác minh, Employer đáp ứng điều kiện xác minh để đăng tin.
### 3. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Mã sai | Trả lỗi; tăng attempt_count |
| Mã hết hạn | Từ chối xác minh |
| Vượt số lần thử | Từ chối theo cơ chế rate limit |
| Provider email/SMS gặp lỗi | Trả lỗi; provider chưa được chọn |

### 4. Business Rules
- BR-03: Employer phải xác minh email và số điện thoại trước khi tạo/gửi duyệt Job.
### 5. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| OTP expiry | TBD — G-15 |
| Rate limit và attempt threshold | TBD — G-16 |
| Email/SMS provider | TBD |
| Chính sách resend OTP | TBD |

## UC-07 — TẠO VÀ QUẢN LÝ JOB
Trạng thái: BASELINE — SRS v2.1
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-07 |
| Tên | Tạo và quản lý Job |
| Actor chính | Individual Employer |
| Mục tiêu | Tạo Job thuộc một trong ba loại và quản lý trạng thái Job |
| Trigger | Employer chọn chức năng tạo Job (WF-E05) |
| Preconditions | Employer đăng nhập; email và phone đã xác minh |
| Postconditions | Job được lưu với owner, job_type, quantity_required và trạng thái hợp lệ |
| FR mapping | FR-11, FR-12, FR-13, FR-14 |
| PB mapping | PB-12, PB-13, PB-14, PB-15 |
| WF mapping | WF-E04, WF-E05 |
| BR mapping | BR-03, BR-05, BR-06 |
| Entity | jobs, part_time_details, seasonal_details, freelance_details |

### 2. Main Flow
1. Employer chọn loại Job: PART_TIME, SEASONAL hoặc FREELANCE.
2. Hệ thống hiển thị form tương ứng với loại Job.
3. Employer nhập dữ liệu Job.
4. Backend validate dữ liệu theo job_type.
5. Hệ thống lưu jobs và bảng detail tương ứng trong transaction.
6. Hệ thống trả jobId và trạng thái Job.
### 3. Alternative Flow
- Lưu nháp: Job được lưu với trạng thái DRAFT.
- Gửi duyệt: Job được lưu với trạng thái PENDING_REVIEW; các bước notification liên quan phải tuân theo trigger policy C3.
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Thiếu trường bắt buộc | Trả lỗi 400 theo trường |
| quantity_required nhỏ hơn 1 | Trả lỗi 400 |
| Job Seasonal có end_date trước start_date | Trả lỗi 400 |
| Job Freelance thiếu scope, deliverable hoặc deadline bắt buộc | Trả lỗi 400 |
| Employer chưa xác minh email/phone | Từ chối thao tác |
| Lỗi database | Rollback transaction |

### 5. Business Rules
- BR-03: Employer phải xác minh email và phone.
- BR-05: Chỉ có PART_TIME, SEASONAL, FREELANCE.
- BR-06: Job chỉ công khai khi đáp ứng điều kiện dữ liệu và trạng thái kiểm duyệt.
### 6. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| Chính sách sửa Job sau khi PUBLISHED có cần duyệt lại hay không | TBD |
| Cơ chế tự động chuyển EXPIRED: cron hay manual | TBD — C4 |
| Chính sách moderation: duyệt tất cả hay chỉ flagged | TBD — C9 |
| Salary/budget theo job_type | TBD — S6 |
| Provider lưu file nếu Job có file đính kèm | TBD |

# PART 2/3 — MODERATION, SEARCH, APPLICATION, PROPOSAL & SELECTION
## UC-08 — KIỂM DUYỆT JOB
Phiên bản: Rev.1
Trạng thái: Bản nháp chờ nhóm review; không thay đổi baseline v2.1.
### 1. Thông tin UC
| Mục | Nội dung |
| --- | --- |
| UC ID | UC-08 |
| Tên | Kiểm duyệt Job |
| Actor | Admin |
| Mục tiêu | Admin xem hàng đợi Job chờ duyệt, quyết định PUBLISHED hoặc REJECTED kèm lý do |
| FR mapping | FR-15 |
| PB mapping | PB-31 |
| WF mapping | WF-A03 (Moderation Queue), WF-A04 (Moderation Detail) |
| Entity liên quan | jobs, admin_logs |

### 2. Preconditions
- Admin đã đăng nhập; JWT hợp lệ và role ADMIN.
- Có ít nhất một Job ở trạng thái PENDING_REVIEW.
- Job PENDING_REVIEW được tạo qua UC-07 (Employer gửi duyệt) theo state model §6.1.
### 3. Postconditions
Success — Duyệt
- jobs.status chuyển từ PENDING_REVIEW → PUBLISHED.
- jobs.published_at được set.
- Job xuất hiện trong kết quả tìm kiếm công khai (UC-09).
- Ghi bản ghi vào admin_logs: actor, action, target_type = 'JOB', target_id, timestamp.

Success — Từ chối
- jobs.status chuyển từ PENDING_REVIEW → REJECTED.
- jobs.moderation_reason được lưu (bắt buộc).
- Job không xuất hiện trong kết quả công khai.
- Ghi admin_logs.
- Đề xuất: tạo notification cho Employer owner (dựa trên FR-36, PB-30 — notification trigger list chưa chốt C3).

Failure
- Không có thay đổi trạng thái Job.
- Không ghi admin_logs với kết quả giả.
### 4. Main Flow
1. Admin mở WF-A03 (Moderation Queue).
2. Hệ thống load danh sách Job PENDING_REVIEW, sắp xếp theo submitted time (mới nhất trước).
3. Admin có thể filter theo job_type (PT/SV/FL).
4. Admin chọn một Job → mở WF-A04 (Moderation Detail).
5. Hệ thống hiển thị toàn bộ nội dung Job (view-only): title, description, salary/budget, quantity, detail theo job_type, employer info.
6. Admin quyết định Approve hoặc Reject.
7. Nếu Approve: Backend cập nhật jobs.status = 'PUBLISHED', set published_at = NOW(), ghi admin_logs trong một transaction (NFR-07, NFR-09).
8. Nếu Reject: Backend validate moderation_reason không rỗng, cập nhật jobs.status = 'REJECTED', lưu moderation_reason, ghi admin_logs trong một transaction.
9. Hệ thống quay về WF-A03, xóa Job khỏi queue.
10. Đề xuất: tạo notification cho Employer (FR-36).
### 5. Exception Flows
| Mã | Trường hợp | Xử lý |
| --- | --- | --- |
| 2a | Không load được queue | Error state + retry |
| 4a | Admin mở Job đã không còn PENDING_REVIEW (bị xử lý đồng thời) | 409 hoặc hiển thị lại trạng thái thực tế — đề xuất |
| 5a | Job detail có trường không hợp lệ phát hiện lúc review | Admin ghi nhận qua moderation_reason nếu reject — đề xuất |
| 6a | Admin reject nhưng moderation_reason rỗng | 400; không đổi trạng thái |
| 7a | Lỗi DB khi approve | Rollback; không đổi status |
| 8a | Lỗi DB khi reject | Rollback; không lưu reason dở dang |
| 10a | Notification tạo thất bại sau khi status đã đổi | Không rollback status; log lỗi notification để retry |

### 6. NFR & BR áp dụng
- NFR-03: JWT + role ADMIN; kiểm tra quyền truy cập.
- NFR-05: Validate moderation_reason khi reject.
- NFR-07: Transaction cho cập nhật status + ghi log.
- NFR-09: Ghi admin_logs cho mọi thao tác duyệt/từ chối.
- BR-06: Job chỉ được PUBLISHED khi đáp ứng điều kiện dữ liệu + duyệt.
- BR-17: Thao tác Admin phải ghi audit log.
### 7. TBD & điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| C9 — Moderation policy: duyệt tất cả Job hay chỉ Job bị gắn cờ? | Chưa chốt; ảnh hưởng trực tiếp đến phạm vi UC-08 |
| Danh sách moderation_reason chuẩn | Chưa chốt — template reason codes hay free-text |
| Thời hạn xử lý queue | Chưa chốt |
| Notification cho Employer khi reject | C3 chưa chốt |
| Job edit sau PUBLISHED có quay lại PENDING_REVIEW không? | TBD |
| State transition chỉ PENDING_REVIEW → PUBLISHED/REJECTED | Backend phải chặn Admin set trạng thái khác |
| admin_logs là bắt buộc | Cần verify service layer |
| PB-31 Must/Sprint 2 vs C9 OPEN | Lệch giữa cam kết backlog và policy mở; cần nhóm xác nhận |

### 8. FR/PB/WF mapping
| FR | PB | WF | Entity |
| --- | --- | --- | --- |
| FR-15 | PB-31 | WF-A03, WF-A04 | jobs, admin_logs |

## UC-09 — TÌM KIẾM VÀ XEM JOB
Phiên bản: Rev.1
Trạng thái: Bản nháp chờ nhóm review; không thay đổi baseline v2.1.
### 1. Thông tin UC
| Mục | Nội dung |
| --- | --- |
| UC ID | UC-09 |
| Tên | Tìm kiếm và xem Job |
| Actor | Guest / Student |
| Mục tiêu | Xem danh sách Job công khai; tìm/lọc/sắp xếp; xem chi tiết Job |
| FR mapping | FR-16, FR-17, FR-18, FR-19 |
| PB mapping | PB-16, PB-17 |
| WF mapping | WF-G01, WF-G02, WF-G03 |
| Entity liên quan | jobs, categories, employer_profiles, job_views |

### 2. Preconditions
- Không bắt buộc đăng nhập (Guest).
- Chỉ Job có status = 'PUBLISHED' và chưa hết hạn (application_deadline chưa qua) được hiển thị công khai — BR-06.
### 3. Postconditions
Success
- Trả về danh sách Job PUBLISHED khớp filter, có phân trang.
- Khi xem detail: trả đầy đủ thông tin Job + Employer public profile theo phạm vi NFR-06.
- Đề xuất: ghi job_views (viewer_id nếu đã đăng nhập, null nếu Guest); bảng có trong ERD §2.7 nhưng chưa có FR riêng quy định việc ghi view.

Failure
- Không lộ dữ liệu Job không PUBLISHED.
- Không lộ thông tin Employer ngoài phạm vi public.
### 4. Main Flow — Tìm kiếm (WF-G02)
1. Guest/Student mở WF-G01 (Home) hoặc WF-G02 (Job Listing).
2. Hệ thống hiển thị thanh tìm kiếm + bộ lọc: keywords, job_type, category, location, salary/budget range, sort.
3. User nhập keyword và/hoặc chọn filter.
4. User submit tìm kiếm.
5. Backend query jobs với điều kiện status = 'PUBLISHED' và các filter; bắt buộc loại trừ Job không PUBLISHED (BR-06).
6. Backend áp dụng sort; mặc định TBD.
7. Backend phân trang theo page, limit.
8. Trả kết quả danh sách + pagination.
### 4b. Main Flow — Xem chi tiết (WF-G03)
1. User click vào Job trong danh sách.
2. Hệ thống load chi tiết Job từ jobs + part_time_details / seasonal_details / freelance_details tương ứng job_type.
3. Hệ thống load Employer public profile từ employer_profiles (chỉ các trường public — NFR-06).
4. Hiển thị CTA:
   - Nếu Job PT/SV: “Ứng tuyển” (dẫn đến UC-11 nếu Student đã login; hoặc Login nếu Guest).
   - Nếu Job FL: “Gửi đề xuất” (dẫn đến UC-13 nếu đã login; hoặc Login nếu Guest).
5. Đề xuất: ghi vào job_views; bảng có trong ERD nhưng chưa có FR quy định.
### 5. Exception Flows
| Mã | Trường hợp | Xử lý |
| --- | --- | --- |
| 5a | Không có kết quả khớp | Trả danh sách rỗng + empty state có CTA |
| 5b | Lỗi DB khi query | Error state + retry |
| 3a (detail) | Job không tồn tại hoặc không PUBLISHED | 404; không tiết lộ Job có tồn tại hay không |
| 3b (detail) | Job PUBLISHED nhưng application_deadline đã qua | Vẫn hiển thị nhưng disable CTA Apply/Proposal — đề xuất |
| 2a (detail) | Employer public profile không load được | Vẫn hiển thị Job nhưng ẩn section Employer — đề xuất |
| — | Public categories endpoint không khả dụng | Filter category disable + thông báo; API-D9 chưa duyệt |

### 6. NFR & BR áp dụng
- NFR-01: API search p95 ≤ 1.5s (mục tiêu, chưa benchmark).
- NFR-05: Validate filter params.
- NFR-06: Chỉ trả Employer public fields; không trả email/phone nếu chưa được phép.
- BR-06: Chỉ Job PUBLISHED mới hiển thị công khai.
- BR-07: Job CLOSED/EXPIRED không nhận hồ sơ; việc vẫn hiển thị hay không là TBD.
### 7. TBD & điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| Sort mặc định (posted date desc? relevance?) | Chưa chốt |
| Job PUBLISHED nhưng quá application_deadline — còn hiển thị không? | Chưa chốt |
| Salary filter khi salary_min/max NULL, đặc biệt FL dùng budget_* | Chưa chốt — S6 |
| job_views — có ghi không, ghi khi nào | TBD |
| Public categories — route và response | API-D9 chưa duyệt |
| Có hiển thị Employer email/phone trên Job detail không | Phụ thuộc NFR-06 interpretation |
| Query luôn filter status = 'PUBLISHED' | Phải là WHERE clause bắt buộc |
| Employer public fields | Cần danh sách field public cụ thể |
| S6 salary/budget filter | Phải xử lý đúng khi Job dùng budget_* thay vì salary_* |

### 8. FR/PB/WF mapping
| FR | PB | WF | Entity |
| --- | --- | --- | --- |
| FR-16, FR-17, FR-18, FR-19 | PB-16, PB-17 | WF-G01, WF-G02, WF-G03 | jobs, categories, employer_profiles |

## UC-10 — LƯU JOB
Phiên bản: Rev.1
Trạng thái: Bản nháp chờ nhóm review; không thay đổi baseline v2.1.
### 1. Thông tin UC
| Mục | Nội dung |
| --- | --- |
| UC ID | UC-10 |
| Tên | Lưu Job |
| Actor | Student |
| Mục tiêu | Student lưu Job yêu thích để xem lại; bỏ lưu |
| FR mapping | FR-20 |
| PB mapping | PB-18 |
| WF mapping | WF-S04 (Saved Jobs) |
| Entity liên quan | job_saved |

### 2. Preconditions
- Student đã đăng nhập; JWT hợp lệ.
- Job cần lưu đang ở trạng thái PUBLISHED (theo BR-06 — chỉ Job public mới tương tác được).
### 3. Postconditions
Success — Lưu
- Bản ghi job_saved được tạo với (student_id, job_id).
- UQ (student_id, job_id) đảm bảo không lưu trùng.

Success — Bỏ lưu
- Bản ghi job_saved bị xóa (hoặc soft-delete nếu nhóm chốt — chưa chốt).
- Nếu Job chưa được lưu: idempotent hoặc 404 — phụ thuộc convention API-D2 chưa duyệt.

Failure
- Không thay đổi dữ liệu.
- Không ảnh hưởng đến saved jobs khác.
### 4. Main Flow
1. Student xem WF-G03 (Job Detail) hoặc WF-G02 (Listing).
2. Hệ thống hiển thị icon/button “Lưu”; trạng thái phụ thuộc việc Job đã được Student lưu hay chưa.
3. Student click “Lưu”.
4. Backend kiểm tra JWT hợp lệ, role STUDENT, Job PUBLISHED.
5. Backend tạo bản ghi job_saved.
6. Trả kết quả thành công; UI chuyển button thành “Đã lưu”.
Bỏ lưu (từ WF-S04 hoặc từ Job Detail):
1. Student click “Bỏ lưu”.
2. Backend kiểm tra JWT, ownership của record job_saved.
3. Backend xóa/soft-delete bản ghi.
4. Trả kết quả.
### 5. Exception Flows
| Mã | Trường hợp | Xử lý |
| --- | --- | --- |
| 3a | Guest click “Lưu” | Redirect đến Login, giữ return URL |
| 4a | Job không PUBLISHED (đã đóng/expired) | 409 hoặc 404 — chưa chốt |
| 4b | Lưu Job đã lưu trước đó | Idempotent 200 hoặc 409 — phụ thuộc API-D2 |
| 4c | Bỏ lưu Job chưa được lưu | Idempotent 200 hoặc 404 — phụ thuộc API-D2 |
| 4d | Bỏ lưu Job của Student khác | 403 |
| 5a | Lỗi DB khi insert/delete | 500; không thay đổi |

### 6. NFR & BR áp dụng
- NFR-03: JWT + role STUDENT + ownership job_saved.
- NFR-05: Validate jobId param.
- NFR-07: Transaction.
- BR-01: Phải đăng nhập.
- BR-06: Chỉ Job PUBLISHED mới thao tác được.
- BR-07: Job CLOSED/EXPIRED — nếu đã lưu từ trước, còn hiển thị trong Saved Jobs không? TBD.
### 7. TBD & điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| API-D2 convention — POST/DELETE vs POST {saved: bool} | Chưa duyệt |
| Lưu trùng / bỏ lưu chưa lưu → idempotent hay lỗi? | Phụ thuộc API-D2 |
| Job đã lưu nhưng sau đó bị CLOSED/EXPIRED → có hiển thị trong Saved Jobs không? | Chưa chốt |
| Soft-delete hay hard-delete khi bỏ lưu | Chưa chốt |
| Có giới hạn số Job lưu tối đa không | Chưa chốt |
| UQ(student_id, job_id) | Kiểm tra constraint có trong migration |
| Ownership khi bỏ lưu | Backend phải kiểm tra job_saved thuộc Student hiện tại |
| Job status filter | Khi load danh sách Saved Jobs, có filter jobs.status = 'PUBLISHED' hay không — TBD |

### 8. FR/PB/WF mapping
| FR | PB | WF | Entity |
| --- | --- | --- | --- |
| FR-20 | PB-18 | WF-S04 | job_saved |

## UC-11 — ỨNG TUYỂN PART-TIME / SEASONAL
Nguồn: SRS v2.1 §8 — đặc tả UC mẫu.
Trạng thái: Có đặc tả từ SRS v2.1; chưa Approved.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-11 |
| Tên | Ứng tuyển Part-time/Seasonal |
| Actor chính | Student |
| Preconditions | Student đăng nhập; Job PUBLISHED, còn hạn và còn nhận hồ sơ |
| Main Flow | Student mở Job; chọn Ứng tuyển; chọn CV hoặc nhập giới thiệu; hệ thống kiểm tra trùng đơn và điều kiện Job; lưu Application PENDING; tạo notification cho Employer |
| Postconditions | Application được lưu duy nhất cho Student/Job |
| FR mapping | FR-23, FR-24 theo catalog; chi tiết mapping cần đối chiếu |
| PB mapping | TBD |
| WF mapping | WF-S06 |
| BR mapping | BR-07, BR-08 |
| Entity | applications, jobs, users |

### 2. Main Flow
1. Student mở Job Part-time/Seasonal.
2. Student chọn chức năng Ứng tuyển.
3. Student chọn CV hoặc nhập nội dung giới thiệu.
4. Hệ thống kiểm tra trùng Application và điều kiện Job.
5. Backend lưu Application với trạng thái PENDING.
6. Hệ thống tạo notification cho Employer.
### 3. Alternative / Exception Flow
- Application trùng: từ chối.
- Job đóng/hết hạn: từ chối.
- Dữ liệu thiếu hoặc không hợp lệ: từ chối và thông báo lỗi.
### 4. Business Rules
- BR-07: Job CLOSED/EXPIRED không nhận Application mới.
- BR-08: Một Student một Application cho một Job; rút đơn không xóa lịch sử.
### 5. TBD / Missing
- Chính sách rút Application: C2/S2 TBD.
- CV requirement: G-28 TBD.
- Notification trigger: C3 TBD.
- API history/withdraw: API-D3 chưa duyệt.
## UC-12 — QUẢN LÝ APPLICATION
Trạng thái: PROPOSED — cần nhóm review.
Ghi chú: Dựng từ nguồn xác nhận, không phải baseline. UC-12 không được xem là Approved.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-12 |
| Tên | Quản lý Application |
| Actor chính | Individual Employer / Student |
| Mục tiêu | Employer xem xét, chuyển trạng thái Application; Student xem lịch sử và rút đơn khi được phép |
| Trigger | Employer mở WF-E06 (Application Management); Student mở WF-S05 (Application History) |
| Preconditions | Người dùng đăng nhập; Employer sở hữu Job có Application; Student là chủ Application |
| Postconditions | Application được cập nhật trạng thái hợp lệ; notification gửi cho Student theo C3 |
| FR mapping | FR-23, FR-24; FR-22 — cần xác minh phạm vi (lịch sử + rút đơn) |
| PB mapping | TBD |
| WF mapping | WF-E06 (Employer), WF-S05 (Student) |
| BR mapping | BR-04, BR-07, BR-08 |
| API mapping | API-D3 — cần xác minh phạm vi (history + withdraw); chưa duyệt |
| Entity | applications, jobs, users, notifications |

### 2. Main Flow A — Employer xem và xét duyệt Application
1. Employer mở WF-E06 (Application Management).
2. Backend xác định Employer từ JWT.
3. Backend tải danh sách Application thuộc Job do Employer sở hữu.
4. Employer chọn một Application để xem chi tiết.
5. Hệ thống hiển thị hồ sơ được phép theo NFR-06 — CV/giới thiệu, không lộ dữ liệu nhạy cảm.
6. Employer chọn hành động chuyển trạng thái hợp lệ: PENDING → REVIEWING → SHORTLISTED → REJECTED.
7. Backend kiểm tra quyền sở hữu Job và trạng thái hiện tại.
8. Backend cập nhật trạng thái Application.
9. Tạo notification cho Student sau khi lưu thành công theo BR-16 và C3; trigger list TBD.
### 3. Main Flow B — Student xem lịch sử và rút đơn
1. Student mở WF-S05 (Application History).
2. Backend tải danh sách Application của Student hiện tại.
3. Student chọn một Application để xem chi tiết.
4. Nếu trạng thái cho phép rút (chưa ACCEPTED, theo chính sách C2/S2), Student chọn Rút đơn.
5. Backend kiểm tra trạng thái và chính sách rút đơn.
6. Backend cập nhật Application sang WITHDRAWN; không xóa lịch sử theo BR-08.
7. Hệ thống trả kết quả.
### 4. Alternative Flow
- Employer chọn hồ sơ để tuyển: chuyển sang UC-15 (Candidate Selection).
- Application đã ACCEPTED: không cho rút theo BR-08 và chính sách C2/S2.
- Student chỉ xem được Application thuộc tài khoản hiện tại.
### 5. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Employer không sở hữu Job | 403 |
| Student truy cập Application của người khác | 403 |
| Application không tồn tại | 404 |
| Chuyển trạng thái không hợp lệ theo state model | Từ chối (400) |
| Cố set ACCEPTED qua PATCH | Từ chối theo A3 |
| Cố rút Application đã ACCEPTED | Từ chối theo BR-08 + C2/S2 |
| Lỗi database | Rollback |

### 6. Business Rules
- BR-04: Employer chỉ xem/sửa Application thuộc Job mình sở hữu.
- BR-07: Job đóng/hết hạn không nhận Application mới; không ảnh hưởng Application đã có.
- BR-08: Một Student một Application cho một Job; rút đơn không xóa lịch sử.
- A3: PATCH /applications/:id/status không được set ACCEPTED; chỉ POST /jobs/:jobId/selections được.
### 7. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| Chính sách rút Application (thời điểm, điều kiện) | C2/S2 — TBD |
| FR-22 — xác minh phạm vi chính xác (chỉ history hay bao gồm cả withdraw) | Cần xác minh |
| API-D3 — xác minh endpoint nào thuộc history, endpoint nào thuộc withdraw | Chưa duyệt / cần đối chiếu API Contract |
| Notification trigger cho từng trạng thái Application | C3 — TBD |
| Hiển thị CV/giới thiệu cho Employer — mức chi tiết | G-25 → G-31 / NFR-06 — TBD |
| Idempotency khi Employer chuyển trạng thái lặp | TBD |
| Danh sách trạng thái hiển thị trên WF-E06 | Cần đối chiếu WF Spec Part 2/2 |
| Danh sách trạng thái hiển thị trên WF-S05 | Cần đối chiếu WF Spec Part 2/2 |
| Trạng thái WITHDRAWN có hiển thị cho Employer không | TBD |

## UC-13 — GỬI FREELANCE PROPOSAL
Nguồn: SRS v2.1 §8 — đặc tả UC mẫu.
Trạng thái: Có đặc tả từ SRS v2.1; chưa Approved.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-13 |
| Tên | Gửi Freelance Proposal |
| Actor chính | Student |
| Preconditions | Student đăng nhập; Job FREELANCE đang PUBLISHED và nhận Proposal |
| Main Flow | Student mở Job Freelance; nhập proposal, thời gian dự kiến và giá đề xuất nếu có; gửi; Backend kiểm tra Job và trùng Proposal; lưu SUBMITTED; thông báo Employer |
| Postconditions | Proposal gắn đúng Job và Student |
| FR mapping | FR-25, FR-26 |
| PB mapping | TBD |
| WF mapping | WF-S07 |
| BR mapping | BR-09 |
| Entity | freelance_proposals, jobs, notifications |

### 2. Main Flow
1. Student mở Job Freelance.
2. Student nhập Proposal, thời gian dự kiến và giá đề xuất nếu trường này được bật.
3. Student gửi Proposal.
4. Backend kiểm tra Job và trùng Proposal.
5. Backend lưu Proposal với trạng thái SUBMITTED.
6. Hệ thống thông báo Employer.
### 3. Alternative Flow
- Proposal có thể WITHDRAWN khi chính sách cho phép (S3 — TBD).
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Job không phải Freelance | Từ chối theo BR-09 |
| Job đóng/hết hạn | Từ chối theo BR-07 |
| Proposal trùng | Từ chối |

### 5. Business Rules
- BR-09: Freelance dùng Proposal riêng, không thay thế Application.
### 6. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| Withdraw Proposal | S3 — TBD |
| API-D5 | Chưa duyệt |
| Giá đề xuất có bắt buộc không | TBD |

## UC-14 — XÉT DUYỆT FREELANCE PROPOSAL
Trạng thái: PROPOSED — cần nhóm review.
Ghi chú: Dựng từ nguồn xác nhận, không phải baseline. UC-14 chưa được Approved.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-14 |
| Tên | Xét duyệt Freelance Proposal |
| Actor chính | Individual Employer |
| Mục tiêu | Employer xem, đánh giá Proposal và chuyển trạng thái phù hợp; chọn Proposal qua UC-15 để tạo Assignment |
| Trigger | Employer mở WF-E07 (Proposal Review) |
| Preconditions | Employer đăng nhập; sở hữu Job FREELANCE đang nhận Proposal; Proposal ở trạng thái SUBMITTED hoặc REVIEWING |
| Postconditions | Proposal được chuyển sang trạng thái hợp lệ (REVIEWING, REJECTED) hoặc chuyển sang UC-15 để ACCEPTED |
| FR mapping | FR-26 |
| PB mapping | TBD |
| WF mapping | WF-E07 |
| BR mapping | BR-04, BR-09 |
| API mapping | Path cập nhật trạng thái chưa được chốt; API Contract hiện ghi PATCH /proposals/:id/status. Không được set ACCEPTED (A3) |
| Entity | freelance_proposals — theo Database Specification; nếu Database Spec dùng tên khác cần đối chiếu lại |

Lưu ý entity: SRS v2.1 không nêu tên bảng cụ thể; tên freelance_proposals được lấy theo Database Specification. Nếu Database Specification chưa chốt, giữ TBD — cần đối chiếu Database Specification.
### 2. Main Flow
1. Employer mở WF-E07 (Proposal Review) cho Job FREELANCE do mình sở hữu.
2. Backend xác định Employer từ JWT.
3. Backend tải danh sách Proposal thuộc Job đó.
4. Employer chọn một Proposal để xem chi tiết.
5. Hệ thống hiển thị nội dung Proposal, thời gian dự kiến và giá đề xuất nếu trường này được bật (FR-25).
6. Employer chọn hành động:
   - Chuyển REVIEWING — theo API Contract hiện tại ghi PATCH /proposals/:id/status.
   - Chuyển REJECTED — theo API Contract hiện tại ghi PATCH /proposals/:id/status.
   - Chọn Proposal để tạo Assignment → chuyển sang UC-15, dùng POST /jobs/:jobId/selections theo A3.
7. Backend kiểm tra quyền sở hữu Job và trạng thái hiện tại.
8. Backend cập nhật trạng thái nếu là REVIEWING hoặc REJECTED, hoặc chuyển sang xử lý selection qua UC-15.
9. Notification gửi cho Student sau khi lưu thành công theo BR-16 và C3 — TBD.
### 3. Alternative Flow
- Nếu Employer quyết định chọn Proposal, hệ thống chuyển sang UC-15.
- Việc chấp nhận Proposal không được thực hiện bằng endpoint PATCH trạng thái.
- Chi tiết bổ sung thông tin cho Proposal: [MISSING — cần đối chiếu nguồn].
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Employer không sở hữu Job | 403 |
| Job không phải FREELANCE | Từ chối |
| Proposal không tồn tại | 404 |
| PATCH yêu cầu trạng thái ACCEPTED | Từ chối theo A3 |
| Proposal ở trạng thái không hợp lệ | 400 hoặc từ chối theo state model |
| Proposal đã REJECTED hoặc WITHDRAWN được đưa vào selection | Từ chối |
| Lỗi database | Rollback |
| Vượt quantity_required | Xử lý tại UC-15; không tạo Assignment ngoài hạn mức |

### 5. Business Rules
- BR-04: Employer chỉ xem/sửa Proposal thuộc Job mình sở hữu.
- BR-09: Freelance dùng Proposal riêng, không thay thế Application.
- A3: Chỉ POST /jobs/:jobId/selections được phép set ACCEPTED và tạo Assignment.
### 6. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| C3 — Notification trigger cho Proposal | TBD |
| Giá đề xuất có bắt buộc không | TBD |
| Chính sách rút Proposal | S3 — TBD |
| API-D5 — Withdraw Proposal | Chưa duyệt |
| Reject comment/reason có bắt buộc không | TBD |
| Số Proposal được chuyển REVIEWING đồng thời | TBD |
| Idempotency khi Employer cập nhật trạng thái lặp | TBD |
| Danh sách trạng thái hiển thị trên WF-E07 | Cần đối chiếu WF Spec Part 2/2 |
| Chi tiết Proposal cần hiển thị | Cần đối chiếu nguồn |
| API path cập nhật trạng thái Proposal | Cần đối chiếu API Contract; chưa được tự chốt |

## UC-15 — CHỌN NHIỀU ỨNG VIÊN VÀ TẠO ASSIGNMENT
Nguồn: SRS v2.1 §8 — đặc tả UC mẫu.
Trạng thái: Có đặc tả từ SRS v2.1; chưa Approved.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-15 |
| Tên | Chọn nhiều ứng viên và tạo Assignment |
| Actor chính | Individual Employer |
| Mục tiêu | Employer chọn một hoặc nhiều ứng viên; hệ thống tạo Assignment riêng cho từng người trong hạn mức quantity_required |
| Preconditions | Employer sở hữu Job; các hồ sơ ở trạng thái có thể chọn |
| Postconditions | Mỗi người được chọn có một Assignment riêng; tổng không vượt quantity_required |
| FR mapping | FR-27, FR-28 |
| PB mapping | TBD |
| WF mapping | WF-E08 |
| BR mapping | BR-10, BR-11 |
| Entity | work_assignments, applications, freelance_proposals, jobs |
| Đặc biệt | Endpoint duy nhất: POST /jobs/:jobId/selections (A3) |

### 2. Main Flow
1. Employer chọn ứng viên.
2. Backend khóa/kiểm tra số lượng đã accepted.
3. So sánh với quantity_required.
4. Nếu còn chỉ tiêu: cập nhật Application/Proposal ACCEPTED và tạo Work Assignment cho từng Student.
5. Ghi notification.
### 3. Alternative Flow
- Nếu còn chỉ tiêu một phần: chọn một số ứng viên và để lại phần còn lại để chọn sau.
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Vượt quantity_required | Từ chối toàn bộ thao tác hoặc xử lý theo transaction; không tạo Assignment một phần ngoài ý muốn |
| Trạng thái hồ sơ không hợp lệ | Từ chối |
| Lỗi database | Rollback toàn bộ |
| Employer không sở hữu Job | 403 |

### 5. Business Rules
- BR-10: Số Assignment không vượt quantity_required.
- BR-11: Mỗi Student được chọn có một Assignment riêng.
- A3: Chỉ endpoint selections được set ACCEPTED và tạo Assignment.
### 6. TBD / Missing
| Nội dung | Trạng thái |
| --- | --- |
| Cơ chế idempotency cho selections | TBD — liên quan G-59 |
| Notification trigger cho selection | C3 — TBD |

# PART 3/3 — WORK MANAGEMENT, REVIEW, NOTIFICATION & ADMIN
## UC-16 — THEO DÕI TIẾN ĐỘ ASSIGNMENT
Phiên bản: Rev.1
Trạng thái: REVISION — bản nháp chờ nhóm review.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-16 |
| Tên | Theo dõi tiến độ Assignment |
| Actor chính | Student / Individual Employer |
| Mục tiêu | Xem thông tin Assignment và cập nhật, theo dõi tiến độ công việc |
| Trigger | Student hoặc Employer mở màn hình chi tiết Assignment |
| Preconditions | Người dùng đã đăng nhập; Assignment tồn tại; người dùng là participant của Assignment |
| Postconditions | Tiến độ được cập nhật nếu request hợp lệ; lịch sử tiến độ ghi nhận actor và thời điểm |
| FR mapping | FR-29, FR-30 |
| PB mapping | PB-24, PB-25 |
| WF mapping | WF-S08, WF-E09 |
| BR mapping | BR-12, BR-13 |
| Entity | work_assignments, work_progress |

### 2. Main Flow A — Xem Assignment và tiến độ
1. Student hoặc Employer mở màn hình chi tiết Assignment.
2. Backend xác định người dùng hiện tại từ JWT.
3. Backend tải Assignment và kiểm tra quyền participant.
4. Hệ thống hiển thị thông tin Assignment, trạng thái và tiến độ.
5. Hệ thống hiển thị lịch sử tiến độ nếu dữ liệu được API cung cấp.
### 3. Main Flow B — Cập nhật tiến độ
1. Người tham gia mở Assignment đang thực hiện.
2. Người dùng nhập nội dung cập nhật và progress_percent nếu trường này được hỗ trợ.
3. Người dùng submit.
4. Backend kiểm tra JWT, quyền truy cập và trạng thái Assignment.
5. Backend validate dữ liệu tiến độ.
6. Backend ghi nhận tiến độ vào work_progress.
7. Hệ thống cập nhật thông tin tiến độ và trả kết quả.
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Assignment không tồn tại | 404 |
| Người dùng không phải participant | 403; không trả dữ liệu Assignment |
| Assignment không ở trạng thái cho phép cập nhật | Từ chối request |
| progress_percent ngoài khoảng hợp lệ | Trả lỗi validation; khoảng 0–100 cần được xác nhận theo G-06/G-07 liên quan |
| Lỗi database | Không tạo bản ghi tiến độ dở dang |
| Không tải được lịch sử tiến độ | [MISSING — cần đối chiếu nguồn] về cách trả lỗi và khả năng hiển thị dữ liệu cũ |

### 5. NFR / BR áp dụng
- NFR-03: JWT và kiểm tra quyền truy cập.
- NFR-05: Backend validation.
- NFR-07: Transaction khi cần cập nhật nhiều dữ liệu liên quan.
- BR-12: Lifecycle Assignment độc lập với Application/Proposal và Job.
- BR-13: Chỉ các participant được xem/cập nhật tiến độ và deliverable.
### 6. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| G-06: Actor được phép cập nhật progress — (A) chỉ Student; (B) cả Student và Employer; (C) Student cập nhật, Employer chỉ xem/xác nhận | TBD — không tự chọn phương án |
| G-58: Lịch sử progress được nhúng trong GET /assignments/:id hay cần endpoint riêng | TBD |
| G-59: Cơ chế idempotency cho các thao tác cập nhật tiến độ nếu request được gửi lặp | TBD |
| progress_percent có bắt buộc không; giới hạn và cách tính | TBD |
| Quy tắc chuyển trạng thái NOT_STARTED → IN_PROGRESS tự động hay do actor thực hiện | TBD |
| Verify Assignment chỉ được truy cập bởi participant, không chỉ dựa vào UI | Verify trước khi code |

## UC-17 — BÀN GIAO VÀ NGHIỆM THU FREELANCE
Trạng thái: BASELINE — SRS v2.1.
Lưu ý: Cần đọc cùng State Model Assignment và Deliverable; không nhập trạng thái Deliverable vào Assignment.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-17 |
| Tên | Bàn giao và nghiệm thu Freelance |
| Actor chính | Student (gửi Deliverable) / Individual Employer (nghiệm thu) |
| Mục tiêu | Student gửi sản phẩm bàn giao; Employer chấp nhận hoặc yêu cầu chỉnh sửa |
| Trigger | Student gửi Deliverable hoặc Employer mở Deliverable để nghiệm thu |
| Preconditions | Assignment thuộc Job FREELANCE và đang IN_PROGRESS; người gửi là Student được giao Assignment |
| Postconditions | Tạo Deliverable version mới; Deliverable có trạng thái SUBMITTED, ACCEPTED hoặc REVISION_REQUESTED theo hành động; Assignment vẫn IN_PROGRESS cho đến khi hoàn tất qua UC-18 |
| FR mapping | FR-31, FR-32 |
| PB mapping | PB-26, PB-27 |
| WF mapping | WF-S09, WF-E10 |
| BR mapping | BR-13, BR-14 |
| Entity | work_assignments, work_deliverables |

### 2. Main Flow A — Student gửi Deliverable
1. Student mở Assignment Freelance đang IN_PROGRESS.
2. Student chọn chức năng gửi Deliverable.
3. Student nhập mô tả và cung cấp file/link bàn giao.
4. Backend kiểm tra Assignment, quyền Student và dữ liệu gửi lên.
5. Backend xác định version_no tiếp theo.
6. Backend tạo bản ghi work_deliverables với version mới.
7. Deliverable được lưu với trạng thái SUBMITTED.
8. Hệ thống trả kết quả gửi bàn giao.
### 3. Main Flow B — Employer nghiệm thu
1. Employer mở Assignment và Deliverable đang chờ nghiệm thu.
2. Backend kiểm tra Employer sở hữu Job liên quan.
3. Hệ thống hiển thị nội dung Deliverable và version.
4. Employer chọn Accept hoặc Request Revision.
5. Backend kiểm tra quyền và trạng thái Deliverable.
6. Nếu Accept: cập nhật Deliverable thành ACCEPTED.
7. Nếu Request Revision: cập nhật Deliverable thành REVISION_REQUESTED và lưu comment.
8. Hệ thống trả kết quả.
### 4. Alternative Flow — Accept
1. Employer chấp nhận Deliverable.
2. Deliverable chuyển sang ACCEPTED.
3. Employer thực hiện xác nhận hoàn thành Assignment theo UC-18.
4. Assignment chỉ chuyển COMPLETED khi thỏa điều kiện hoàn thành.
### 5. Alternative Flow — Request Revision
1. Employer chọn Request Revision.
2. Employer nhập comment yêu cầu chỉnh sửa.
3. Backend kiểm tra comment theo policy được duyệt.
4. Deliverable chuyển REVISION_REQUESTED.
5. Assignment vẫn giữ IN_PROGRESS.
6. Student gửi phiên bản tiếp theo với version_no mới.
### 6. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| File không hợp lệ về MIME/extension | Từ chối upload |
| File vượt giới hạn dung lượng | Từ chối upload |
| Người gửi không phải Student được giao Assignment | 403 |
| Employer không sở hữu Job | 403 |
| Deliverable không ở trạng thái cho phép nghiệm thu | Từ chối |
| Request Revision không có comment | Từ chối theo yêu cầu comment của quy trình |
| Lỗi storage sau khi DB đã tạo metadata hoặc ngược lại | [MISSING — cần đối chiếu nguồn] về cơ chế rollback/orphan cleanup |

### 7. NFR / BR áp dụng
- NFR-03: JWT và ownership.
- NFR-05: Backend validation.
- NFR-06: Bảo vệ file và dữ liệu Deliverable.
- NFR-07: Transaction khi cập nhật dữ liệu liên quan.
- BR-13: Chỉ participant được truy cập tiến độ và Deliverable.
- BR-14: Freelance chỉ hoàn thành khi Deliverable cuối cùng được chấp nhận và Employer xác nhận.
### 8. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| Storage provider | TBD |
| MIME allowlist và size limit | TBD |
| API lấy danh sách version Deliverable | API-D6 (GET /assignments/:id/deliverables) chưa duyệt |
| Chính sách giới hạn số lần revision | C10 — TBD |
| Comment bắt buộc khi Request Revision; giới hạn độ dài comment | Comment bắt buộc theo quy trình hiện tại; max length TBD |
| Quy tắc chọn Deliverable mới nhất | Verify với version_no |
| T1/M1 là đề xuất State Model Assignment, chưa được duyệt | Không dùng SUBMITTED/REVISION_REQUESTED làm trạng thái Assignment |

## UC-18 — XÁC NHẬN HOÀN THÀNH ASSIGNMENT
Phiên bản: Rev.1
Trạng thái: REVISION — bản nháp chờ nhóm review.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-18 |
| Tên | Xác nhận hoàn thành Assignment |
| Actor chính | Individual Employer |
| Mục tiêu | Employer xác nhận Assignment đã hoàn thành |
| Trigger | Employer chọn chức năng xác nhận hoàn thành trên Assignment |
| Preconditions | Employer đăng nhập; sở hữu Job liên quan; Assignment đang IN_PROGRESS |
| Postconditions | Assignment chuyển COMPLETED; completed_at được cập nhật |
| FR mapping | FR-33 |
| PB mapping | PB-28 |
| WF mapping | WF-E09 |
| BR mapping | BR-12, BR-14, BR-16 |
| Entity | work_assignments, work_deliverables, notifications |

### 2. Main Flow
1. Employer mở Assignment.
2. Hệ thống hiển thị trạng thái và thông tin công việc.
3. Employer chọn xác nhận hoàn thành.
4. Backend xác minh Employer sở hữu Job và Assignment đang IN_PROGRESS.
5. Backend kiểm tra điều kiện hoàn thành theo loại Job:
   - PART_TIME / SEASONAL: Employer xác nhận công việc hoàn thành.
   - FREELANCE: Deliverable mới nhất phải có trạng thái ACCEPTED.
6. Backend cập nhật Assignment thành COMPLETED và set completed_at.
7. Hệ thống lưu thay đổi nghiệp vụ.
8. Tạo notification sau khi giao dịch nghiệp vụ thành công theo C3.
9. Hệ thống trả kết quả.
### 3. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Employer không sở hữu Job | 403 |
| Assignment không tồn tại | 404 |
| Assignment không ở IN_PROGRESS | Từ chối |
| Job Freelance nhưng chưa có Deliverable | Từ chối hoàn thành |
| Deliverable mới nhất đang SUBMITTED hoặc REVISION_REQUESTED | Từ chối; Assignment giữ IN_PROGRESS |
| Lỗi database | Rollback; Assignment không chuyển trạng thái dở dang |
| Notification thất bại sau khi Assignment đã COMPLETED | Không rollback trạng thái nghiệp vụ; retry policy TBD |

### 4. NFR / BR áp dụng
- NFR-03: JWT và ownership.
- NFR-05: Validation trạng thái và điều kiện hoàn thành.
- NFR-07: Transaction.
- BR-12: Lifecycle Assignment độc lập.
- BR-14: Freelance chỉ hoàn thành khi Deliverable cuối cùng được chấp nhận và Employer xác nhận.
- BR-16: Notification chỉ tạo sau khi lưu thành công trạng thái nghiệp vụ.
### 5. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| T1: State Model Assignment M1 (NOT_STARTED → IN_PROGRESS → COMPLETED) là đề xuất Phase 1 Rev.6, chưa được duyệt | Đề xuất |
| G-59: Gọi complete lần thứ hai trên Assignment đã COMPLETED: idempotent 200 hay 409 | TBD |
| Quy tắc xác nhận hoàn thành PT/SV ngoài thao tác Employer | [MISSING — cần đối chiếu nguồn] |
| Notification trigger | C3 |
| Verify chỉ Employer owner được xác nhận hoàn thành | Verify trước khi code |
| Không sử dụng trạng thái SUBMITTED hoặc REVISION_REQUESTED trên Assignment | Theo T1 đề xuất |

## UC-19 — ĐÁNH GIÁ HAI CHIỀU
Trạng thái: BASELINE — SRS v2.1
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-19 |
| Tên | Đánh giá hai chiều |
| Actor chính | Student / Individual Employer |
| Mục tiêu | Đánh giá đối tác sau khi Assignment hoàn thành |
| Trigger | Participant mở Assignment đã COMPLETED và chọn Đánh giá |
| Preconditions | Assignment COMPLETED; người đánh giá là participant; chưa đánh giá Assignment này |
| Postconditions | Tạo review mới; mỗi participant chỉ có một review trên một Assignment |
| FR mapping | FR-34, FR-35 |
| PB mapping | PB-29 |
| WF mapping | WF-S10, WF-E11 |
| BR mapping | BR-15 |
| Entity | reviews, work_assignments, users |

### 2. Main Flow
1. Student hoặc Employer mở Assignment đã COMPLETED.
2. Hệ thống hiển thị chức năng Đánh giá.
3. User chọn rating và nhập comment nếu có.
4. User submit review.
5. Backend kiểm tra:
   - Assignment đang COMPLETED.
   - User là participant.
   - User chưa tạo review cho Assignment này.
6. Backend tạo bản ghi reviews với reviewer và reviewee tương ứng.
7. Hệ thống trả kết quả tạo review.
8. Tạo notification cho đối tác nếu C3 cho phép.
### 3. Alternative Flow
- Student đánh giá Employer.
- Employer đánh giá Student.
- Hai bên thực hiện độc lập; mỗi bên có bản ghi review riêng.
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Assignment chưa COMPLETED | Từ chối; không tạo review |
| User đã review Assignment | Từ chối tạo review trùng |
| User không phải participant | 403 |
| Rating không hợp lệ | Trả lỗi validation |
| Vi phạm unique constraint (assignment_id, reviewer_id) | Từ chối tạo review trùng |
| Lỗi database | Không tạo bản ghi review dở dang |

### 5. NFR / BR áp dụng
- NFR-03: JWT và participant ownership.
- NFR-05: Validation.
- NFR-07: Transaction nếu có thao tác liên quan.
- BR-15: Chỉ Assignment COMPLETED mới được đánh giá; mỗi bên một review trên Assignment.
### 6. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| Rating scale | C10 |
| Comment required hay optional | G-41 |
| Comment maximum length | G-42 |
| Notification sau khi tạo review | C3 |
| Chính sách hiển thị review và thời điểm công khai | [MISSING — cần đối chiếu nguồn] |
| Không tự thêm cơ chế sửa/xóa review nếu chưa có yêu cầu nguồn | Giữ nguyên |
| Verify unique constraint (assignment_id, reviewer_id) | Verify trước khi code |
| Verify reviewer/reviewee là hai participant | Verify trước khi code |

## UC-20 — NHẬN THÔNG BÁO
Phiên bản: Rev.1
Trạng thái: REVISION — bản nháp chờ nhóm review.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-20 |
| Tên | Nhận thông báo |
| Actor chính | Student / Individual Employer |
| Mục tiêu | Nhận và xem thông báo liên quan đến hoạt động, trạng thái nghiệp vụ |
| Trigger | Hệ thống tạo notification sau một sự kiện nghiệp vụ thành công |
| Preconditions | User có tài khoản; notification được tạo cho đúng người nhận |
| Postconditions | User xem được danh sách thông báo; trạng thái đã đọc được cập nhật khi thực hiện thao tác đọc |
| FR mapping | FR-36 |
| PB mapping | PB-30 |
| WF mapping | WF-S11, WF-E12 |
| BR mapping | BR-16 |
| Entity | notifications, users |

### 2. Main Flow A — Nhận thông báo
1. Một nghiệp vụ liên quan đến User được lưu thành công.
2. Backend xác định người nhận theo sự kiện nghiệp vụ.
3. Backend tạo notification sau khi transaction nghiệp vụ thành công.
4. Notification được liên kết với đúng người nhận và đối tượng liên quan.
5. Notification xuất hiện trong danh sách của User.
### 3. Main Flow B — Xem thông báo
1. User mở khu vực Notifications.
2. Backend xác định User hiện tại từ JWT.
3. Backend tải các notification thuộc User.
4. Hệ thống hiển thị nội dung, thời điểm và trạng thái đã đọc/chưa đọc.
5. User chọn một notification để xem.
### 4. Main Flow C — Đánh dấu đã đọc
1. User chọn đánh dấu notification đã đọc.
2. Backend xác minh notification thuộc User hiện tại.
3. Backend cập nhật trạng thái đã đọc.
4. Hệ thống trả kết quả.
### 5. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Không có notification | Hiển thị empty state |
| Không tải được danh sách | Hiển thị lỗi và cho phép thử lại |
| User truy cập notification của người khác | Từ chối |
| Notification không tồn tại khi mark-read | 404 |
| Notification không thuộc User hiện tại | 403 |
| Đánh dấu đã đọc nhiều lần | Hành vi idempotent hay trả lỗi còn TBD |

### 6. NFR / BR áp dụng
- NFR-03: JWT và ownership.
- NFR-05: Validation.
- NFR-07: Transaction nghiệp vụ.
- BR-16: Notification chỉ được tạo sau khi nghiệp vụ lưu thành công.
### 7. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| C3: Danh sách trigger notification cụ thể cho Application, Proposal, Assignment, Deliverable, Review và Admin actions | TBD |
| G-43: Mark-read nhiều lần: idempotent hay trả lỗi | TBD |
| G-44: Có cho phép User xóa notification hay không | TBD |
| G-07: Pagination limit và sort order | TBD |
| Notification có soft-delete hay hard-delete | TBD |
| Provider notification (email/SMS/in-app) | TBD |
| Verify notification không được tạo trước khi transaction nghiệp vụ commit | Verify trước khi code |

## UC-21 — QUẢN LÝ NGƯỜI DÙNG VÀ DANH MỤC
Phiên bản: Rev.1
Trạng thái: REVISION — bản nháp chờ nhóm review.

Lưu ý phạm vi: UC-21 giữ nguyên tên và ID theo SRS v2.1. Phần mô tả hiện tại bao gồm User Management và Category Management theo WF-A02/WF-A07. Không tự gộp Dashboard/Logs của FR-40 vào UC này.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-21 |
| Tên | Quản lý người dùng và danh mục |
| Actor chính | Admin |
| Mục tiêu | Quản lý tài khoản User và danh mục Job |
| Trigger | Admin mở User Management hoặc Category Management |
| Preconditions | Admin đăng nhập; JWT role ADMIN |
| Postconditions | User status hoặc dữ liệu Category được cập nhật theo quyền; thao tác Admin được ghi audit log theo BR-17 |
| FR mapping | FR-37, FR-38 |
| PB mapping | PB-32 — mapping hiện tại còn PARTIAL, cần S4 |
| WF mapping | WF-A02, WF-A07 |
| BR mapping | BR-17 |
| Entity | users, categories, admin_logs |

### 2. Main Flow A — Quản lý User
1. Admin mở WF-A02 (User Management).
2. Hệ thống tải danh sách User.
3. Admin tìm kiếm hoặc lọc User.
4. Admin chọn một User để xem thông tin.
5. Admin chọn hành động khóa hoặc mở khóa tài khoản.
6. Backend kiểm tra role Admin và điều kiện thao tác.
7. Backend cập nhật trạng thái tài khoản.
8. Backend ghi admin_logs.
9. Hệ thống trả kết quả.
### 3. Main Flow B — Quản lý Category
1. Admin mở WF-A07 (Category Management).
2. Hệ thống tải danh sách Category.
3. Admin chọn tạo mới, sửa hoặc thay đổi trạng thái Category.
4. Admin nhập hoặc cập nhật dữ liệu Category.
5. Backend validate dữ liệu.
6. Backend lưu thay đổi.
7. Backend ghi admin_logs.
8. Hệ thống trả kết quả.
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Không tải được danh sách User/Category | Hiển thị lỗi và cho phép thử lại |
| Người dùng không có quyền Admin | 403 |
| Admin cố khóa tài khoản Admin cuối cùng | Từ chối theo Acceptance Criteria PB-32 |
| Dữ liệu Category không hợp lệ | Trả lỗi validation |
| Category trùng tên hoặc vi phạm ràng buộc dữ liệu | Từ chối |
| Lỗi database | Không để lại dữ liệu cập nhật dở dang |
| Xóa Category đang được Job tham chiếu | [MISSING — cần đối chiếu nguồn] về chính sách restrict/cascade/soft-delete |

### 5. NFR / BR áp dụng
- NFR-03: JWT và role ADMIN.
- NFR-05: Backend validation.
- NFR-07: Transaction.
- NFR-09: Ghi audit log cho thao tác quản trị.
- BR-17: Hoạt động Admin phải được ghi log.
### 6. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| S4: PB-32 hiện gộp User, Category và Log; cần quyết định tách hay mở rộng PB. Các test CAT/LOG đang PROPOSED, chưa phải official | TBD |
| API-D7: GET/PATCH /admin/users và thao tác khóa/mở khóa chưa hoàn thiện trong API Contract | Chờ duyệt |
| API-D8: CRUD Category chưa hoàn thiện trong API Contract | Chờ duyệt |
| S5: Public Category route /categories hay /jobs/categories | TBD |
| Category có phân cấp parent-child hay không | [MISSING — cần đối chiếu nguồn] |
| Quy tắc xóa Category đang được Job sử dụng | [MISSING — cần đối chiếu nguồn] |
| Quy tắc khóa/mở khóa User và các trạng thái tài khoản | Cần đối chiếu state model |
| Verify mọi thao tác quản trị bắt buộc ghi admin_logs | Verify trước khi code |

### 7. Ghi chú về FR-40
- FR-40 (Dashboard & Audit Logs) không được xem là đã đặc tả đầy đủ bởi UC-21.
- SRS hiện có 22 UC, chưa có UC riêng cho FR-40.
- Không tự tạo UC-23/UC-24 trong tài liệu này.
- Gap G-49 ghi nhận: FR-40 chưa có UC mapping chính thức.
- S4 cần quyết định có tách PB-32 hay không; nếu tách, có thể bổ sung UC mới ở giai đoạn sau.
## UC-22 — XỬ LÝ BÁO CÁO
Phiên bản: Rev.1
Trạng thái: REVISION — bản nháp chờ nhóm review.
### 1. Thông tin chung
| Trường | Nội dung |
| --- | --- |
| UC ID | UC-22 |
| Tên | Xử lý báo cáo |
| Actor chính | Admin |
| Mục tiêu | Admin xem và xử lý báo cáo vi phạm liên quan đến Job hoặc User |
| Trigger | Admin mở WF-A05 (Reports) |
| Preconditions | Admin đăng nhập; có báo cáo được gửi vào hệ thống |
| Postconditions | Báo cáo được cập nhật trạng thái xử lý; thao tác Admin được ghi log theo BR-17 |
| FR mapping | FR-39 |
| PB mapping | PB-33 |
| WF mapping | WF-A05, WF-A06 |
| BR mapping | BR-17 |
| Entity | reports, users, jobs, admin_logs |

### 2. Main Flow A — Xem danh sách Report
1. Admin mở WF-A05 (Reports).
2. Backend kiểm tra role ADMIN.
3. Hệ thống tải danh sách báo cáo.
4. Admin lọc theo trạng thái hoặc loại đối tượng nếu có hỗ trợ.
5. Admin chọn một báo cáo.
6. Hệ thống mở WF-A06 (Report Detail).
### 3. Main Flow B — Xử lý Report
1. Admin xem nội dung báo cáo và đối tượng bị báo cáo.
2. Admin kiểm tra thông tin liên quan.
3. Admin chọn hành động xử lý.
4. Backend kiểm tra quyền Admin và trạng thái hiện tại của Report.
5. Backend cập nhật kết quả xử lý.
6. Backend ghi admin_logs.
7. Hệ thống trả kết quả và cập nhật danh sách Report.
### 4. Exception Flow
| Trường hợp | Xử lý |
| --- | --- |
| Người không phải Admin truy cập chức năng | 403 |
| Không có báo cáo | Hiển thị empty state |
| Không tải được danh sách | Hiển thị lỗi và cho phép thử lại |
| Report không tồn tại | 404 |
| Report đã được xử lý hoặc trạng thái không còn hợp lệ | Từ chối hoặc trả trạng thái hiện tại; policy TBD |
| Lỗi database khi cập nhật Report | Không lưu trạng thái dở dang |
| Ghi audit log thất bại | Phải xử lý theo yêu cầu BR-17; chi tiết transaction/retry [MISSING — cần đối chiếu nguồn] |

### 5. NFR / BR áp dụng
- NFR-03: JWT và role ADMIN.
- NFR-05: Backend validation.
- NFR-07: Transaction.
- NFR-09: Audit logging.
- BR-17: Thao tác Admin phải được ghi nhận.
### 6. TBD / Điểm cần verify
| Nội dung | Trạng thái |
| --- | --- |
| API-D10: POST /reports để User gửi Report chưa có trong API Contract | Chờ duyệt |
| Report initial status | G-48 |
| Các trạng thái và transition xử lý Report | [MISSING — cần đối chiếu nguồn] |
| Hành động Admin được phép thực hiện đối với từng loại Report | [MISSING — cần đối chiếu nguồn] |
| Quy tắc xử lý Report trùng | G-51 / TBD |
| Notification cho người báo cáo hoặc đối tượng bị báo cáo | C3 |
| Report có thể nhắm đến Job, User hay cả hai theo FR-39 | Cần xác định |
| Verify audit log cho các hành động xử lý Report | Verify trước khi code |

# CÁC ĐIỂM KIỂM SOÁT BẮT BUỘC KHI TRIỂN KHAI
## 1. A3 — Selection là đường duy nhất để ACCEPTED và tạo Assignment
- PATCH /applications/:id/status không được set ACCEPTED.
- PATCH /proposals/:id/status không được set ACCEPTED.
- Chỉ POST /jobs/:jobId/selections thực hiện chọn ứng viên, set ACCEPTED và tạo Work Assignment trong cùng transaction.
- Không tạo Assignment từ endpoint cập nhật trạng thái Application hoặc Proposal.
## 2. Assignment và Deliverable là hai lifecycle riêng
- Assignment không dùng SUBMITTED hoặc REVISION_REQUESTED theo đề xuất T1/M1; T1 chưa được duyệt.
- Deliverable sử dụng SUBMITTED, ACCEPTED, REVISION_REQUESTED.
- Khi Request Revision, Assignment vẫn IN_PROGRESS.
- Assignment Freelance chỉ COMPLETED sau khi Deliverable mới nhất được ACCEPTED và Employer xác nhận.
## 3. G-06 vẫn TBD
Không tự chọn:
- Chỉ Student được cập nhật progress.
- Cả Student và Employer được cập nhật progress.
- Student cập nhật, Employer chỉ xem/xác nhận.
## 4. C3 vẫn TBD
Không tự xác định danh sách trigger notification.
## 5. G-58/G-59 vẫn TBD
Không tự quyết định:
- History endpoint riêng hay dữ liệu history nhúng trong Assignment detail.
- Idempotency của thao tác complete hoặc cập nhật progress.
## 6. FR-40 chưa có UC riêng
- Không tự thêm UC-23/UC-24.
- Không tuyên bố UC-21 đã bao phủ FR-40.
- G-49 ghi nhận gap này.
## 7. PB-32 và S4
- User Management, Category Management, Logs chưa được tách chính thức.
- Test CAT/LOG vẫn là PROPOSED, không tính vào official coverage.
## 8. Các chi tiết chưa có nguồn
Phải tiếp tục giữ [MISSING — cần đối chiếu nguồn], không tự thêm trạng thái, endpoint, policy hoặc acceptance criteria.
# TỔNG KẾT FILE 04 — USE CASE SPECIFICATION
## 1. Phân bố theo nhóm
| Nhóm | UC | Số lượng |
| --- | --- | --- |
| Part 1/3 — Authentication, Profile, Verification, Job Creation | UC-01 → UC-07 | 7 |
| Part 2/3 — Moderation, Search, Application, Proposal, Selection | UC-08 → UC-15 | 8 |
| Part 3/3 — Work Management, Review, Notification, Admin | UC-16 → UC-22 | 7 |
| Tổng | UC-01 → UC-22 | 22 |

## 2. Trạng thái tài liệu đã chốt
| Phạm vi | Trạng thái | Đếm |
| --- | --- | --- |
| UC-01 → UC-07 | Có đặc tả (chưa Approved) | 7 |
| UC-08 → UC-10 | Có đặc tả Rev.1, chờ review | 3 |
| UC-11, UC-13, UC-15 | Có đặc tả từ SRS v2.1 | 3 |
| UC-12, UC-14 | PROPOSED — cần nhóm review | 2 |
| UC-16 → UC-22 | Có đặc tả (chưa Approved) | 7 |
| Tổng | 22/22 có nội dung — chưa Approved | 22 |

## 3. Trạng thái cuối cùng
| Thuộc tính | Giá trị |
| --- | --- |
| Tên file | 04_JOBNEST_Use_Case_Specification.docx |
| Phiên bản | v1.0 — Consolidated Draft |
| Tổng UC | 22/22 có nội dung tài liệu |
| UC có đặc tả (chưa Approved) | 20/22 |
| UC PROPOSED cần review | 2/22 — UC-12, UC-14 |
| Trạng thái | DRAFT — 22/22 UC về tài liệu; 20/22 có đặc tả (chưa Approved); 2/22 PROPOSED (UC-12, UC-14) cần nhóm review; chưa Approved tổng thể. |
| Phê duyệt | Chưa Approved |

## 4. Giới hạn xác minh
- Không UC nào được mặc định là đã nghiệm thu chỉ vì đã có bản đặc tả.
- Những quyết định C/S/T/API-D/G chưa được nhóm chốt tiếp tục giữ nguyên trạng thái mở.
- A3 enforcement đã áp dụng về mặt logic — chưa xác nhận đã code.
- T1/M1/T2 vẫn là đề xuất — chưa duyệt, chưa migrate.
- Test Case liên quan: 334 TC (223 Not Run + 110 TBD + 1 Manual); không có test nào được xác nhận Pass.
# KẾT THÚC FILE 04 — JOBNEST USE CASE SPECIFICATION
Trạng thái chốt: DRAFT — 22/22 UC về tài liệu; 20/22 có đặc tả (chưa Approved); 2/22 PROPOSED (UC-12, UC-14) cần nhóm review; chưa Approved tổng thể.