-- Seed file: 002_seed_proposals_notifications.sql (Day 2)

-- Seed Proposals for Freelance Jobs
INSERT INTO freelance_proposals (job_id, student_id, proposal_text, estimated_duration, proposed_price, status) VALUES
(1, 53, 'Em có 2 năm kinh nghiệm làm React.js và Node.js, từng làm 3 dự án freelance tương tự. Em cam kết giao sản phẩm đúng hạn và hỗ trợ fix bug 1 tháng.', '3 ngày', 1500000, 'SUBMITTED'),
(1, 54, 'Chào anh/chị, em là sinh viên năm cuối ĐH Văn Lang chuyên ngành Thiết kế đồ họa. Em thành thạo Figma, Photoshop và Illustrator, sẵn sàng gửi portfolio qua email.', '5 ngày', 1600000, 'SUBMITTED'),
(1, 55, 'Em nhận dự án này và có thể bắt đầu ngay hôm nay. Em sẽ cập nhật tiến độ mỗi 2 ngày một lần để anh/chị tiện theo dõi.', '1 tuần', 1700000, 'SUBMITTED'),
(101, 56, 'Chào anh/chị, em là sinh viên năm cuối ĐH Văn Lang chuyên ngành Thiết kế đồ họa. Em thành thạo Figma, Photoshop và Illustrator, sẵn sàng gửi portfolio qua email.', '5 ngày', 1800000, 'SUBMITTED'),
(101, 57, 'Em nhận dự án này và có thể bắt đầu ngay hôm nay. Em sẽ cập nhật tiến độ mỗi 2 ngày một lần để anh/chị tiện theo dõi.', '1 tuần', 1900000, 'REVIEWING'),
(105, 59, 'Em nhận dự án này và có thể bắt đầu ngay hôm nay. Em sẽ cập nhật tiến độ mỗi 2 ngày một lần để anh/chị tiện theo dõi.', '1 tuần', 2100000, 'REVIEWING'),
(105, 60, 'Em đã đọc kỹ bản mô tả công việc. Với kinh nghiệm làm đồ án chuyên đề tương tự, em tự tin hoàn thành công việc đạt chất lượng tốt nhất với chi phí tối ưu.', '10 ngày', 2200000, 'REJECTED'),
(105, 61, 'Em có thế mạnh về UI/UX và responsive design. Cam kết tối ưu hóa tốc độ tải trang và tương thích đa nền tảng.', '2 tuần', 2300000, 'SUBMITTED'),
(128, 62, 'Em đã đọc kỹ bản mô tả công việc. Với kinh nghiệm làm đồ án chuyên đề tương tự, em tự tin hoàn thành công việc đạt chất lượng tốt nhất với chi phí tối ưu.', '10 ngày', 2400000, 'SUBMITTED'),
(128, 63, 'Em có thế mạnh về UI/UX và responsive design. Cam kết tối ưu hóa tốc độ tải trang và tương thích đa nền tảng.', '2 tuần', 2500000, 'SUBMITTED'),
(154, 65, 'Em có thế mạnh về UI/UX và responsive design. Cam kết tối ưu hóa tốc độ tải trang và tương thích đa nền tảng.', '2 tuần', 2700000, 'SUBMITTED'),
(154, 66, 'Chào quý công ty, em từng thực tập vị trí Frontend Developer, có kỹ năng tốt về RESTful API và Git workflow. Rất mong có cơ hội hợp tác.', '3 ngày', 2800000, 'REVIEWING'),
(154, 67, 'Em có thể hoàn thành phần việc này trong vòng 5 ngày. Đã từng thực hiện các dự án tương tự với đánh giá 5 sao từ khách hàng trước.', '5 ngày', 2900000, 'REVIEWING'),
(174, 68, 'Chào quý công ty, em từng thực tập vị trí Frontend Developer, có kỹ năng tốt về RESTful API và Git workflow. Rất mong có cơ hội hợp tác.', '3 ngày', 3000000, 'REVIEWING'),
(174, 69, 'Em có thể hoàn thành phần việc này trong vòng 5 ngày. Đã từng thực hiện các dự án tương tự với đánh giá 5 sao từ khách hàng trước.', '5 ngày', 3100000, 'REJECTED'),
(176, 71, 'Em có thể hoàn thành phần việc này trong vòng 5 ngày. Đã từng thực hiện các dự án tương tự với đánh giá 5 sao từ khách hàng trước.', '5 ngày', 3300000, 'SUBMITTED'),
(176, 72, 'Em cam kết viết code sạch, có tài liệu hướng dẫn và tuân thủ chặt chẽ design tokens của công ty.', '1 tuần', 3400000, 'SUBMITTED'),
(176, 73, 'Em có 2 năm kinh nghiệm làm React.js và Node.js, từng làm 3 dự án freelance tương tự. Em cam kết giao sản phẩm đúng hạn và hỗ trợ fix bug 1 tháng.', '10 ngày', 3500000, 'SUBMITTED'),
(2, 74, 'Em cam kết viết code sạch, có tài liệu hướng dẫn và tuân thủ chặt chẽ design tokens của công ty.', '1 tuần', 3600000, 'SUBMITTED'),
(2, 75, 'Em có 2 năm kinh nghiệm làm React.js và Node.js, từng làm 3 dự án freelance tương tự. Em cam kết giao sản phẩm đúng hạn và hỗ trợ fix bug 1 tháng.', '10 ngày', 3700000, 'REVIEWING'),
(110, 77, 'Em có 2 năm kinh nghiệm làm React.js và Node.js, từng làm 3 dự án freelance tương tự. Em cam kết giao sản phẩm đúng hạn và hỗ trợ fix bug 1 tháng.', '10 ngày', 3900000, 'REVIEWING'),
(110, 78, 'Chào anh/chị, em là sinh viên năm cuối ĐH Văn Lang chuyên ngành Thiết kế đồ họa. Em thành thạo Figma, Photoshop và Illustrator, sẵn sàng gửi portfolio qua email.', '2 tuần', 4000000, 'REJECTED'),
(110, 79, 'Em nhận dự án này và có thể bắt đầu ngay hôm nay. Em sẽ cập nhật tiến độ mỗi 2 ngày một lần để anh/chị tiện theo dõi.', '3 ngày', 4100000, 'SUBMITTED'),
(111, 80, 'Chào anh/chị, em là sinh viên năm cuối ĐH Văn Lang chuyên ngành Thiết kế đồ họa. Em thành thạo Figma, Photoshop và Illustrator, sẵn sàng gửi portfolio qua email.', '2 tuần', 4200000, 'SUBMITTED'),
(111, 81, 'Em nhận dự án này và có thể bắt đầu ngay hôm nay. Em sẽ cập nhật tiến độ mỗi 2 ngày một lần để anh/chị tiện theo dõi.', '3 ngày', 4300000, 'SUBMITTED'),
(116, 53, 'Em nhận dự án này và có thể bắt đầu ngay hôm nay. Em sẽ cập nhật tiến độ mỗi 2 ngày một lần để anh/chị tiện theo dõi.', '3 ngày', 4500000, 'SUBMITTED'),
(116, 54, 'Em đã đọc kỹ bản mô tả công việc. Với kinh nghiệm làm đồ án chuyên đề tương tự, em tự tin hoàn thành công việc đạt chất lượng tốt nhất với chi phí tối ưu.', '5 ngày', 4600000, 'REVIEWING'),
(116, 55, 'Em có thế mạnh về UI/UX và responsive design. Cam kết tối ưu hóa tốc độ tải trang và tương thích đa nền tảng.', '1 tuần', 4700000, 'REVIEWING'),
(117, 56, 'Em đã đọc kỹ bản mô tả công việc. Với kinh nghiệm làm đồ án chuyên đề tương tự, em tự tin hoàn thành công việc đạt chất lượng tốt nhất với chi phí tối ưu.', '5 ngày', 4800000, 'REVIEWING'),
(117, 57, 'Em có thế mạnh về UI/UX và responsive design. Cam kết tối ưu hóa tốc độ tải trang và tương thích đa nền tảng.', '1 tuần', 4900000, 'REJECTED'),
(122, 59, 'Em có thế mạnh về UI/UX và responsive design. Cam kết tối ưu hóa tốc độ tải trang và tương thích đa nền tảng.', '1 tuần', 1600000, 'SUBMITTED'),
(122, 60, 'Chào quý công ty, em từng thực tập vị trí Frontend Developer, có kỹ năng tốt về RESTful API và Git workflow. Rất mong có cơ hội hợp tác.', '10 ngày', 1700000, 'SUBMITTED'),
(122, 61, 'Em có thể hoàn thành phần việc này trong vòng 5 ngày. Đã từng thực hiện các dự án tương tự với đánh giá 5 sao từ khách hàng trước.', '2 tuần', 1800000, 'SUBMITTED'),
(136, 62, 'Chào quý công ty, em từng thực tập vị trí Frontend Developer, có kỹ năng tốt về RESTful API và Git workflow. Rất mong có cơ hội hợp tác.', '10 ngày', 1900000, 'SUBMITTED'),
(136, 63, 'Em có thể hoàn thành phần việc này trong vòng 5 ngày. Đã từng thực hiện các dự án tương tự với đánh giá 5 sao từ khách hàng trước.', '2 tuần', 2000000, 'REVIEWING')
ON CONFLICT (job_id, student_id) DO NOTHING;

-- Seed Notifications for Users (Idempotent: tránh duplicate khi re-seed)
INSERT INTO notifications (user_id, type, title, body, target_type, target_id, read_at)
SELECT v.user_id, v.type, v.title, v.body, v.target_type, v.target_id, v.read_at
FROM (VALUES
(53, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 1, CURRENT_TIMESTAMP - INTERVAL '0 days'),
(54, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 2, NULL),
(55, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 3, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(56, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 4, NULL),
(57, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 5, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(58, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 6, NULL),
(59, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 7, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(60, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 8, NULL),
(61, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 9, CURRENT_TIMESTAMP - INTERVAL '1 days'),
(62, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 10, NULL),
(63, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 11, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(64, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 12, NULL),
(3, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 13, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 14, NULL),
(5, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 15, CURRENT_TIMESTAMP - INTERVAL '0 days'),
(6, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 16, NULL),
(7, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 17, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(8, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 18, NULL),
(9, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 19, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(10, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 20, NULL),
(53, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 1, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(54, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 2, NULL),
(55, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 3, CURRENT_TIMESTAMP - INTERVAL '1 days'),
(56, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 4, NULL),
(57, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 5, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(58, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 6, NULL),
(59, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 7, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(60, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 8, NULL),
(61, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 9, CURRENT_TIMESTAMP - INTERVAL '0 days'),
(62, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 10, NULL),
(63, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 11, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(64, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 12, NULL),
(3, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 13, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(4, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 14, NULL),
(5, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 15, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(6, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 16, NULL),
(7, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 17, CURRENT_TIMESTAMP - INTERVAL '1 days'),
(8, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 18, NULL),
(9, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 19, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(10, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 20, NULL),
(53, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 1, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(54, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 2, NULL),
(55, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 3, CURRENT_TIMESTAMP - INTERVAL '0 days'),
(56, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 4, NULL),
(57, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 5, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(58, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 6, NULL),
(59, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 7, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(60, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 8, NULL),
(61, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 9, CURRENT_TIMESTAMP - INTERVAL '6 days'),
(62, 'APPLICATION_REJECTED', 'Thông báo về hồ sơ ứng tuyển', 'Rất tiếc hồ sơ ứng tuyển của bạn chưa phù hợp ở thời điểm hiện tại. Hãy tiếp tục ứng tuyển các tin khác nhé!', 'APPLICATION', 10, NULL),
(63, 'JOB_APPROVED', 'Tin tuyển dụng đã được kiểm duyệt', 'Tin tuyển dụng của bạn đã được Quản trị viên duyệt và đang hiển thị công khai trên hệ sinh thái JobNest.', 'JOB', 11, CURRENT_TIMESTAMP - INTERVAL '1 days'),
(64, 'PROPOSAL_RECEIVED', 'Bạn nhận được đề xuất Freelance mới', 'Một sinh viên vừa nộp báo giá và đề xuất giải pháp cho dự án của bạn. Nhấp để xem chi tiết.', 'PROPOSAL', 12, NULL),
(3, 'REVIEW_RECEIVED', 'Bạn có một đánh giá mới', 'Đối tác vừa gửi đánh giá 5 sao kèm nhận xét uy tín về chất lượng công việc vừa qua.', 'REVIEW', 13, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(4, 'REMINDER_DEADLINE', 'Nhắc nhở hạn chót công việc', 'Thời hạn nộp đơn cho công việc bạn quan tâm sẽ kết thúc trong 24 giờ tới.', 'JOB', 14, NULL),
(5, 'APPLICATION_ACCEPTED', 'Hồ sơ ứng tuyển được chấp nhận', 'Chúc mừng bạn! Nhà tuyển dụng đã duyệt đơn ứng tuyển của bạn cho vị trí part-time.', 'APPLICATION', 15, CURRENT_TIMESTAMP - INTERVAL '5 days')
) AS v(user_id, type, title, body, target_type, target_id, read_at)
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = v.user_id
      AND n.type = v.type
      AND n.title = v.title
      AND n.target_type = v.target_type
      AND n.target_id = v.target_id
);

