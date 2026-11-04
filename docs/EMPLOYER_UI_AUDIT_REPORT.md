# BÁO CÁO RÀ SOÁT HIỆN TRẠNG GIAO DIỆN NHÀ TUYỂN DỤNG (EMPLOYER UI AUDIT REPORT)
**Dự án:** JOBNEST — Nền tảng kết nối việc làm bán thời gian và dự án cho sinh viên  
**Tác giả:** Senior Business Analyst, Senior UI/UX Designer & Senior Full-stack Engineer  
**Căn cứ đối chiếu:** `JOBNEST_Wireframe_44.drawio` (Trang `EMPLOYER (12)`), SRS, Business Rules, API Contract, DB Schema.  
**Ngày thực hiện:** 04/11/2026  

---

## 1. TỔNG QUAN RÀ SOÁT
Quy chuẩn đối chiếu gồm 12 màn hình luồng Nhà tuyển dụng (WF-E01 đến WF-E12). Sau khi rà soát mã nguồn frontend (`04_frontend/src/pages/employer/`) và đối chiếu trực tiếp với từng ô tọa độ và ghi chú kỹ thuật trong file Wireframe draw.io, các vấn đề cốt lõi đã được định danh và phân loại.

---

## 2. BẢNG ĐÁNH GIÁ CHI TIẾT 12 MÀN HÌNH

| ID | Tên Màn Hình | Hiện trạng triển khai | Mức độ nghiêm trọng | Vấn đề phát hiện so với Wireframe & Nghiệp vụ |
|:---|:---|:---:|:---:|:---|
| **WF-E02** | Personal Profile | Không chuẩn | **CRITICAL** | Giao diện hiện tại tự ý bổ sung "Hồ sơ Doanh nghiệp", mã số thuế, website, giấy phép kinh doanh, trong khi Wireframe ghi chú rõ: *`Backend chặn đổi email/phone. Không có Company Profile.`* Form chưa bám sát Personal Profile (Avatar, Tên hiển thị, Bio, Địa điểm, Email/Phone chỉ đọc, Box trạng thái xác minh và link đến WF-E03). |
| **WF-E03** | Verification Center | Bị gộp | **CRITICAL** | Đang bị gộp thành Tab 2 trong trang Profile thay vì là một màn hình riêng biệt theo Sidebar và Wireframe độc lập. Cần tách thành trang riêng với OTP Email và OTP Phone thực tế. |
| **WF-E01** | Employer Dashboard | Một phần | **MEDIUM** | Layout KPI đã có nhưng bảng `Application / Proposal mới` cần chuẩn hóa đúng 3 cột cốt lõi: `Student \| Loại \| Thời gian`, có hộp ghi chú viền nét đứt: *`Trạng thái UI / TBD: Dashboard tổng hợp, không có nghiệp vụ riêng.`* |
| **WF-E04** | Job List | Một phần | **MEDIUM** | Bộ lọc chưa đủ 7 trạng thái chuẩn: `All, Draft, Pending, Published, Closed, Expired, Rejected`. Khi job bị `REJECTED`, bắt buộc hiển thị `moderation_reason`. Các nút `Xem, Sửa, Đóng, Gửi duyệt` phải ẩn/hiện chính xác theo trạng thái tin. |
| **WF-E05** | Create / Edit Job | Một phần | **HIGH** | Form đang dùng chung một khung, chưa phân tách rõ ràng 3 biến thể động: `Part-time` (lương giờ/ca/ngày, lịch ca, ngày bắt đầu/kết thúc), `Seasonal` (lương toàn kỳ, ngày bắt đầu/kết thúc bắt buộc), `Freelance` (ngân sách, deliverable requirements, revision policy). Thiếu chặn gửi duyệt khi chưa xác minh Email + Phone. |
| **WF-E06** | Applicant Management | Không chuẩn | **HIGH** | Vẫn tồn tại nút duyệt hoặc xử lý chấp nhận tại chỗ. Wireframe ghi rõ: *`KHÔNG có nút Accept. Reviewing / Shortlist / Reject theo trạng thái; "Chọn ứng viên" → E08.`* |
| **WF-E07** | Proposal Management | Không chuẩn | **HIGH** | Vẫn gộp chung hoặc có hành động duyệt tại chỗ. Wireframe ghi rõ: *`KHÔNG có nút Accept. Chuyển sang E08 để chọn.`* Cần bảng riêng hiển thị Student, Estimated duration, Proposed price, Trạng thái. |
| **WF-E08** | Candidate Selection | Thiếu màn hình riêng | **HIGH** | Chưa có màn hình riêng chuyên biệt cho `POST /jobs/:jobId/selections`. Đây là màn hình DUY NHẤT được phép duyệt ứng viên và khởi tạo Work Assignment theo Quy tắc A3. Cần hiển thị Job, Chỉ tiêu (quantity_required, Đã chọn, Còn lại), danh sách ứng viên đủ điều kiện kèm checkbox và nút Xác nhận tuyển. |
| **WF-E09** | Assignment Management | Một phần | **MEDIUM** | Cần hiển thị bảng theo `Student \| Job \| Trạng thái \| Tiến độ %`. Phải dùng `Assignment.status`, tuyệt đối không dùng `Job.status`. |
| **WF-E10** | Deliverable Review | Một phần | **HIGH** | Modal nghiệm thu hiện tại có thể gây nhầm lẫn chuyển trạng thái Assignment sang COMPLETED. Wireframe quy định: *`Accept / Request Revision chỉ cập nhật Deliverable; Assignment vẫn IN_PROGRESS.`* Bắt buộc có lý do khi Request Revision. |
| **WF-E11** | Review Student | Một phần | **MEDIUM** | Cần đảm bảo chỉ hiển thị các Assignment đã COMPLETED và chưa từng được đánh giá, chấm điểm 1-5 sao và nhận xét. |
| **WF-E12** | Notifications | Một phần | **LOW** | Đã có danh sách thông báo nhưng click vào thông báo phải điều hướng chính xác về thực thể liên quan (Job, Application, Proposal, Assignment). |

---

## 3. KẾT LUẬN VÀ PHẠM VI HÀNH ĐỘNG
1. **Tách biệt hoàn toàn WF-E02 (Personal Profile) và WF-E03 (Verification Center)** thành 2 trang độc lập trong hệ thống Sidebar.
2. **Loại bỏ form Company Profile** khỏi WF-E02, chỉ giữ các trường cá nhân: Avatar, Tên hiển thị, Bio, Địa điểm, Email/Phone chỉ đọc, cùng Box hiển thị trạng thái xác minh.
3. **Triển khai chuyên biệt WF-E08 (Candidate Selection)** thành trung tâm tuyển chọn duy nhất, xóa bỏ toàn bộ nút Accept tại WF-E06 và WF-E07.
4. **Phân hóa Form WF-E05 thành 3 biến thể động:** Part-time, Seasonal, Freelance với validate điều kiện xác minh tài khoản trước khi gửi duyệt.
5. **Đồng bộ chặt chẽ Deliverable Review (WF-E10)** đảm bảo không tự động đóng Assignment sang COMPLETED.

